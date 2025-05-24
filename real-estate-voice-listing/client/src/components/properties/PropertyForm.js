import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import GuidedVoiceInput from "../GuidedVoiceInput";
import PhotoUpload from "../PhotoUpload";
import Select from "react-select";
import "./PropertyForm.css";

// Configure axios defaults
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:5001";
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Array of Indian states for dropdown
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Convert Indian states to options format for react-select
const stateOptions = indianStates.map((state) => ({
  value: state,
  label: state,
}));

const PropertyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const [formData, setFormData] = useState({
    propertyType: "",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    features: [],
    description: "",
    photos: [],
    agent: {
      name: "",
      email: "",
      phone: "",
    },
    status: "For Sale",
  });

  const [photos, setPhotos] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Initialize Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        processVoiceInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    // Fetch property data if editing
    if (id) {
      fetchPropertyData();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`/api/properties/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const propertyData = response.data.data;
        setFormData({
          propertyType: propertyData.propertyType || "",
          location: {
            address: propertyData.location?.address || "",
            city: propertyData.location?.city || "",
            state: propertyData.location?.state || "",
            zipCode: propertyData.location?.zipCode || "",
            country: propertyData.location?.country || "USA",
          },
          price: propertyData.price || "",
          area: propertyData.area || "",
          bedrooms: propertyData.bedrooms || "",
          bathrooms: propertyData.bathrooms || "",
          features: propertyData.features || [],
          description: propertyData.description || "",
          photos: propertyData.photos || [],
          agent: {
            name: propertyData.agent?.name || "",
            email: propertyData.agent?.email || "",
            phone: propertyData.agent?.phone || "",
          },
          status: propertyData.status || "For Sale",
        });
      } else {
        toast.error("Failed to fetch property data");
        navigate("/properties");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error(error.response?.data?.error || "Error fetching property");
      navigate("/properties");
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const processVoiceInput = (transcript) => {
    // Process property type
    const propertyTypeMatch = transcript.match(
      /property type is (apartment|house|villa|land|commercial)/i
    );
    if (propertyTypeMatch) {
      setFormData((prev) => ({
        ...prev,
        propertyType:
          propertyTypeMatch[1].charAt(0).toUpperCase() +
          propertyTypeMatch[1].slice(1),
      }));
    }

    // Process address
    const addressMatch = transcript.match(
      /address is (.+?)(city|state|zip|price|area)/i
    );
    if (addressMatch) {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address: addressMatch[1].trim(),
        },
      }));
    }

    // Process city
    const cityMatch = transcript.match(/city is (.+?)(state|zip|price|area)/i);
    if (cityMatch) {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          city: cityMatch[1].trim(),
        },
      }));
    }

    // Process price
    const priceMatch = transcript.match(/price is (\d+)/i);
    if (priceMatch) {
      setFormData((prev) => ({
        ...prev,
        price: parseInt(priceMatch[1]),
      }));
    }

    // Process area
    const areaMatch = transcript.match(/area is (\d+)/i);
    if (areaMatch) {
      setFormData((prev) => ({
        ...prev,
        area: parseInt(areaMatch[1]),
      }));
    }

    // Process bedrooms
    const bedroomsMatch = transcript.match(/(\d+) bedrooms?/i);
    if (bedroomsMatch) {
      setFormData((prev) => ({
        ...prev,
        bedrooms: parseInt(bedroomsMatch[1]),
      }));
    }

    // Process bathrooms
    const bathroomsMatch = transcript.match(/(\d+) bathrooms?/i);
    if (bathroomsMatch) {
      setFormData((prev) => ({
        ...prev,
        bathrooms: parseInt(bathroomsMatch[1]),
      }));
    }

    // Process description
    const descriptionMatch = transcript.match(/description is (.+)/i);
    if (descriptionMatch) {
      setFormData((prev) => ({
        ...prev,
        description: descriptionMatch[1].trim(),
      }));
    }
  };

  const handleVoiceInputComplete = (voiceData) => {
    // Update form data with voice input data
    setFormData((prev) => ({
      ...prev,
      propertyType: voiceData.propertyType || prev.propertyType,
      location: {
        address: voiceData.location?.address || prev.location.address,
        city: voiceData.location?.city || prev.location.city,
        state: voiceData.location?.state || prev.location.state,
        zipCode: voiceData.location?.zipCode || prev.location.zipCode,
        country: voiceData.location?.country || prev.location.country,
      },
      price: voiceData.price || prev.price,
      area: voiceData.area || prev.area,
      bedrooms: voiceData.bedrooms || prev.bedrooms,
      bathrooms: voiceData.bathrooms || prev.bathrooms,
      features: voiceData.features?.length ? voiceData.features : prev.features,
      description: voiceData.description || prev.description,
      agent: {
        name: voiceData.agent?.name || prev.agent.name,
        email: voiceData.agent?.email || prev.agent.email,
        phone: voiceData.agent?.phone || prev.agent.phone,
      },
      status: voiceData.status || prev.status,
    }));

    // Close the voice input modal
    setShowVoiceInput(false);

    // Show success message and prompt for photos if needed
    if (voiceData.photoConfirmation === "Yes") {
      toast.success(
        "Voice input completed! Please add photos and submit the form."
      );
      // Scroll to photo upload section
      setTimeout(() => {
        // Use standard DOM methods to find the photo upload section
        const allLabels = document.querySelectorAll(".form-group label");
        for (const label of allLabels) {
          if (label.textContent.includes("Property Photos")) {
            label.closest(".form-group").scrollIntoView({ behavior: "smooth" });
            break;
          }
        }
      }, 500);
    } else {
      toast.success(
        "Voice input completed! Please review and submit the form."
      );
    }
  };

  const handleVoiceInputCancel = () => {
    setShowVoiceInput(false);
  };

  // Update the handleInputChange function to handle react-select state change
  const handleInputChange = (e) => {
    // Handle react-select state change
    if (!e?.target) {
      // This is a react-select change event
      return;
    }

    const { name, value } = e.target;
    console.log("Input Change:", name, value); // Debug log

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle react-select state change
  const handleStateChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        state: selectedOption?.value || "",
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debug logs
    console.log("Form Data before submission:", formData);

    const errors = validateForm();
    console.log("Validation errors:", errors);

    if (Object.keys(errors).length === 0) {
      try {
        setLoading(true);

        // Create the request data object
        const requestData = {
          propertyType: formData.propertyType,
          price: formData.price,
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          description: formData.description,
          status: formData.status,
          location: {
            address: formData.location.address,
            city: formData.location.city,
            state: formData.location.state,
            zipCode: formData.location.zipCode,
            country: formData.location.country || "USA",
          },
          agent: {
            name: formData.agent.name,
            email: formData.agent.email,
            phone: formData.agent.phone,
          },
          features: formData.features,
        };

        // If there are photos, create FormData
        if (photos && photos.length > 0) {
          const formDataToSend = new FormData();

          // Append the JSON data
          formDataToSend.append("data", JSON.stringify(requestData));

          // Append photos
          photos.forEach((photo) => {
            formDataToSend.append("photos", photo);
          });

          console.log("Sending form data with photos:", requestData);

          const response = await axios({
            method: id ? "put" : "post",
            url: id ? `/api/properties/${id}` : "/api/properties",
            data: formDataToSend,
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          });

          if (response.data.success) {
            toast.success(
              `Property ${id ? "updated" : "created"} successfully!`
            );
            navigate("/properties");
          }
        } else {
          // If no photos, send JSON directly
          console.log("Sending JSON data:", requestData);

          const response = await axios({
            method: id ? "put" : "post",
            url: id ? `/api/properties/${id}` : "/api/properties",
            data: requestData,
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });

          if (response.data.success) {
            toast.success(
              `Property ${id ? "updated" : "created"} successfully!`
            );
            navigate("/properties");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMessage = error.response?.data?.error;
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg) => toast.error(msg));
        } else {
          toast.error(errorMessage || error.message || "Error saving property");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setValidationErrors(errors);
      Object.values(errors).forEach((error) => toast.error(error));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Property Type
    if (!formData.propertyType) {
      errors.propertyType = "Property type is required";
    }

    // Location
    if (!formData.location.address?.trim()) {
      errors["location.address"] = "Address is required";
    }
    if (!formData.location.city?.trim()) {
      errors["location.city"] = "City is required";
    }
    if (!formData.location.state?.trim()) {
      errors["location.state"] = "State is required";
    }
    if (!formData.location.zipCode?.trim()) {
      errors["location.zipCode"] = "Zip code is required";
    }

    // Price and Area
    if (!formData.price || formData.price <= 0) {
      errors.price = "Valid price is required";
    }
    if (!formData.area || formData.area <= 0) {
      errors.area = "Valid area is required";
    }

    // Agent Information
    if (!formData.agent.name?.trim()) {
      errors["agent.name"] = "Agent name is required";
    }
    if (!formData.agent.email?.trim()) {
      errors["agent.email"] = "Agent email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.agent.email)) {
      errors["agent.email"] = "Invalid email format";
    }
    if (!formData.agent.phone?.trim()) {
      errors["agent.phone"] = "Agent phone is required";
    }

    return errors;
  };

  const handlePhotoChange = (e) => {
    setPhotos([...e.target.files]);
  };

  // Update the formatPrice function to use INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (initialLoading) {
    return <div className="loading">Loading property data...</div>;
  }

  return (
    <div className="property-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{id ? "Edit" : "Add"} Property</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowVoiceInput(true)}
        >
          <i className="fas fa-microphone me-2"></i>
          Start Voice Input
        </button>
      </div>

      {showVoiceInput ? (
        <GuidedVoiceInput
          onComplete={handleVoiceInputComplete}
          onCancel={handleVoiceInputCancel}
        />
      ) : (
        <form onSubmit={handleSubmit} className="manual-input-form">
          <div className="form-group">
            <label>Property Type *</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className={validationErrors.propertyType ? "is-invalid" : ""}
            >
              <option value="">Select Type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>

              <option value="Villa">Villa</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
              <option value="Other">Other</option>
            </select>
            {validationErrors.propertyType && (
              <div className="invalid-feedback">
                {validationErrors.propertyType}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Location Information</h3>
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="location.address"
                value={formData.location?.address || ""}
                onChange={handleInputChange}
                className={
                  validationErrors["location.address"] ? "is-invalid" : ""
                }
              />
              {validationErrors["location.address"] && (
                <div className="invalid-feedback">
                  {validationErrors["location.address"]}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location?.city || ""}
                  onChange={handleInputChange}
                  className={
                    validationErrors["location.city"] ? "is-invalid" : ""
                  }
                />
                {validationErrors["location.city"] && (
                  <div className="invalid-feedback">
                    {validationErrors["location.city"]}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>State *</label>
                <Select
                  options={stateOptions}
                  value={
                    stateOptions.find(
                      (option) => option.value === formData.location?.state
                    ) || null
                  }
                  onChange={handleStateChange}
                  placeholder="Select State..."
                  isClearable
                  isSearchable
                  className={
                    validationErrors["location.state"]
                      ? "is-invalid-select"
                      : ""
                  }
                  classNamePrefix="state-select"
                />
                {validationErrors["location.state"] && (
                  <div className="invalid-feedback">
                    {validationErrors["location.state"]}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Zip Code *</label>
                <input
                  type="number"
                  name="location.zipCode"
                  value={formData.location?.zipCode || ""}
                  onChange={handleInputChange}
                  className={
                    validationErrors["location.zipCode"] ? "is-invalid" : ""
                  }
                  min="0"
                />
                {validationErrors["location.zipCode"] && (
                  <div className="invalid-feedback">
                    {validationErrors["location.zipCode"]}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={validationErrors.price ? "is-invalid" : ""}
                min="0"
              />
              {validationErrors.price && (
                <div className="invalid-feedback">{validationErrors.price}</div>
              )}
            </div>

            <div className="form-group">
              <label>Area (sq ft) *</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={validationErrors.area ? "is-invalid" : ""}
                min="0"
              />
              {validationErrors.area && (
                <div className="invalid-feedback">{validationErrors.area}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Amenities (comma-separated)</label>
            <input
              type="text"
              name="features"
              value={formData.features.join(", ")}
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "features",
                    value: e.target.value.split(",").map((item) => item.trim()),
                  },
                })
              }
            />
          </div>

          <div className="form-section">
            <h3>Agent Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="agent.name"
                  value={formData.agent?.name || ""}
                  onChange={handleInputChange}
                  className={validationErrors["agent.name"] ? "is-invalid" : ""}
                />
                {validationErrors["agent.name"] && (
                  <div className="invalid-feedback">
                    {validationErrors["agent.name"]}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="agent.email"
                  value={formData.agent?.email || ""}
                  onChange={handleInputChange}
                  className={
                    validationErrors["agent.email"] ? "is-invalid" : ""
                  }
                />
                {validationErrors["agent.email"] && (
                  <div className="invalid-feedback">
                    {validationErrors["agent.email"]}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="agent.phone"
                  value={formData.agent?.phone || ""}
                  onChange={handleInputChange}
                  className={
                    validationErrors["agent.phone"] ? "is-invalid" : ""
                  }
                />
                {validationErrors["agent.phone"] && (
                  <div className="invalid-feedback">
                    {validationErrors["agent.phone"]}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="form-group">
            <label>Property Photos</label>
            <PhotoUpload
              onPhotosChange={(uploadedPhotos) => {
                console.log("Photos changed:", uploadedPhotos);
                setPhotos(uploadedPhotos);
              }}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Saving..." : id ? "Update" : "Create"} Property
          </button>
        </form>
      )}
    </div>
  );
};

export default PropertyForm;
