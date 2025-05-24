const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  propertyType: {
    type: String,
    required: [true, "Property type is required"],
    enum: [
      "Apartment",
      "House",
      "Villa",
      "Land",
      "Commercial",
      "Other",
    ],
    trim: true,
  },
  location: {
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
      trim: true,
    },
    country: {
      type: String,
      default: "USA",
      trim: true,
    },
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  area: {
    type: Number,
    required: [true, "Area is required"],
    min: [0, "Area cannot be negative"],
  },
  bedrooms: {
    type: Number,
    min: [0, "Number of bedrooms cannot be negative"],
  },
  bathrooms: {
    type: Number,
    min: [0, "Number of bathrooms cannot be negative"],
  },
  features: [
    {
      type: String,
      trim: true,
    },
  ],
  description: {
    type: String,
    trim: true,
  },
  photos: [String],
  agent: {
    name: {
      type: String,
      required: [true, "Agent name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Agent email is required"],
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Agent phone number is required"],
      trim: true,
    },
  },
  status: {
    type: String,
    enum: ["For Sale", "For Rent", "Sold", "Rented", "Pending"],
    default: "For Sale",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
propertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Property", propertySchema);
