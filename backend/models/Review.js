const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please add a rating between 1 and 5"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating can not be more than 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },
    comment: {
      type: String,
      required: [true, "Please add a review comment"],
      maxlength: [1000, "Comment can not be more than 1000 characters"],
      trim: true,
    },
    campground: {
      type: mongoose.Schema.ObjectId,
      ref: "Campground",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ campground: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAggregate = async function (campgroundId) {
  if (!campgroundId) return;

  const stats = await this.aggregate([
    { $match: { campground: campgroundId } },
    {
      $group: {
        _id: "$campground",
        averageRating: { $avg: "$rating" },
        reviewsCount: { $sum: 1 },
      },
    },
  ]);

  const summary = stats[0];

  try {
    await this.model("Campground").findByIdAndUpdate(
      campgroundId,
      summary
        ? {
            averageRating: Number(summary.averageRating.toFixed(2)),
            reviewsCount: summary.reviewsCount,
          }
        : { averageRating: 0, reviewsCount: 0 }
    );
  } catch (error) {
    console.error("Failed to update campground aggregate rating", error);
  }
};

async function updateAggregate(doc) {
  if (doc && doc.campground) {
    try {
      await doc.constructor.calculateAggregate(doc.campground);
    } catch (error) {
      console.error("Failed to recalculate campground rating", error);
    }
  }
}

ReviewSchema.post("save", updateAggregate);
ReviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  updateAggregate
);
ReviewSchema.post("findOneAndDelete", updateAggregate);
ReviewSchema.post("findOneAndUpdate", updateAggregate);

module.exports = mongoose.model("Review", ReviewSchema);
