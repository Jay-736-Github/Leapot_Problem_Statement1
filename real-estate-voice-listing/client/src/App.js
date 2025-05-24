import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/theme.css";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./components/pages/Home";
import PropertyList from "./components/properties/PropertyList";
import PropertyForm from "./components/properties/PropertyForm";
import PropertyDetail from "./components/properties/PropertyDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <ToastContainer position="top-right" autoClose={3000} />
        <Header />
        <main className="container py-4 flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/add" element={<PropertyForm />} />
            <Route path="/properties/edit/:id" element={<PropertyForm />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
