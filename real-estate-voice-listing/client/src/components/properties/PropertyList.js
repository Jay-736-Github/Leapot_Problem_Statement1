import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./PropertyList.css";

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/properties", {
        withCredentials: true,
      });

      if (response.data.success) {
        setProperties(response.data.data);
      } else {
        throw new Error(response.data.error || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch properties"
      );
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch properties"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await axios.delete(`/api/properties/${id}`, {
          withCredentials: true,
        });

        if (response.data.success) {
          toast.success("Property deleted successfully");
          fetchProperties(); // Refresh the list
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        toast.error(
          error.response?.data?.error ||
            error.message ||
            "Failed to delete property"
        );
      }
    }
  };

  // Add a function to download property data as JSON
  const downloadPropertyAsJson = (property) => {
    // Create a JSON string from the property data
    const propertyJson = JSON.stringify(property, null, 2);

    // Create a blob with the JSON data
    const blob = new Blob([propertyJson], { type: "application/json" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = `property-${property._id}.json`;

    // Append the link to the body
    document.body.appendChild(link);

    // Click the link to trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Property data downloaded as JSON");
  };

  if (loading) {
    return <div className="loading">Loading properties...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (properties.length === 0) {
    return (
      <div className="no-properties">
        <h2>No properties found</h2>
        <Link to="/properties/add" className="add-property-btn">
          Add Property
        </Link>
      </div>
    );
  }

  return (
    <div className="property-list">
      <div className="property-list-header">
        <h2>Properties</h2>
        <Link to="/properties/add" className="add-property-btn">
          Add Property
        </Link>
      </div>

      <div className="property-grid">
        {properties.map((property) => (
          <div key={property._id} className="property-card">
            <div className="property-image">
              {property.photos && property.photos.length > 0 ? (
                <img
                  src={`http://localhost:5001${property.photos[0]}`}
                  alt={property.location.address}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            <div className="property-info">
              <h3>{property.propertyType}</h3>
              <p className="address">{property.location.address}</p>
              <p className="city-state">
                {property.location.city}, {property.location.state}
              </p>
              <p className="price">₹{property.price.toLocaleString("en-IN")}</p>
              <div className="property-details">
                <span>{property.bedrooms} beds</span>
                <span>{property.bathrooms} baths</span>
                <span>{property.area} sqft</span>
              </div>
              <div className="property-status">
                <span
                  className={`status-badge ${property.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {property.status}
                </span>
              </div>
            </div>
            <div className="property-actions">
              <Link
                to={`/properties/edit/${property._id}`}
                className="edit-btn"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(property._id)}
                className="delete-btn"
              >
                Delete
              </button>
              <button
                onClick={() => downloadPropertyAsJson(property)}
                className="download-btn"
              >
                Download JSON
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
