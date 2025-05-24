import React, { useState, useEffect } from "react";
import "./VoiceInput.css";

const VoiceInput = ({ onTranscriptUpdate, isListening }) => {
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        onTranscriptUpdate(transcriptText);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      setRecognition(recognition);
    } else {
      console.error("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (recognition) {
      if (isListening) {
        recognition.start();
      } else {
        recognition.stop();
      }
    }
  }, [isListening, recognition]);

  return (
    <div className="voice-input">
      <div className="voice-status">
        {isListening ? (
          <div className="listening-indicator">
            <div className="pulse"></div>
            <span>Listening...</span>
          </div>
        ) : (
          <span>Click the microphone to start</span>
        )}
      </div>
      <div className="transcript">{transcript && <p>{transcript}</p>}</div>
    </div>
  );
};

export default VoiceInput;
