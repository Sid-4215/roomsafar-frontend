import { useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import LoginModal from "../components/LoginModal";
import { roomsAPI, uploadService } from "../services/api";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import Spinner from "../components/Spinner";
import AmenitiesSelector from "../components/AmenitiesSelector.jsx";

// Icons
import {
  FiUpload, FiTrash2, FiCamera, FiDollarSign, FiHome, FiMapPin,
  FiMessageSquare, FiCheck, FiPhone, FiInstagram, FiSend, FiPercent
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

const MAX_FILES = 20;
const MAX_ORIGINAL_SIZE_MB = 5;
const MAX_PARALLEL_UPLOADS = 3;
const MAX_UPLOAD_RETRIES = 2;

// Room image labels
const IMAGE_LABELS = [
  { value: "BEDROOM", label: "Bedroom", icon: "🛏️" },
  { value: "HALL", label: "Hall/Living Room", icon: "🛋️" },
  { value: "KITCHEN", label: "Kitchen", icon: "🍳" },
  { value: "BATHROOM", label: "Bathroom", icon: "🚿" },
  { value: "EXTERIOR", label: "Building Exterior", icon: "🏢" },
  { value: "BALCONY", label: "Balcony", icon: "🌿" },
  { value: "PARKING", label: "Parking Area", icon: "🅿️" },
  { value: "OTHER", label: "Other", icon: "📷" }
];

// Contact preferences
const CONTACT_PREFERENCES = [
  { value: "WHATSAPP", label: "WhatsApp", icon: <FaWhatsapp className="text-green-600" /> },
  { value: "PHONE", label: "Phone Call", icon: <FiPhone className="text-blue-600" /> },
  { value: "INSTAGRAM", label: "Instagram", icon: <FiInstagram className="text-pink-600" /> },
  { value: "TELEGRAM", label: "Telegram", icon: <FaTelegram className="text-blue-500" /> }
];

const initialFormState = {
  rent: "",
  deposit: "",
  type: "",
  furnished: "",
  gender: "",
  
  // Contact information
  whatsapp: "",
  phone: "",
  instagram: "",
  telegram: "",
  contactPreference: "WHATSAPP",
  
  // Brokerage information
  brokerageRequired: false,
  brokerageAmount: "",
  
  description: "",
  address: {
    line1: "",
    area: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "",
  },
  
  // Amenities will be handled by AmenitiesSelector
  amenities: [],
  
  // Images will be handled separately
  images: []
};

export default function PostRoom() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to post a room");
      setShowLogin(true);
    }
  }, [authLoading, isAuthenticated]);

  // Auto-fill contact if user has phone
  useEffect(() => {
    if (user?.phone) {
      setForm(prev => ({ 
        ...prev, 
        whatsapp: user.phone,
        phone: user.phone 
      }));
    }
  }, [user]);

  // Input handler
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Select images with compression
  const handleImageSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`You can upload max ${MAX_FILES} images`);
      return;
    }

    const compressedFiles = [];
    const maxSizeBytes = MAX_ORIGINAL_SIZE_MB * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxSizeBytes) {
        toast.error(`File ${file.name} is larger than ${MAX_ORIGINAL_SIZE_MB}MB`);
        continue;
      }

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });

        compressedFiles.push({
          file: compressed,
          previewUrl: URL.createObjectURL(compressed),
          uploadedUrl: null,
          label: "OTHER",
          caption: "",
          progress: 0,
          error: null,
        });
      } catch {
        toast.error(`Failed to compress ${file.name}`);
      }
    }

    setSelectedFiles(prev => [...prev, ...compressedFiles]);
    e.target.value = null;
  }, [selectedFiles.length]);

  // Update image label
  const updateImageLabel = useCallback((index, label) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index].label = label;
      return updated;
    });
  }, []);

  // Update image caption
  const updateImageCaption = useCallback((index, caption) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index].caption = caption;
      return updated;
    });
  }, []);

  // Remove image
  const removeImage = useCallback((index) => {
    setSelectedFiles(prev => {
      const arr = [...prev];
      const removed = arr.splice(index, 1)[0];

      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);

      return arr;
    });

    setUploadProgress(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  }, []);

  // Upload images to Cloudinary
  // Update the uploadImages function in PostRoom.js

