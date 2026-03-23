// security.js - Node 24+ Compatible High Secure Express Middleware
const express = require("express");
const app = express();

// ===================== Security Packages =====================
const helmet = require("helmet");                  // Secure headers
const cors = require("cors");                      // Cross-origin protection
const hpp = require("hpp");                        // HTTP Parameter Pollution protection
const bodyParser = require("body-parser");        // Parse JSON / URL-encoded bodies
const { rateLimit } = require("express-rate-limit"); // Rate limiter
const connectDb = require("./db/connectdb");

connectDb()
// ===================== Rate Limiter =====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // max requests per window per IP
  standardHeaders: true,    // RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
});
app.use(limiter);

// ===================== Body Parser =====================
app.use(bodyParser.json({ limit: "10kb" }));              // limit JSON body to 10kb
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));

// ===================== Data Sanitization =====================
// Custom sanitize middleware for Node 24+ compatibility
function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return;
  for (let key in obj) {
    // Remove keys starting with $
    if (/^\$/.test(key)) delete obj[key];
    else if (typeof obj[key] === "object") sanitizeObject(obj[key]);
  }
}

app.use((req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
});



// Prevent HTTP Parameter Pollution
app.use(hpp());

// ===================== CORS =====================
const corsOptions = {
  origin: "*",              // Change to trusted domains in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ===================== Helmet =====================
app.use(helmet());         // Set security HTTP headers

// ===================== Optional: Force HTTPS =====================
// Uncomment this if using behind proxy / production HTTPS
/*
app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
*/


// ===================== Helmet =====================

app.use("/api", require("./routes/UserHandaler.route"))
app.use("/api", require("./routes/addCourses.route"))
app.use("/api", require("./routes/subject.route"))
app.use("/api", require("./routes/admin.route"))




// ===================== Export =====================
module.exports = app;