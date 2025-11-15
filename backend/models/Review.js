const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        required: [true, 'Please add a review comment'],
        trim: true
    },
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

ReviewSchema.index({ campground: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
