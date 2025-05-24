const Property = require("../models/Property");
const path = require("path");
const fs = require("fs");

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Public
exports.createProperty = async (req, res, next) => {
  try {
    console.log("Received form data:", req.body); // Debug log

    // Extract location data
    const location = {
      address: req.body["location.address"] || req.body.location?.address,
      city: req.body["location.city"] || req.body.location?.city,
      state: req.body["location.state"] || req.body.location?.state,
      zipCode: req.body["location.zipCode"] || req.body.location?.zipCode,
      country:
        req.body["location.country"] || req.body.location?.country || "USA",
    };

    // Extract agent data
    const agent = {
      name: req.body["agent.name"] || req.body.agent?.name,
      email: req.body["agent.email"] || req.body.agent?.email,
      phone: req.body["agent.phone"] || req.body.agent?.phone,
    };

    // Create property data object
    const propertyData = {
      propertyType: req.body.propertyType,
      location: location,
      price: parseFloat(req.body.price),
      area: parseFloat(req.body.area),
      bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : undefined,
      bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : undefined,
      features: req.body.features || [],
      description: req.body.description,
      agent: agent,
      status: req.body.status || "For Sale",
    };

    // Handle photos if they exist
    if (req.files && req.files.length > 0) {
      propertyData.photos = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    console.log("Processed property data:", propertyData); // Debug log

    // Create property
    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (err) {
    console.error("Error creating property:", err); // Debug log
    next(err);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Public
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    // Extract location data
    const location = {
      address: req.body["location.address"] || req.body.location?.address,
      city: req.body["location.city"] || req.body.location?.city,
      state: req.body["location.state"] || req.body.location?.state,
      zipCode: req.body["location.zipCode"] || req.body.location?.zipCode,
      country:
        req.body["location.country"] || req.body.location?.country || "USA",
    };

    // Extract agent data
    const agent = {
      name: req.body["agent.name"] || req.body.agent?.name,
      email: req.body["agent.email"] || req.body.agent?.email,
      phone: req.body["agent.phone"] || req.body.agent?.phone,
    };

    // Create property data object
    const propertyData = {
      propertyType: req.body.propertyType,
      location: location,
      price: parseFloat(req.body.price),
      area: parseFloat(req.body.area),
      bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : undefined,
      bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : undefined,
      features: req.body.features || property.features,
      description: req.body.description,
      agent: agent,
      status: req.body.status || property.status,
    };

    // Handle photos if they exist
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((file) => `/uploads/${file.filename}`);
      propertyData.photos = [...(property.photos || []), ...newPhotos];
    }

    // Update property
    property = await Property.findByIdAndUpdate(req.params.id, propertyData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Public
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    // Delete associated photos from the server
    if (property.photos && property.photos.length > 0) {
      property.photos.forEach((photo) => {
        const photoPath = path.join(__dirname, "..", photo);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
