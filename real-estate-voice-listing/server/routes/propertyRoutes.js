const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const Property = require("../models/Property");

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter function to accept only images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to parse JSON data from FormData
const parseFormData = (req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    try {
      if (req.body.data) {
        const jsonData = JSON.parse(req.body.data);
        req.body = { ...jsonData };
      }
    } catch (error) {
      console.error("Error parsing form data:", error);
    }
  }
  next();
};

// Error handling middleware
const handleErrors = (err, req, res, next) => {
  console.error("Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: "File upload error: " + err.message,
    });
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages,
    });
  }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
};

// Define routes
router
  .route("/")
  .get(getProperties)
  .post(upload.array("photos", 10), parseFormData, createProperty);

router
  .route("/:id")
  .get(getProperty)
  .put(upload.array("photos", 10), parseFormData, updateProperty)
  .delete(deleteProperty);

// Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single property
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create property
router.post("/", async (req, res) => {
  const property = new Property(req.body);
  try {
    const newProperty = await property.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update property
router.patch("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    Object.assign(property, req.body);
    property.updatedAt = Date.now();
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete property
router.delete("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    await property.remove();
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply error handling middleware
router.use(handleErrors);

module.exports = router;
