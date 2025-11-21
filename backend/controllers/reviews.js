const Review = require("../models/Review");
const Campground = require("../models/Campground");

// @desc    Get reviews (optionally by campground)
// @route   GET /api/v1/reviews
// @route   GET /api/v1/campgrounds/:campgroundId/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const filter = req.params.campgroundId
      ? { campground: req.params.campgroundId }
      : {};

    let query = Review.find(filter)
      .populate({ path: "user", select: "name" })
      .sort("-createdAt");

    if (!req.params.campgroundId) {
      query = query.populate({ path: "campground", select: "name region" });
    }

    const reviews = await query;

    let meta;
    if (req.params.campgroundId) {
      const campground = await Campground.findById(
        req.params.campgroundId
      ).select("averageRating reviewsCount");

      if (!campground) {
        return res.status(404).json({
          success: false,
          message: `No campground with the id of ${req.params.campgroundId}`,
        });
      }

      meta = {
        campgroundId: req.params.campgroundId,
        averageRating: Number((campground.averageRating || 0).toFixed(2)),
        reviewsCount: campground.reviewsCount || 0,
      };
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      meta,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot fetch reviews" });
  }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({ path: "campground", select: "name" })
      .populate({ path: "user", select: "name" });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `No review with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot fetch review" });
  }
};

// @desc    Create review for a campground
// @route   POST /api/v1/campgrounds/:campgroundId/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.campgroundId);

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `No campground with the id of ${req.params.campgroundId}`,
      });
    }

    const payload = {
      rating: req.body.rating,
      comment: req.body.comment,
      campground: req.params.campgroundId,
      user: req.user.id,
    };

    const review = await Review.create(payload);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this campground",
      });
    }
    res.status(500).json({ success: false, message: "Cannot create review" });
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `No review with the id of ${req.params.id}`,
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    const updates = {};
    if (typeof req.body.rating !== "undefined") {
      updates.rating = req.body.rating;
    }
    if (typeof req.body.comment !== "undefined") {
      updates.comment = req.body.comment;
    }

    review = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot update review" });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `No review with the id of ${req.params.id}`,
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Cannot delete review" });
  }
};
