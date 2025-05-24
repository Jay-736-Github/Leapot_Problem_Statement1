import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container">
      <div className="text-center py-5">
        <h1 className="display-4 mb-4">Welcome to Voice Property Listing</h1>
        <p className="lead mb-4">
          Create property listings effortlessly using voice commands. Perfect
          for real estate agents on the go.
        </p>
        <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
          <Link
            to="/properties/add"
            className="btn btn-primary btn-lg px-4 gap-3"
          >
            Create New Listing
          </Link>
          <Link
            to="/properties"
            className="btn btn-outline-secondary btn-lg px-4"
          >
            View Properties
          </Link>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-md-4">
          <h3>Voice Input</h3>
          <p>
            Speak naturally to enter property details. Our system automatically
            converts your voice to text.
          </p>
        </div>
        <div className="col-md-4">
          <h3>Smart Validation</h3>
          <p>
            Automatic validation ensures all required information is captured
            accurately.
          </p>
        </div>
        <div className="col-md-4">
          <h3>Photo Management</h3>
          <p>
            Easily upload and manage property photos with drag-and-drop
            functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
