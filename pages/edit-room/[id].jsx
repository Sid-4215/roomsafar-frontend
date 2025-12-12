"use client";
import { useEffect, useState, useContext, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { roomsAPI, uploadService } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { FiLoader, FiTrash2, FiEdit } from "react-icons/fi";
import AmenitiesSelector from "../../components/AmenitiesSelector";

// Image labels for categorization
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

export default function EditRoom() {
  const router = useRouter();
  const { id } = router.query;

  const { isAuthenticated, loading: authLoading, user } = useContext(AuthContext);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]); // New images to upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  /* ========================================================
      LOAD ROOM DETAILS (OWNER VALIDATION)
  ========================================================= */
  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const fetchRoom = async () => {
      try {
        const data = await roomsAPI.getRoomById(id);

        if (data.ownerId !== user.id) {
          toast.error("You are not allowed to edit this listing");
          router.push("/");
          return;
        }

        setForm({
          ...data,
          // Ensure address exists
          address: data.address || {
            line1: "",
            area: "",
            city: "Pune",
            state: "Maharashtra",
            pincode: "",
            latitude: null,
            longitude: null,
          },
          // Convert images from backend format to frontend format
          images: (data.images || []).map(img => ({
            id: img.id,
            url: img.url,
            label: img.label || "OTHER",
            caption: img.caption || "",
            sequence: img.sequence || 0
          })),
          amenities: data.amenities || []
        });
      } catch (err) {
        console.error("Failed to load room:", err);
        toast.error("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, isAuthenticated, user, router]);

  /* ========================================================
      HANDLE FORM CHANGE
  ========================================================= */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  /* ========================================================
      HANDLE AMENITIES CHANGE
  ========================================================= */
  const handleAmenitiesChange = useCallback((amenities) => {
    setForm(prev => ({ ...prev, amenities }));
  }, []);

  /* ========================================================
      UPDATE EXISTING IMAGE
  ========================================================= */
  const updateImage = useCallback((index, updates) => {
    setForm(prev => {
      const updatedImages = [...prev.images];
      updatedImages[index] = { ...updatedImages[index], ...updates };
      return { ...prev, images: updatedImages };
    });
  }, []);

  /* ========================================================
      REMOVE EXISTING IMAGE
  ========================================================= */
  const removeImage = useCallback((index) => {
    setForm(prev => {
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });
  }, []);

  /* ========================================================
      SELECT NEW IMAGES + COMPRESS
  ========================================================= */
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const compressedList = [];

    for (let file of files) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });

        compressedList.push({
          file: compressed,
          previewUrl: URL.createObjectURL(compressed),
          uploadedUrl: null,
          label: "OTHER",
          caption: "",
          progress: 0,
        });
      } catch (err) {
        console.error("Compression error:", err);
        toast.error(`Failed to compress image ${file.name}`);
      }
    }

    setSelectedFiles((prev) => [...prev, ...compressedList]);
  };

  /* ========================================================
      UPDATE NEW IMAGE LABEL/CAPTION
  ========================================================= */
  const updateNewImage = useCallback((index, updates) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  }, []);

  /* ========================================================
      REMOVE NEW IMAGE
  ========================================================= */
  const removeNewImage = useCallback((index) => {
    setSelectedFiles(prev => {
      const arr = [...prev];
      const removed = arr.splice(index, 1)[0];
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return arr;
    });
    
    setUploadProgress(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  }, []);

  /* ========================================================
      UPLOAD NEW IMAGES TO CLOUDINARY
  ========================================================= */
  const uploadNewImages = async () => {
    const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD || !PRESET) {
      toast.error("Cloudinary is not configured");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("No images selected to upload");
      return;
    }

    setUploading(true);
    const uploadedImages = [];

    try {
      for (let index in selectedFiles) {
        const fileObj = selectedFiles[index];
        
        // Skip if already uploaded
        if (fileObj.uploadedUrl) continue;

        const result = await uploadService.uploadToCloudinary(
          fileObj.file,
          CLOUD,
          PRESET,
          (percent) => {
            setUploadProgress((prev) => ({
              ...prev,
              [index]: percent,
            }));
          }
        );

        // Create image object in backend format
        uploadedImages.push({
          url: result.url,
          label: fileObj.label || "OTHER",
          caption: fileObj.caption || "",
          sequence: (form.images.length || 0) + uploadedImages.length
        });

        // Update the selected file with the uploaded URL
        setSelectedFiles(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            uploadedUrl: result.url,
            progress: 100,
          };
          return updated;
        });
      }

      // Add uploaded images to form
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      toast.success(`${uploadedImages.length} images uploaded successfully!`);
      setSelectedFiles([]);
      setUploadProgress({});
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload some images");
    } finally {
      setUploading(false);
    }
  };

  /* ========================================================
      VALIDATE FORM
  ========================================================= */
  const validateForm = () => {
    const errors = [];

    if (!form.rent || +form.rent < 1000)
      errors.push("Rent must be at least ₹1000");

    if (!form.deposit || +form.deposit < 0)
      errors.push("Deposit must be valid");

    if (!form.type) errors.push("Select room type");
    if (!form.furnished) errors.push("Select furnishing");
    if (!form.gender) errors.push("Select gender");

    if (!form.whatsapp || !/^\d{10}$/.test(form.whatsapp))
      errors.push("Valid WhatsApp number is required");

    if (!form.address.line1) errors.push("Enter address");
    if (!form.address.area) errors.push("Enter locality");
    if (!form.address.pincode || !/^\d{6}$/.test(form.address.pincode))
      errors.push("Valid 6-digit pincode is required");

    if (form.brokerageRequired && (!form.brokerageAmount || +form.brokerageAmount < 0)) {
      errors.push("Please enter valid brokerage amount");
    }

    if (form.images.length < 1)
      errors.push("At least one image is required");

    return errors.length === 0;
  };

  /* ========================================================
      SUBMIT UPDATE FORM
  ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    // Check if there are pending uploads
    const hasPendingUploads = selectedFiles.some(f => !f.uploadedUrl);
    if (hasPendingUploads) {
      toast.error("Please upload all selected images first");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      return;
    }

    setSaving(true);

    try {
      // Prepare the update data
      const updateData = {
        rent: +form.rent,
        deposit: +form.deposit,
        type: form.type,
        furnished: form.furnished,
        gender: form.gender,
        whatsapp: form.whatsapp,
        phone: form.phone || "",
        instagram: form.instagram || "",
        telegram: form.telegram || "",
        contactPreference: form.contactPreference || "WHATSAPP",
        brokerageRequired: form.brokerageRequired || false,
        brokerageAmount: form.brokerageRequired ? +form.brokerageAmount : null,
        description: form.description || "",
        address: form.address,
        amenities: form.amenities || [],
        // Send images in the format expected by backend
        images: form.images.map((img, index) => ({
          url: img.url,
          label: img.label || "OTHER",
          caption: img.caption || "",
          sequence: img.sequence !== undefined ? img.sequence : index
        }))
      };

      await roomsAPI.updateRoom(id, updateData);
      toast.success("Room updated successfully!");
      router.push(`/room/${id}`);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
      LOADING UI
  ========================================================= */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-slate-600" size={40} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Room not found</p>
      </div>
    );
  }

  /* ========================================================
      MAIN UI
  ========================================================= */
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Edit Room Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Rent & Deposit */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Rent (₹)</label>
              <input
                type="number"
                name="rent"
                value={form.rent}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded-lg"
                min="1000"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Deposit (₹)</label>
              <input
                type="number"
                name="deposit"
                value={form.deposit}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded-lg"
                min="0"
                required
              />
            </div>
          </div>

          {/* Room Details */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-medium">Room Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
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
              <label className="block mb-2 font-medium">Furnishing</label>
              <select
                name="furnished"
                value={form.furnished}
                onChange={handleChange}
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
              <label className="block mb-2 font-medium">Preferred For</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
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

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">WhatsApp Number*</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  className="w-full border px-4 py-3 rounded-lg"
                  placeholder="10-digit number"
                  maxLength="10"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">Phone (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  className="w-full border px-4 py-3 rounded-lg"
                  placeholder="10-digit number"
                  maxLength="10"
                />
              </div>
            </div>
          </div>

          {/* Brokerage Information */}
          <div className="bg-slate-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="brokerageRequired"
                name="brokerageRequired"
                checked={form.brokerageRequired || false}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label htmlFor="brokerageRequired" className="font-medium">
                Brokerage Required
              </label>
            </div>
            
            {form.brokerageRequired && (
              <div>
                <label className="block mb-2 text-sm font-medium">Brokerage Amount (₹)</label>
                <input
                  type="number"
                  name="brokerageAmount"
                  value={form.brokerageAmount || ""}
                  onChange={handleChange}
                  className="w-full border px-4 py-3 rounded-lg"
                  placeholder="e.g. 5000"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Address */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Address</h3>

            <div className="space-y-4">
              <input
                type="text"
                name="address.line1"
                placeholder="Flat / building, street"
                value={form.address.line1 || ""}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded-lg"
                required
              />

              <input
                type="text"
                name="address.area"
                placeholder="Area / Locality"
                value={form.address.area || ""}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded-lg"
                required
              />

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-sm">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={form.address.city || "Pune"}
                    readOnly
                    className="w-full border px-4 py-3 rounded-lg bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={form.address.state || "Maharashtra"}
                    readOnly
                    className="w-full border px-4 py-3 rounded-lg bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Pincode*</label>
                  <input
                    type="text"
                    name="address.pincode"
                    placeholder="6-digit pincode"
                    value={form.address.pincode || ""}
                    onChange={handleChange}
                    className="w-full border px-4 py-3 rounded-lg"
                    maxLength="6"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Amenities</h3>
            <AmenitiesSelector
              selectedAmenities={form.amenities || []}
              onChange={handleAmenitiesChange}
            />
          </div>

          {/* Existing Images */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Existing Photos</h3>
            
            {form.images.length === 0 ? (
              <p className="text-slate-500 italic">No photos uploaded yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {form.images.map((img, index) => (
                  <div key={img.id || index} className="relative group border rounded-lg overflow-hidden">
                    <img
                      src={img.url}
                      className="w-full h-40 object-cover"
                      alt={`Room photo ${index + 1}`}
                    />
                    
                    {/* Image controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-3">
                      <div className="flex-1">
                        {/* Label selection */}
                        <select
                          value={img.label || "OTHER"}
                          onChange={(e) => updateImage(index, { label: e.target.value })}
                          className="w-full mb-2 text-xs p-1 bg-white/90 rounded"
                        >
                          {IMAGE_LABELS.map(label => (
                            <option key={label.value} value={label.value}>
                              {label.icon} {label.label}
                            </option>
                          ))}
                        </select>
                        
                        {/* Caption input */}
                        <input
                          type="text"
                          placeholder="Caption (optional)"
                          value={img.caption || ""}
                          onChange={(e) => updateImage(index, { caption: e.target.value })}
                          className="w-full text-xs p-1 bg-white/90 rounded mb-2"
                        />
                      </div>
                      
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="self-end px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        <FiTrash2 className="inline mr-1" size={12} /> Remove
                      </button>
                    </div>
                    
                    {/* Label badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {IMAGE_LABELS.find(l => l.value === (img.label || "OTHER"))?.icon} 
                        {IMAGE_LABELS.find(l => l.value === (img.label || "OTHER"))?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Photos */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Add More Photos</h3>
            
            <div className="mb-4">
              <label className="block cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center hover:bg-slate-50 transition">
                  <p className="font-medium">Click to select new photos</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Upload up to 20 photos • Max 5MB each
                  </p>
                </div>
              </label>
            </div>

            {/* Selected new images */}
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-3">Selected Photos ({selectedFiles.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group border rounded-lg overflow-hidden">
                      <img
                        src={file.previewUrl}
                        className="w-full h-40 object-cover"
                        alt={`New photo ${index + 1}`}
                      />
                      
                      {/* Upload status */}
                      {!file.uploadedUrl ? (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                          {uploadProgress[index] !== undefined ? (
                            <div className="text-center text-white">
                              <FiLoader className="animate-spin mx-auto mb-2" />
                              <p className="text-xs">Uploading... {uploadProgress[index]}%</p>
                            </div>
                          ) : (
                            <div className="p-3">
                              {/* Label selection */}
                              <select
                                value={file.label || "OTHER"}
                                onChange={(e) => updateNewImage(index, { label: e.target.value })}
                                className="w-full mb-2 text-xs p-1 bg-white/90 rounded"
                                disabled={uploading}
                              >
                                {IMAGE_LABELS.map(label => (
                                  <option key={label.value} value={label.value}>
                                    {label.icon} {label.label}
                                  </option>
                                ))}
                              </select>
                              
                              {/* Caption input */}
                              <input
                                type="text"
                                placeholder="Caption (optional)"
                                value={file.caption || ""}
                                onChange={(e) => updateNewImage(index, { caption: e.target.value })}
                                className="w-full text-xs p-1 bg-white/90 rounded mb-2"
                                disabled={uploading}
                              />
                              
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                disabled={uploading}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">✓ Uploaded</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Upload button */}
                {selectedFiles.some(f => !f.uploadedUrl) && (
                  <button
                    type="button"
                    onClick={uploadNewImages}
                    disabled={uploading}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : `Upload ${selectedFiles.filter(f => !f.uploadedUrl).length} Photos`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description || ""}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-lg"
              placeholder="Describe the room, neighborhood, nearby facilities, house rules, etc."
              maxLength={2000}
            />
            <div className="text-right text-sm text-slate-500 mt-1">
              {(form.description || "").length}/2000 characters
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin inline mr-2" />
                  Saving...
                </>
              ) : "Save Changes"}
            </button>
            
            <button
              type="button"
              onClick={() => router.push(`/room/${id}`)}
              className="ml-4 px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}