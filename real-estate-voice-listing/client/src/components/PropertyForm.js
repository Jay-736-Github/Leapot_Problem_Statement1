import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoiceInput from "./VoiceInput";
import PhotoUpload from "./PhotoUpload";
import "./PropertyForm.css";

// Helper function to process price with Indian currency terms
const processIndianPrice = (input) => {
  const text = input.toLowerCase().trim();

  // Extract the numeric part
  const numericMatch = text.match(/\d+(\.\d+)?/);
  if (!numericMatch) return "";

  const numericValue = parseFloat(numericMatch[0]);

  // Check for currency terms
  if (text.includes("lakh") || text.includes("lac")) {
    // 1 Lakh = 100,000
    return (numericValue * 100000).toString();
  } else if (text.includes("crore") || text.includes("cr")) {
    // 1 Crore = 10,000,000
    return (numericValue * 10000000).toString();
  } else {
    // No currency term found, return as is
    return numericValue.toString();
  }
};

const PropertyForm = () => {
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    propertyType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    price: "",
    squareFeet: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    amenities: [],
    photos: [],
  });

  const [currentField, setCurrentField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleVoiceInput = (transcript) => {
    if (!currentField) return;

    // Process voice input based on current field
    let processedValue = transcript.trim();

    switch (currentField) {
      case "price":
        processedValue = processIndianPrice(transcript);
        break;
      case "squareFeet":
        processedValue = transcript.replace(/[^0-9]/g, "");
        break;
      case "amenities":
        processedValue = transcript.split(",").map((item) => item.trim());
        break;
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [currentField]: processedValue,
    }));
  };

  const handleInputFocus = (field) => {
    setCurrentField(field);
    setIsListening(true);
  };

  const handleInputBlur = () => {
    setIsListening(false);
    setCurrentField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch("/api/properties", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Property listing created successfully!");
          // Reset form
          setFormData({
            propertyType: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            price: "",
            squareFeet: "",
            bedrooms: "",
            bathrooms: "",
            description: "",
            amenities: [],
            photos: [],
          });
        } else {
          throw new Error("Failed to create property listing");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to create property listing");
      }
    } else {
      setValidationErrors(errors);
      toast.error("Please fill in all required fields");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.propertyType)
      errors.propertyType = "Property type is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.zipCode) errors.zipCode = "Zip code is required";
    if (!formData.price) errors.price = "Price is required";
    if (!formData.squareFeet) errors.squareFeet = "Square footage is required";
    return errors;
  };

  return (
    <div className="property-form">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Create Property Listing</h2>
      <VoiceInput
        isListening={isListening}
        onTranscriptUpdate={handleVoiceInput}
      />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Property Type</label>
          <select
            value={formData.propertyType}
            onChange={(e) =>
              setFormData({ ...formData, propertyType: e.target.value })
            }
            onFocus={() => handleInputFocus("propertyType")}
            onBlur={handleInputBlur}
          >
            <option value="">Select Type</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Commercial">Commercial</option>
            <option value="Land">Land</option>
          </select>
          {validationErrors.propertyType && (
            <span className="error">{validationErrors.propertyType}</span>
          )}
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            onFocus={() => handleInputFocus("address")}
            onBlur={handleInputBlur}
          />
          {validationErrors.address && (
            <span className="error">{validationErrors.address}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              onFocus={() => handleInputFocus("city")}
              onBlur={handleInputBlur}
            />
            {validationErrors.city && (
              <span className="error">{validationErrors.city}</span>
            )}
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              onFocus={() => handleInputFocus("state")}
              onBlur={handleInputBlur}
            />
            {validationErrors.state && (
              <span className="error">{validationErrors.state}</span>
            )}
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              onFocus={() => handleInputFocus("zipCode")}
              onBlur={handleInputBlur}
            />
            {validationErrors.zipCode && (
              <span className="error">{validationErrors.zipCode}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              onFocus={() => handleInputFocus("price")}
              onBlur={handleInputBlur}
              placeholder="You can say '35 Lakh' or '2 Crore'"
            />
            <small className="form-text text-muted">
              Voice input supports terms like "Lakh" and "Crore"
            </small>
            {validationErrors.price && (
              <span className="error">{validationErrors.price}</span>
            )}
          </div>

          <div className="form-group">
            <label>Square Feet</label>
            <input
              type="number"
              value={formData.squareFeet}
              onChange={(e) =>
                setFormData({ ...formData, squareFeet: e.target.value })
              }
              onFocus={() => handleInputFocus("squareFeet")}
              onBlur={handleInputBlur}
            />
            {validationErrors.squareFeet && (
              <span className="error">{validationErrors.squareFeet}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Bedrooms</label>
            <input
              type="number"
              value={formData.bedrooms}
              onChange={(e) =>
                setFormData({ ...formData, bedrooms: e.target.value })
              }
              onFocus={() => handleInputFocus("bedrooms")}
              onBlur={handleInputBlur}
            />
          </div>

          <div className="form-group">
            <label>Bathrooms</label>
            <input
              type="number"
              value={formData.bathrooms}
              onChange={(e) =>
                setFormData({ ...formData, bathrooms: e.target.value })
              }
              onFocus={() => handleInputFocus("bathrooms")}
              onBlur={handleInputBlur}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            onFocus={() => handleInputFocus("description")}
            onBlur={handleInputBlur}
          />
        </div>

        <div className="form-group">
          <label>Amenities (comma-separated)</label>
          <input
            type="text"
            value={formData.amenities.join(", ")}
            onChange={(e) =>
              setFormData({ ...formData, amenities: e.target.value.split(",") })
            }
            onFocus={() => handleInputFocus("amenities")}
            onBlur={handleInputBlur}
          />
        </div>

        <button type="submit" className="submit-button">
          Create Listing
        </button>
      </form>
    </div>
  );
};

export default PropertyForm;
