const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });

const campgrounds = require("./routes/campgrounds");
const bookings = require("./routes/bookings");
const auth = require("./routes/auth");
const paymentRoutes = require("./routes/paymentRoutes");
const reviews = require("./routes/reviews");

connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.set("query parser", "extended");

app.use(express.json());
// Sanitize inbound data without triggering Express 5's getter-only req.query setter
app.use((req, res, next) => {
  ["body", "params", "headers"].forEach((key) => {
    if (req[key]) {
      req[key] = mongoSanitize.sanitize(req[key]);
    }
  });
  if (req.query) {
    const sanitizedQuery = mongoSanitize.sanitize({ ...req.query });
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, sanitizedQuery);
  }
  next();
});
//Set security headers
app.use(helmet());
//Prevent XSS attacks
app.use(xss());
//Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 mins
  max: 100,
});
app.use(limiter);

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Campground Booking API",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/campgrounds", campgrounds);
app.use("/api/v1/bookings", bookings);
app.use("/api/v1/reviews", reviews);
app.use("/api/v1/auth", auth);
app.use("/api/v1/payments", paymentRoutes);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});

process.on("unhandledRejection", (error) => {
  console.error("Error:", error.message);
  server.close(() => {
    process.exit(1);
  });
});
