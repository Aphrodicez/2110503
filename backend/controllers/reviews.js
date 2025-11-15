const Review = require('../models/Review');
const Campground = require('../models/Campground');
const Booking = require('../models/Booking');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/campgrounds/:campgroundId/reviews
// @access  Public
exports.getReviews = async (req, res) => {
    try {
        const query = Review.find(req.params.campgroundId ? { campground: req.params.campgroundId } : {})
            .populate({
                path: 'user',
                select: 'name email role'
            })
            .populate({
                path: 'campground',
                select: 'name province region'
            })
            .sort('-createdAt');

        const reviews = await query;
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Cannot fetch reviews' });
    }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate({ path: 'user', select: 'name email role' })
            .populate({ path: 'campground', select: 'name province region' });

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Cannot fetch review' });
    }
};

// @desc    Add review
// @route   POST /api/v1/campgrounds/:campgroundId/reviews
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const campgroundId = req.params.campgroundId;
        const campground = await Campground.findById(campgroundId);

        if (!campground) {
            return res.status(404).json({ success: false, message: 'Campground not found' });
        }

        if (req.user.role !== 'admin') {
            const hasBooking = await Booking.findOne({ campground: campgroundId, user: req.user.id });
            if (!hasBooking) {
                return res.status(400).json({ success: false, message: 'You must book this campground before leaving a review' });
            }
        }

        const existingReview = await Review.findOne({ campground: campgroundId, user: req.user.id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this campground' });
        }

        const review = await Review.create({
            rating: req.body.rating,
            comment: req.body.comment,
            campground: campgroundId,
            user: req.user.id
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Cannot create review' });
    }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this review' });
        }

        review.rating = req.body.rating ?? review.rating;
        review.comment = req.body.comment ?? review.comment;
        await review.save();

        review = await Review.findById(review._id)
            .populate({ path: 'user', select: 'name email role' })
            .populate({ path: 'campground', select: 'name province region' });

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Cannot update review' });
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Cannot delete review' });
    }
};
