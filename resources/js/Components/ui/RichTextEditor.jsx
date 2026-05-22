// components/RichTextEditor.jsx
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Form } from "react-bootstrap";

// Quill editor modules configuration
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
    ],
};

// Quill editor formats
const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
];

export default function RichTextEditor({
    value = "",
    onChange,
    label = "Content",
    placeholder = "Enter content here...",
    required = false,
    error = null,
    helpText = null,
    disabled = false,
    modules = quillModules,
    formats = quillFormats,
    className = "",
    style = { backgroundColor: "white", color: "#000" },
}) {
    return (
        <Form.Group className={`mb-3 ${className}`}>
            {label && (
                <Form.Label>
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </Form.Label>
            )}
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={disabled}
                style={style}
            />
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
            {helpText && !error && (
                <Form.Text className="text-white-50">{helpText}</Form.Text>
            )}
        </Form.Group>
    );
}
