import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "./GuidedVoiceInput.css"; // We'll create this file next

// Format price in Indian number system with lakhs and crores notation
const formatIndianPrice = (price) => {
  const numPrice = parseFloat(price);

  // Format with Indian number system (commas)
  const formattedPrice = numPrice.toLocaleString("en-IN");

  // Add lakhs/crores notation for better readability
  if (numPrice >= 10000000) {
    // Convert to crores (1 crore = 10,000,000)
    const crores = (numPrice / 10000000).toFixed(2);
    return `${formattedPrice} (${crores} Cr)`;
  } else if (numPrice >= 100000) {
    // Convert to lakhs (1 lakh = 100,000)
    const lakhs = (numPrice / 100000).toFixed(2);
    return `${formattedPrice} (${lakhs} L)`;
  }

  return formattedPrice;
};

// Array of Indian states for validation
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

const GuidedVoiceInput = ({ onComplete, onCancel }) => {
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [recognition, setRecognition] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [formData, setFormData] = useState({
    propertyType: "",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    features: [],
    agent: {
      name: "",
      email: "",
      phone: "",
    },
    status: "For Sale",
  });

  const steps = [
    {
      field: "propertyType",
      question: "What type of property is this?",
      hint: "Say one of: Apartment, House, Villa, Commercial, or Land",
      processValue: (transcript) => {
        const types = ["apartment", "house", "villa", "commercial", "land"];
        const matchedType = types.find((type) =>
          transcript.toLowerCase().includes(type)
        );
        return matchedType
          ? matchedType.charAt(0).toUpperCase() + matchedType.slice(1)
          : transcript;
      },
      updateForm: (value) => ({
        ...formData,
        propertyType: value,
      }),
    },
    {
      field: "address",
      question: "What is the street address of the property?",
      hint: "Include street number and name",
      processValue: (transcript) => transcript.trim(),
      updateForm: (value) => ({
        ...formData,
        location: {
          ...formData.location,
          address: value,
        },
      }),
    },
    {
      field: "city",
      question: "In which city is the property located?",
      processValue: (transcript) => transcript.trim(),
      updateForm: (value) => ({
        ...formData,
        location: {
          ...formData.location,
          city: value,
        },
      }),
    },
    {
      field: "state",
      question: "In which state is the property located?",
      hint: "Say one of the Indian states, e.g., Maharashtra, Karnataka, etc.",
      processValue: (transcript) => {
        const input = transcript.trim();

        // Try to find an exact match first
        const exactMatch = indianStates.find(
          (state) => state.toLowerCase() === input.toLowerCase()
        );

        if (exactMatch) return exactMatch;

        // If no exact match, try partial match
        const partialMatch = indianStates.find(
          (state) =>
            input.toLowerCase().includes(state.toLowerCase()) ||
            state.toLowerCase().includes(input.toLowerCase())
        );

        return partialMatch || input;
      },
      updateForm: (value) => ({
        ...formData,
        location: {
          ...formData.location,
          state: value,
        },
      }),
    },
    {
      field: "zipCode",
      question: "What is the zip code of the property?",
      hint: "Numbers only",
      processValue: (transcript) => transcript.replace(/[^0-9]/g, ""),
      updateForm: (value) => ({
        ...formData,
        location: {
          ...formData.location,
          zipCode: value,
        },
      }),
    },
    {
      field: "price",
      question: "What is the price of the property?",
      hint: "You can say numbers with Indian currency terms like '35 Lakh' or '2 Crore'",
      processValue: (transcript) => {
        const input = transcript.toLowerCase().trim();

        // Extract the numeric part
        const numericMatch = input.match(/\d+(\.\d+)?/);
        if (!numericMatch) return "";

        const numericValue = parseFloat(numericMatch[0]);

        // Check for currency terms
        if (input.includes("lakh") || input.includes("lac")) {
          // 1 Lakh = 100,000
          return (numericValue * 100000).toString();
        } else if (input.includes("crore") || input.includes("cr")) {
          // 1 Crore = 10,000,000
          return (numericValue * 10000000).toString();
        } else {
          // No currency term found, return as is
          return numericValue.toString();
        }
      },
      updateForm: (value) => ({
        ...formData,
        price: value,
      }),
    },
    {
      field: "area",
      question: "How many square feet is the property?",
      hint: "Numbers only",
      processValue: (transcript) => transcript.replace(/[^0-9.]/g, ""),
      updateForm: (value) => ({
        ...formData,
        area: value,
      }),
    },
    {
      field: "bedrooms",
      question: "How many bedrooms does the property have?",
      hint: "Numbers only",
      processValue: (transcript) => transcript.replace(/[^0-9]/g, ""),
      updateForm: (value) => ({
        ...formData,
        bedrooms: value,
      }),
    },
    {
      field: "bathrooms",
      question: "How many bathrooms does the property have?",
      hint: "Numbers only",
      processValue: (transcript) => transcript.replace(/[^0-9]/g, ""),
      updateForm: (value) => ({
        ...formData,
        bathrooms: value,
      }),
    },
    {
      field: "description",
      question: "Please provide a brief description of the property.",
      hint: "Include key features and condition",
      processValue: (transcript) => transcript.trim(),
      updateForm: (value) => ({
        ...formData,
        description: value,
      }),
    },
    {
      field: "features",
      question: "What amenities does the property have?",
      hint: "List amenities separated by commas (e.g., pool, garage, garden)",
      processValue: (transcript) =>
        transcript.split(",").map((item) => item.trim()),
      updateForm: (value) => ({
        ...formData,
        features: value,
      }),
    },
    {
      field: "agent.name",
      question: "What is the agent's name?",
      hint: "Full name of the listing agent",
      processValue: (transcript) => transcript.trim(),
      updateForm: (value) => ({
        ...formData,
        agent: {
          ...formData.agent,
          name: value,
        },
      }),
    },
    {
      field: "agent.email",
      question: "What is the agent's email address?",
      hint: "Format: name@example.com",
      processValue: (transcript) => transcript.trim().toLowerCase(),
      updateForm: (value) => ({
        ...formData,
        agent: {
          ...formData.agent,
          email: value,
        },
      }),
    },
    {
      field: "agent.phone",
      question: "What is the agent's phone number?",
      hint: "Numbers only",
      processValue: (transcript) => transcript.replace(/[^0-9]/g, ""),
      updateForm: (value) => ({
        ...formData,
        agent: {
          ...formData.agent,
          phone: value,
        },
      }),
    },
    {
      field: "photoConfirmation",
      question: "Would you like to add photos to this listing?",
      hint: "Say 'Yes' if you want to add photos in the next step, or 'No' to skip",
      processValue: (transcript) => {
        const response = transcript.trim().toLowerCase();
        return response.includes("yes") ? "Yes" : "No";
      },
      updateForm: (value) => formData, // This doesn't update form data, just for flow control
    },
  ];

  // Initialize speech recognition with proper cleanup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = handleRecognitionResult;
      recognitionInstance.onerror = handleRecognitionError;
      recognitionInstance.onend = handleRecognitionEnd;

      setRecognition(recognitionInstance);
    } else {
      toast.error("Speech recognition is not supported in your browser");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // Handle recognition results
  const handleRecognitionResult = useCallback(
    (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      setManualInput(transcript);

      // Process final results immediately
      if (event.results[event.results.length - 1].isFinal) {
        handleResponse(transcript);
      }
    },
    [currentStep]
  );

  // Handle recognition errors
  const handleRecognitionError = useCallback((event) => {
    console.error("Speech recognition error:", event.error);
    toast.error(`Speech recognition error: ${event.error}. Please try again.`);
    setIsListening(false);
  }, []);

  // Handle recognition end
  const handleRecognitionEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  // Process input and update form
  const handleResponse = useCallback(
    (input) => {
      if (currentStep >= 0 && currentStep < steps.length) {
        const step = steps[currentStep];
        const processedValue = step.processValue(input);

        if (!processedValue && step.field !== "features") {
          toast.error(`Please provide a valid ${step.field}`);
          return false;
        }

        const updatedFormData = step.updateForm(processedValue);
        setFormData(updatedFormData);
        return true;
      }
      return false;
    },
    [currentStep, steps, formData]
  );

  // Start recording
  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        toast.info("Listening...", { autoClose: 1000 });
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Error starting voice input. Please try again.");
      }
    }
  }, [recognition, isListening]);

  // Stop recording
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  // Handle manual input changes
  const handleManualInputChange = useCallback((e) => {
    setManualInput(e.target.value);
  }, []);

  // Handle manual input submission
  const handleManualSubmit = useCallback(() => {
    if (manualInput.trim()) {
      handleResponse(manualInput.trim());
    }
  }, [manualInput, handleResponse]);

  // Handle next step
  const handleNext = useCallback(() => {
    // Stop any ongoing recording
    if (isListening) {
      stopListening();
    }

    // Get current step data
    const currentStepData = steps[currentStep];

    // If we have manual input, process it directly
    if (manualInput.trim()) {
      const processedValue = currentStepData.processValue(manualInput.trim());
      const updatedFormData = currentStepData.updateForm(processedValue);
      setFormData(updatedFormData);
    }

    // Check if we have a value after processing
    const fieldValue = currentStepData?.field.includes(".")
      ? formData[currentStepData.field.split(".")[0]][
          currentStepData.field.split(".")[1]
        ]
      : formData[currentStepData.field];

    if (
      !fieldValue &&
      !manualInput.trim() &&
      currentStepData?.field !== "features"
    ) {
      toast.error(`Please provide a value for ${currentStepData.field}`);
      return;
    }

    // Move to next step or complete
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setManualInput("");
    } else {
      onComplete(formData);
      toast.success("Form completed successfully!");
    }
  }, [
    currentStep,
    isListening,
    manualInput,
    formData,
    steps,
    stopListening,
    onComplete,
  ]);

  // Start session
  const startSession = useCallback(() => {
    setHasStarted(true);
    setCurrentStep(0);
  }, []);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setManualInput("");
    }
  }, [currentStep]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    stopListening();
    onCancel();
  }, [stopListening, onCancel]);

  return (
    <div className="guided-voice-input animate__animated animate__fadeIn">
      <div className="card shadow-lg border-0">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4 text-primary fw-bold">
            <i className="fas fa-microphone me-2"></i>
            Voice-Guided Property Input
          </h3>

          {!hasStarted ? (
            <div className="text-center p-4 welcome-screen animate__animated animate__fadeIn">
              <h4 className="text-primary mb-4">
                Welcome to Voice-Guided Property Input
              </h4>
              <div className="mb-4">
                <p className="lead text-muted">
                  I will guide you through entering property details using voice
                  input.
                </p>
                <div className="instructions mt-4">
                  <ol className="text-start instruction-list">
                    <li className="mb-3 instruction-item">
                      <i className="fas fa-book-reader text-primary me-2"></i>
                      Read the question and any hints provided
                    </li>
                    <li className="mb-3 instruction-item">
                      <i className="fas fa-microphone text-primary me-2"></i>
                      Click "Start Recording" when ready to speak
                    </li>
                    <li className="mb-3 instruction-item">
                      <i className="fas fa-comment text-primary me-2"></i>
                      Speak your answer clearly
                    </li>
                    <li className="mb-3 instruction-item">
                      <i className="fas fa-stop-circle text-primary me-2"></i>
                      Click "Stop Recording" when done
                    </li>
                    <li className="mb-3 instruction-item">
                      <i className="fas fa-edit text-primary me-2"></i>
                      Edit the text manually if needed
                    </li>
                    <li className="mb-3 instruction-item">
                      <i className="fas fa-arrow-right text-primary me-2"></i>
                      Click "Next" to continue
                    </li>
                  </ol>
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg start-button shadow-sm"
                onClick={startSession}
              >
                <i className="fas fa-play me-2"></i>
                Start Session
              </button>
            </div>
          ) : (
            <>
              <div className="current-question mb-4 animate__animated animate__fadeIn">
                <div className="question-header">
                  <h4 className="text-primary mb-3">
                    Question {currentStep + 1}:
                  </h4>
                  <p className="h5 mb-3 question-text">
                    {currentStep >= 0 && steps[currentStep].question}
                  </p>
                  {currentStep >= 0 && steps[currentStep].hint && (
                    <p className="text-muted hint-text">
                      <i className="fas fa-info-circle me-2"></i>
                      {steps[currentStep].hint}
                    </p>
                  )}
                </div>
              </div>

              <div className="progress mb-4 progress-bar-animated">
                <div
                  className="progress-bar progress-bar-striped"
                  role="progressbar"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                  aria-valuenow={((currentStep + 1) / steps.length) * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  Question {currentStep + 1} of {steps.length}
                </div>
              </div>

              <div className="manual-input mb-4 animate__animated animate__fadeIn">
                <div className="input-group input-group-lg shadow-sm">
                  <textarea
                    className="form-control custom-textarea"
                    value={manualInput}
                    onChange={handleManualInputChange}
                    placeholder="Your response will appear here. Edit if needed..."
                    rows="3"
                  />
                  <button
                    className="btn btn-outline-primary update-btn"
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                  >
                    <i className="fas fa-check me-2"></i>
                    Update
                  </button>
                </div>
              </div>

              <div className="d-flex gap-3 mb-4 justify-content-center control-buttons">
                <button
                  className="btn btn-secondary control-btn"
                  onClick={handlePrevious}
                  disabled={currentStep <= 0}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Previous
                </button>
                {!isListening ? (
                  <button
                    className="btn btn-primary control-btn record-btn"
                    onClick={startListening}
                    disabled={currentStep >= steps.length}
                  >
                    <i className="fas fa-microphone me-2"></i>
                    Start Recording
                  </button>
                ) : (
                  <button
                    className="btn btn-warning control-btn stop-btn pulse"
                    onClick={stopListening}
                  >
                    <i className="fas fa-stop me-2"></i>
                    Stop Recording
                  </button>
                )}
                <button
                  className="btn btn-success control-btn"
                  onClick={handleNext}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <i className="fas fa-arrow-right ms-2"></i>
                    </>
                  )}
                </button>
                <button
                  className="btn btn-danger control-btn"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
              </div>

              <div className="mt-4 collected-info animate__animated animate__fadeIn">
                <h4 className="text-primary mb-3">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Collected Information:
                </h4>
                <div className="collected-data bg-light p-3 rounded shadow-sm">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-item mb-2">
                        <strong>Property Type:</strong> {formData.propertyType}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Address:</strong> {formData.location.address}
                      </div>
                      <div className="info-item mb-2">
                        <strong>City:</strong> {formData.location.city}
                      </div>
                      <div className="info-item mb-2">
                        <strong>State:</strong> {formData.location.state}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Zip Code:</strong> {formData.location.zipCode}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Price:</strong>{" "}
                        {formData.price
                          ? `₹${formatIndianPrice(formData.price)}`
                          : ""}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Area:</strong>{" "}
                        {formData.area ? `${formData.area} sq ft` : ""}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item mb-2">
                        <strong>Bedrooms:</strong> {formData.bedrooms}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Bathrooms:</strong> {formData.bathrooms}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Description:</strong> {formData.description}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Features:</strong>{" "}
                        {formData.features.join(", ")}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Agent Name:</strong> {formData.agent.name}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Agent Email:</strong> {formData.agent.email}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Agent Phone:</strong> {formData.agent.phone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedVoiceInput;
