const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");


const app = express();


// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


// Request logger
app.use(morgan("dev"));


// Body parser
app.use(express.json());


// Cookie parser
app.use(cookieParser());


// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FEDARB API is running 🚀",
  });
});



module.exports = app;



