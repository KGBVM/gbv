// components/FileUpload.jsx
import React, { useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

export default function FileUpload({
    onFileChange,
    imagePreview: externalImagePreview = null,
    imageFile: externalImageFile = null,
    label = "File Upload",
    required = false,
    error = null,
    helpText = null,
    accept = "image/*",
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ],
    previewWidth = "100%",
    previewMaxHeight = "300px",
    previewPlaceholder = "📸",
    placeholderText = "Click or drag and drop to upload file",
    sizeText = "Max file size: 5MB",
    formatText = "Supported formats: JPEG, PNG, GIF, WEBP",
    onChangeImage = null, // For backward compatibility
    setData = null, // For backward compatibility
    fieldName = "image", // For backward compatibility
}) {
    const fileInputRef = useRef(null);
    const [localImagePreview, setLocalImagePreview] = useState(null);
    const [localImageFile, setLocalImageFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Use external state if provided, otherwise use local state
    const imagePreview =
        externalImagePreview !== null
            ? externalImagePreview
            : localImagePreview;
    const imageFile =
        externalImageFile !== null ? externalImageFile : localImageFile;

    const validateFile = (file) => {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            toast.error(
                `Please select a valid file type (${allowedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")})`,
            );
            return false;
        }

        // Validate file size
        if (file.size > maxSize) {
            toast.error(
                `File size must be less than ${maxSize / (1024 * 1024)}MB`,
            );
            return false;
        }

        return true;
    };

    const processFile = (file) => {
        if (!validateFile(file)) return;

        if (setData && fieldName) {
            setData(fieldName, file);
        }

        if (onFileChange) {
            onFileChange(file);
        }

        if (onChangeImage) {
            onChangeImage(file);
        }

        // Update local state
        setLocalImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setLocalImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleRemoveFile = () => {
        setLocalImagePreview(null);
        setLocalImageFile(null);

        if (setData && fieldName) {
            setData(fieldName, null);
        }

        if (onFileChange) {
            onFileChange(null);
        }

        if (onChangeImage) {
            onChangeImage(null);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Form.Group className="mb-3">
            {label && (
                <Form.Label>
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </Form.Label>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {/* Custom drag & drop area */}
            {!imagePreview ? (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`dropzone ${isDragging ? "dragging" : ""}`}
                >
                    <div style={{ fontSize: "48px", marginBottom: "10px" }}>
                        {previewPlaceholder}
                    </div>
                    <div
                        style={{
                            fontSize: "16px",
                            color: "#6c757d",
                            marginBottom: "5px",
                        }}
                    >
                        {placeholderText}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                        {sizeText && `Recommended size: ${sizeText}`}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                        {formatText}
                    </div>
                </div>
            ) : (
                // File preview area
                <div className={`dropzone preview`}>
                    <div
                        style={{
                            position: "relative",
                            display: "inline-block",
                        }}
                    >
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                                maxWidth: previewWidth,
                                maxHeight: previewMaxHeight,
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                padding: "5px",
                                backgroundColor: "white",
                                objectFit: "contain",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            marginTop: "15px",
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={handleClick}
                        >
                            Change File
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleRemoveFile}
                        >
                            Remove File
                        </Button>
                    </div>
                </div>
            )}

            {error && <Form.Text className="text-danger">{error}</Form.Text>}
            {helpText && !error && (
                <Form.Text className="text-white-50">{helpText}</Form.Text>
            )}
        </Form.Group>
    );
}
