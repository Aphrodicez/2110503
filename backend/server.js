const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const campgrounds = require('./routes/campgrounds');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

app.set('query parser', 'extended');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/auth', auth);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${port}`);
});

process.on('unhandledRejection', (error) => {
    console.error('Error:', error.message);
    server.close(() => {
        process.exit(1);
    });
});