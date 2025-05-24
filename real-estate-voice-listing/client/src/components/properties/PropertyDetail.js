import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/properties/${id}`
        );
        setProperty(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch property details");
        setLoading(false);
        console.error("Error fetching property:", err);
      }
    };

    fetchProperty();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(`http://localhost:5000/api/properties/${id}`);
        navigate("/properties");
      } catch (err) {
        setError("Failed to delete property");
        console.error("Error deleting property:", err);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || "Property not found"}
        <div className="mt-3">
          <Link to="/properties" className="btn btn-primary">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="property-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          {property.propertyType} in {property.location.city}
        </h2>
        <div>
          <Link to="/properties" className="btn btn-outline-secondary me-2">
            Back to List
          </Link>
          <Link to={`/properties/${id}/edit`} className="btn btn-primary me-2">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Property Images */}
          <div className="property-images mb-4">
            <div className="main-image mb-3">
              {property.photos && property.photos.length > 0 ? (
                <img
                  src={`http://localhost:5001${property.photos[activeImage]}`}
                  alt={`${property.propertyType} main view`}
                  className="img-fluid rounded"
                  style={{ width: "100%", height: "400px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="bg-light d-flex justify-content-center align-items-center rounded"
                  style={{ height: "400px" }}
                >
                  <i className="fas fa-home fa-5x text-secondary"></i>
                </div>
              )}
            </div>

            {property.photos && property.photos.length > 1 && (
              <div className="thumbnail-images d-flex overflow-auto">
                {property.photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`thumbnail-image me-2 ${
                      index === activeImage ? "border border-primary" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={`http://localhost:5001${photo}`}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        width: "100px",
                        height: "75px",
                        objectFit: "cover",
                      }}
                      className="rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="property-info mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Property Details</h4>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Price:</strong> {formatPrice(property.price)}
                    </p>
                    <p className="mb-1">
                      <strong>Status:</strong> {property.status}
                    </p>
                    <p className="mb-1">
                      <strong>Area:</strong> {property.area} sq.ft
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Bedrooms:</strong> {property.bedrooms}
                    </p>
                    <p className="mb-1">
                      <strong>Bathrooms:</strong> {property.bathrooms}
                    </p>
                  </div>
                </div>

                <h5>Description</h5>
                <p>{property.description}</p>

                {property.features && property.features.length > 0 && (
                  <div className="mt-3">
                    <h5>Features</h5>
                    <ul className="list-group list-group-flush">
                      {property.features.map((feature, index) => (
                        <li key={index} className="list-group-item">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Location Info */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Location</h4>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <i className="fas fa-map-marker-alt me-2"></i>
                {property.location.address}
              </p>
              <p className="mb-1">
                {property.location.city}, {property.location.state}{" "}
                {property.location.zipCode}
              </p>
              <p className="mb-3">{property.location.country}</p>

              {/* Placeholder for map, in a real app you might integrate Google Maps here */}
              <div className="bg-light rounded p-3 text-center">
                <i className="fas fa-map fa-3x text-secondary mb-2"></i>
                <p className="mb-0">Map would be displayed here</p>
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Contact Agent</h4>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <i className="fas fa-user-circle fa-5x text-secondary"></i>
              </div>
              <h5 className="text-center">{property.agent.name}</h5>
              <div className="mt-3">
                <p className="mb-2">
                  <i className="fas fa-envelope me-2"></i>
                  <a href={`mailto:${property.agent.email}`}>
                    {property.agent.email}
                  </a>
                </p>
                <p className="mb-0">
                  <i className="fas fa-phone-alt me-2"></i>
                  <a href={`tel:${property.agent.phone}`}>
                    {property.agent.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