const uploadImages = useCallback(async () => {
  const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD || !PRESET) {
    toast.error("Upload configuration missing. Please contact support.");
    return false;
  }

  const pending = selectedFiles
    .map((f, i) => ({ ...f, index: i }))
    .filter((f) => !f.uploadedUrl);

  if (!pending.length) {
    toast.success("All photos uploaded");
    return true;
  }

  setUploading(true);

  const uploadSingle = async (fileObj, attempt = 1) => {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', fileObj.file);
      formData.append('upload_preset', PRESET);
      formData.append('folder', 'roomsafar/rooms');
      formData.append('timestamp', Date.now().toString());
      
      // Upload directly to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      setSelectedFiles(prev => {
        const updated = [...prev];
        updated[fileObj.index] = {
          ...updated[fileObj.index],
          uploadedUrl: result.secure_url,
          publicId: result.public_id,
          progress: 100,
          error: null,
        };
        return updated;
      });

      return { success: true, url: result.secure_url };
    } catch (err) {
      console.error(`Upload error for file ${fileObj.index}:`, err);
      
      if (attempt < MAX_UPLOAD_RETRIES) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return uploadSingle(fileObj, attempt + 1);
      } else {
        setSelectedFiles(prev => {
          const updated = [...prev];
          updated[fileObj.index].error = "Upload failed after retries";
          return updated;
        });
        return { success: false, error: err.message };
      }
    }
  };

  try {
    // Upload in parallel (max 3 at a time)
    const results = [];
    const batchSize = MAX_PARALLEL_UPLOADS;
    
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch.map(uploadSingle));
      results.push(...batchResults);
    }

    const failedUploads = results.filter(r => r.status === 'rejected' || r.value?.success === false);
    
    if (failedUploads.length > 0) {
      toast.error(`${failedUploads.length} images failed to upload`);
      return false;
    }

    toast.success("All images uploaded successfully!");
    return true;
  } catch (err) {
    console.error("Batch upload error:", err);
    toast.error("Upload failed. Please try again.");
    return false;
  } finally {
    setUploading(false);
  }
}, [selectedFiles]);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = [];

    if (!form.rent || +form.rent < 1000)
      errors.push("Rent must be at least ₹1000");

    if (form.deposit === "" || isNaN(+form.deposit) || +form.deposit < 0) {
      errors.push("Deposit must be valid");
    }

    if (!form.type) errors.push("Select room type");
    if (!form.furnished) errors.push("Select furnishing");
    if (!form.gender) errors.push("Select gender");

    // Contact validation - at least one contact method
    if (!form.whatsapp && !form.phone && !form.instagram && !form.telegram) {
      errors.push("Please provide at least one contact method");
    } else {
      if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp))
        errors.push("Invalid WhatsApp number");
      if (form.phone && !/^\d{10}$/.test(form.phone))
        errors.push("Invalid phone number");
    }

    if (!form.address.line1) errors.push("Enter address");
    if (!form.address.area) errors.push("Enter locality");
    if (!/^\d{6}$/.test(form.address.pincode))
      errors.push("Invalid pincode");

    // Check if all images are uploaded
    const uploadedImages = selectedFiles.filter(f => f.uploadedUrl);
    if (uploadedImages.length < 1)
      errors.push("Upload at least 1 image");

    // Brokerage validation
    if (form.brokerageRequired && (!form.brokerageAmount || +form.brokerageAmount < 0)) {
      errors.push("Please enter brokerage amount");
    }

    errors.forEach(toast.error);
    return errors.length === 0;
  }, [form, selectedFiles]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First upload all images
    const uploadSuccess = await uploadImages();
    if (!uploadSuccess) {
      toast.error("Please upload all images before submitting");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare images array with labels and captions
      const images = selectedFiles
        .filter(f => f.uploadedUrl)
        .map((img, index) => ({
          url: img.uploadedUrl,
          label: img.label,
          caption: img.caption || "",
          sequence: index
        }));

      const body = {
        ...form,
        rent: +form.rent,
        deposit: +form.deposit,
        brokerageAmount: form.brokerageRequired ? +form.brokerageAmount : null,
        amenities: selectedAmenities,
        images: images
      };

      const res = await roomsAPI.createRoom(body);

      toast.success("Room posted successfully!");
      
      // Cleanup image previews
      selectedFiles.forEach(img => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
      
      router.push(`/room/${res.id}`);
      
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to post room");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => {
            setShowLogin(false);
            router.replace("/post");
          }}
        />
      )}

      {!isAuthenticated ? (
        <div className="min-h-[70vh] flex justify-center items-center">
          <p className="text-slate-600 text-lg">
            Please login to continue...
          </p>
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2">Post Your Room</h1>
          <p className="text-slate-600 mb-8">Fill in the details to list your room</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ===================================================== */}
            {/* ENHANCED PHOTOS SECTION WITH LABELS */}
            {/* ===================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiCamera /> Room Photos (Add labels for better presentation)
              </h2>

              <div className="mb-4 text-sm text-slate-600">
                <p>• Label each photo (Bedroom, Hall, Kitchen, etc.)</p>
                <p>• Add captions to highlight features</p>
                <p>• First photo will be shown as thumbnail</p>
              </div>

              <label className="block cursor-pointer mb-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={uploading}
                />
                <div className="p-8 border-2 border-dashed rounded-xl text-center hover:bg-slate-50 transition">
                  <FiUpload size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="font-medium">Click or drag & drop to upload photos</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Upload up to {MAX_FILES} photos • Max {MAX_ORIGINAL_SIZE_MB}MB each
                  </p>
                </div>
              </label>

              {selectedFiles.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="relative group border rounded-xl overflow-hidden">
                        <img
                          src={f.previewUrl}
                          className="w-full h-32 object-cover"
                          alt={`Room photo ${i + 1}`}
                        />
                        
                        {/* Overlay with label */}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                            {IMAGE_LABELS.find(l => l.value === f.label)?.icon} {f.label}
                          </span>
                        </div>

                        {/* Upload status */}
                        {!f.uploadedUrl ? (
                          <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center p-2">
                            {f.error ? (
                              <>
                                <p className="text-xs text-center">{f.error}</p>
                                <button
                                  type="button"
                                  onClick={uploadImages}
                                  className="mt-2 px-2 py-1 bg-white text-red-600 text-xs rounded"
                                >
                                  Retry
                                </button>
                              </>
                            ) : (
                              <>
                                <Spinner size={20} />
                                <span className="text-xs mt-1">
                                  {uploadProgress[i] || 0}%
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <FiCheck size={24} className="text-white" />
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FiTrash2 size={12} />
                        </button>

                        {/* Label and caption controls */}
                        <div className="p-2 bg-white/95 backdrop-blur-sm">
                          <select
                            value={f.label}
                            onChange={(e) => updateImageLabel(i, e.target.value)}
                            className="w-full text-xs p-1 border rounded mb-1"
                            disabled={uploading}
                          >
                            {IMAGE_LABELS.map(label => (
                              <option key={label.value} value={label.value}>
                                {label.icon} {label.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={f.caption || ""}
                            onChange={(e) => updateImageCaption(i, e.target.value)}
                            className="w-full text-xs p-1 border rounded"
                            disabled={uploading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={uploading}
                    onClick={uploadImages}
                  >
                    {uploading ? "Uploading..." : "Upload All Photos"}
                  </button>
                </div>
              )}
            </div>

            {/* ===================================================== */}
            {/* PRICING */}
            {/* ===================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiDollarSign /> Pricing
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Rent ₹
                  </label>
                  <input
                    name="rent"
                    type="number"
                    placeholder="e.g. 10000"
                    value={form.rent}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    min="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Security Deposit ₹
                  </label>
                  <input
                    name="deposit"
                    type="number"
                    placeholder="e.g. 20000"
                    value={form.deposit}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Brokerage Information */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="brokerageRequired"
                    name="brokerageRequired"
                    checked={form.brokerageRequired}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="brokerageRequired" className="font-medium">
                    Brokerage Required
                  </label>
                </div>
                
                {form.brokerageRequired && (
                  <div className="ml-7">
                    <label className="block text-sm text-slate-600 mb-2">
                      Brokerage Amount (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <FiPercent className="text-slate-400" />
                      <input
                        type="number"
                        name="brokerageAmount"
                        placeholder="e.g. 5000 or 10% of rent"
                        value={form.brokerageAmount}
                        onChange={handleInputChange}
                        className="flex-1 border px-4 py-2 rounded-lg"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Mention if it's a fixed amount or percentage
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ===================================================== */}
            {/* ROOM DETAILS */}
            {/* ===================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiHome /> Room Details
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Room Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="RK">1 RK</option>
                    <option value="BHK1">1 BHK</option>
                    <option value="BHK2">2 BHK</option>
                    <option value="BHK3">3 BHK</option>
                    <option value="SHARED">Shared Room</option>
                    <option value="PG">PG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    name="furnished"
                    value={form.furnished}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    required
                  >
                    <option value="">Select Furnishing</option>
                    <option value="FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred For
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    required
                  >
                    <option value="">Select Preference</option>
                    <option value="BOYS">Boys Only</option>
                    <option value="GIRLS">Girls Only</option>
                    <option value="ANYONE">Anyone</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* AMENITIES SELECTOR */}
            {/* ===================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h2 className="text-xl font-semibold mb-4">Amenities & Facilities</h2>
              <p className="text-slate-600 mb-6">Select all available amenities</p>
              
              <AmenitiesSelector
                selectedAmenities={selectedAmenities}
                onChange={setSelectedAmenities}
              />
            </div>

            {/* ===================================================== */}
            {/* ENHANCED CONTACT INFORMATION */}
            {/* ===================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiSend /> Contact Information
              </h2>
              <p className="text-slate-600 mb-6">Provide multiple ways for interested people to contact you</p>

              <div className="space-y-4">
                {/* WhatsApp */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaWhatsapp className="text-green-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      className="w-full border px-4 py-2 rounded-lg"
                      maxLength="10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiPhone className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number (Alternative)
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      className="w-full border px-4 py-2 rounded-lg"
                      maxLength="10"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FiInstagram className="text-pink-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Instagram Username
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="w-full border px-4 py-2 rounded-lg"
                    />
                  </div>
                </div>

                {/* Telegram */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FaTelegram className="text-blue-500 text-xl" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Telegram Username
                    </label>
                    <input
                      type="text"
                      name="telegram"
                      value={form.telegram}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="w-full border px-4 py-2 rounded-lg"
                    />
                  </div>
                </div>

                {/* Contact Preference */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CONTACT_PREFERENCES.map(pref => (
                      <button
                        type="button"
                        key={pref.value}
                        onClick={() => setForm(prev => ({ ...prev, contactPreference: pref.value }))}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition ${
                          form.contactPreference === pref.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {pref.icon}
                        <span className="text-sm">{pref.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* ADDRESS */}
            {/* ===================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiMapPin /> Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Address
                  </label>
                  <input
                    name="address.line1"
                    placeholder="Flat No., Building Name, Street"
                    value={form.address.line1}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Area / Locality
                  </label>
                  <input
                    name="address.area"
                    placeholder="e.g. Kothrud, Hinjewadi"
                    value={form.address.area}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City
                    </label>
                    <input
                      name="address.city"
                      value={form.address.city}
                      readOnly
                      className="w-full border px-4 py-3 rounded-lg bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      State
                    </label>
                    <input
                      name="address.state"
                      value={form.address.state}
                      readOnly
                      className="w-full border px-4 py-3 rounded-lg bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pincode
                    </label>
                    <input
                      name="address.pincode"
                      placeholder="6-digit pincode"
                      maxLength="6"
                      value={form.address.pincode}
                      onChange={handleInputChange}
                      className="w-full border px-4 py-3 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* DESCRIPTION */}
            {/* ===================================================== */}
            <div className="bg-white p-6 rounded-2xl shadow border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiMessageSquare /> Additional Description
              </h2>
              <p className="text-slate-600 mb-4">Add any extra details about the room</p>

              <textarea
                name="description"
                rows="6"
                placeholder="Describe the neighborhood, nearby facilities, house rules, or any other important details..."
                value={form.description}
                onChange={handleInputChange}
                className="w-full border px-4 py-3 rounded-lg"
                maxLength="2000"
              />
              <div className="text-right text-sm text-slate-500 mt-2">
                {form.description.length}/2000 characters
              </div>
            </div>

            {/* ===================================================== */}
            {/* SUBMIT BUTTON */}
            {/* ===================================================== */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Posting Room..." : "Post Room Listing"}
            </button>
          </form>
        </main>
      )}
    </div>
  );
}