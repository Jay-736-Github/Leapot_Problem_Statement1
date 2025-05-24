import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import "./PhotoUpload.css";

const PhotoUpload = ({ onPhotosChange }) => {
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Check file types and sizes
      const validFiles = acceptedFiles.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast.error(`${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Create preview URLs
      const newPreviews = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
      setPhotos((prev) => [...prev, ...validFiles]);
      onPhotosChange([...photos, ...validFiles]);
    },
    [photos, onPhotosChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    const newPreviews = [...previews];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index].preview);

    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);

    setPhotos(newPhotos);
    setPreviews(newPreviews);
    onPhotosChange(newPhotos);
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.preview));
    };
  }, [previews]);

  return (
    <div className="photo-upload-container">
      <div
        {...getRootProps()}
        className={`photo-upload ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        <i className="fas fa-cloud-upload-alt fa-2x mb-2"></i>
        <p>
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop photos here, or click to select"}
        </p>
        <p className="text-muted small">
          (Max file size: 5MB, Accepted formats: JPG, PNG, GIF)
        </p>
      </div>

      {previews.length > 0 && (
        <div className="photo-preview">
          {previews.map((preview, index) => (
            <div key={index} className="preview-item">
              <img
                src={preview.preview}
                alt={`Preview ${index + 1}`}
                className="preview-image"
              />
              <button
                type="button"
                className="remove-photo"
                onClick={() => removePhoto(index)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
