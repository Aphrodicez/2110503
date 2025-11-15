const Campground = require('../models/Campground.js');
const Booking = require('../models/Booking.js');

// @desc    Get all campgrounds
// @route   GET /api/v1/campgrounds
// @access  Public
exports.getCampgrounds = async (req, res, next) => {
    try {
        let query;

        const reqQuery = { ...req.query };
        const removedFields = ['select', 'sort', 'page', 'limit'];
        removedFields.forEach(param => { delete reqQuery[param]; });
        console.log(reqQuery);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Campground.find(JSON.parse(queryStr)).populate('bookings');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Campground.countDocuments();

        query = query.skip(startIndex).limit(limit);

        const campgrounds = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({ success: true, count: campgrounds.length, pagination, data: campgrounds });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single campground
// @route   GET /api/v1/campgrounds/:id
// @access  Public
exports.getCampground = async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: campground });
    } catch (error) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new campground
// @route   POST /api/v1/campgrounds
// @access  Private
exports.createCampground = async (req, res) => {
    const campground = await Campground.create(req.body);
    res.status(200).json({ success: true, data: campground });
};

// @desc    Update campground
// @route   PUT /api/v1/campgrounds/:id
// @access  Private
exports.updateCampground = async (req, res) => {
    try {
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!campground) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: campground });
    } catch (error) {
        res.status(400).json({ success: false });
    }
};

// @desc    Delete campground
// @route   DELETE /api/v1/campgrounds/:id
// @access  Private
exports.deleteCampground = async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            return res.status(400).json({ success: false, message: `Campground not found with id of ${req.params.id}` });
        }
        await Booking.deleteMany({ campground: campground._id });
        await Campground.deleteOne({ _id: req.params.id });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};