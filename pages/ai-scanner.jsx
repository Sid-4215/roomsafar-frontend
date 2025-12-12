import { useState, useContext, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import AmenitiesSelector from "../components/AmenitiesSelector.jsx";
import toast from "react-hot-toast";
import { roomsAPI, uploadService } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import imageCompression from "browser-image-compression";
import { FiUpload, FiTrash2, FiCheck, FiAlertCircle, FiCopy, FiCamera } from "react-icons/fi";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

// Constants from PostRoom.jsx
const MAX_FILES = 20;
const MAX_ORIGINAL_SIZE_MB = 5;
const MAX_PARALLEL_UPLOADS = 3;
const MAX_UPLOAD_RETRIES = 2;

// Room image labels - SAME AS POSTROOM.JSX
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

// Type mapping
const TYPE_MAPPING = {
  "RK": "RK",
  "1RK": "RK",
  "1 RK": "RK",
  "SHARED": "SHARED",
  "SHARED_ROOM": "SHARED",
  "PG": "PG",
  "HOSTEL": "PG",
  "1BHK": "BHK1",
  "1 BHK": "BHK1",
  "BHK1": "BHK1",
  "2BHK": "BHK2",
  "2 BHK": "BHK2",
  "BHK2": "BHK2",
  "3BHK": "BHK3",
  "3 BHK": "BHK3",
  "BHK3": "BHK3",
  "UNKNOWN": "SHARED"
};

// Gender mapping
const GENDER_MAPPING = {
  "BOYS": "BOYS",
  "BOY": "BOYS",
  "MALE": "BOYS",
  "GIRLS": "GIRLS",
  "GIRL": "GIRLS",
  "FEMALE": "GIRLS",
  "ANYONE": "ANYONE",
  "UNISEX": "ANYONE",
  "BOTH": "ANYONE",
  "COED": "ANYONE",
  "MIXED": "ANYONE"
};

// Furnished mapping
const FURNISHED_MAPPING = {
  "FURNISHED": "FURNISHED",
  "FULLY FURNISHED": "FURNISHED",
  "FULLY": "FURNISHED",
  "SEMI_FURNISHED": "SEMI_FURNISHED",
  "SEMI": "SEMI_FURNISHED",
  "SEMI FURNISHED": "SEMI_FURNISHED",
  "UNFURNISHED": "UNFURNISHED",
  "NOT FURNISHED": "UNFURNISHED",
  "NON-FURNISHED": "UNFURNISHED"
};

// Common Pune areas for auto-detection
const PUNE_AREAS = [
  "Kothrud", "Hinjewadi", "Dattawadi", "Karve Nagar", "Shivaji Nagar",
  "Viman Nagar", "Kharadi", "Wagholi", "Hadapsar", "Baner", "Aundh",
  "Pashan", "Bavdhan", "Warje", "Katraj", "Kondhwa", "Market Yard",
  "Shukrawar Peth", "Mangalwar Peth", "Budhwar Peth", "Gokhale Nagar",
  "Deccan", "FC Road", "JM Road", "Bibwewadi", "Sahakar Nagar",
  "Nagar Road", "Yerwada", "Kalyani Nagar", "Koregaon Park", "Camp",
  "Prabhat Road", "Erandwane", "Model Colony", "Mukund Nagar",
  "Parvati", "Sinhagad Road", "Narhe", "Ambegaon", "Katraj",
  "Sadashiv Peth", "Tilak Road", "Navipeth", "Shaniwar Peth"
];

export default function AIScanner() {
  const { isAuthenticated, user } = useContext(AuthContext);

  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); // Changed from 'images' to 'selectedFiles'
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Review, 3: Upload
  const [manualEditMode, setManualEditMode] = useState(false);
  const [manualData, setManualData] = useState({});
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Auto-fill from user profile if available
  useEffect(() => {
    if (user?.phone && !extracted?.whatsapp) {
      setManualData(prev => ({
        ...prev,
        whatsapp: user.phone
      }));
    }
  }, [user, extracted]);

  // Sync amenities when data is extracted
  useEffect(() => {
    if (extracted?.amenities && Array.isArray(extracted.amenities)) {
      setSelectedAmenities(extracted.amenities);
      setManualData(prev => ({
        ...prev,
        amenities: extracted.amenities
      }));
    }
  }, [extracted]);

  // Clean extracted data and map to correct values
  const cleanExtractedData = useCallback((data) => {
    if (!data) return null;
    
    const cleaned = { ...data };
    
    // Clean rent: handle "k" notation, "lakh", "lac", "cr" and remove commas
    if (cleaned.rent) {
      let rentStr = String(cleaned.rent).toLowerCase().replace(/,/g, '');
      
      // Handle k (thousands)
      if (rentStr.includes('k')) {
        rentStr = rentStr.replace('k', '');
        cleaned.rent = parseFloat(rentStr) * 1000;
      }
      // Handle lakh/lac
      else if (rentStr.includes('lakh') || rentStr.includes('lac')) {
        rentStr = rentStr.replace(/lakh|lac/g, '');
        cleaned.rent = parseFloat(rentStr) * 100000;
      }
      // Handle crore
      else if (rentStr.includes('cr')) {
        rentStr = rentStr.replace('cr', '');
        cleaned.rent = parseFloat(rentStr) * 10000000;
      }
      else {
        cleaned.rent = parseInt(rentStr) || 0;
      }
    }
    
    // Clean deposit - same logic as rent
    if (cleaned.deposit) {
      let depositStr = String(cleaned.deposit).toLowerCase().replace(/,/g, '');
      
      if (depositStr.includes('k')) {
        depositStr = depositStr.replace('k', '');
        cleaned.deposit = parseFloat(depositStr) * 1000;
      }
      else if (depositStr.includes('lakh') || depositStr.includes('lac')) {
        depositStr = depositStr.replace(/lakh|lac/g, '');
        cleaned.deposit = parseFloat(depositStr) * 100000;
      }
      else if (depositStr.includes('cr')) {
        depositStr = depositStr.replace('cr', '');
        cleaned.deposit = parseFloat(depositStr) * 10000000;
      }
      else {
        cleaned.deposit = parseInt(depositStr) || 0;
      }
    }
    
    // Map type
    if (cleaned.type) {
      const typeUpper = cleaned.type.toUpperCase().trim();
      cleaned.type = TYPE_MAPPING[typeUpper] || "SHARED";
    }
    
    // Map gender
    if (cleaned.gender) {
      const genderUpper = cleaned.gender.toUpperCase().trim();
      cleaned.gender = GENDER_MAPPING[genderUpper] || "ANYONE";
    }
    
    // Map furnished
    if (cleaned.furnished) {
      const furnishedUpper = cleaned.furnished.toUpperCase().trim();
      cleaned.furnished = FURNISHED_MAPPING[furnishedUpper] || "UNFURNISHED";
    }
    
    // Clean and validate amenities
    if (cleaned.amenities && Array.isArray(cleaned.amenities)) {
      // Filter out invalid amenities and ensure uniqueness
      cleaned.amenities = [...new Set(cleaned.amenities)]
        .filter(amenity => 
          amenity && 
          typeof amenity === 'string' && 
          amenity.trim().length > 0
        )
        .map(amenity => amenity.trim().toUpperCase());
    } else {
      cleaned.amenities = [];
    }
    
    // Clean WhatsApp number (remove spaces, +91, etc.)
    if (cleaned.whatsapp) {
      const digits = String(cleaned.whatsapp).replace(/\D/g, '');
      cleaned.whatsapp = digits.slice(-10); // Get last 10 digits
    }
    
    // Clean area - find best match from Pune areas
    if (cleaned.area) {
      const areaStr = cleaned.area.trim();
      const matchedArea = PUNE_AREAS.find(area => 
        areaStr.toLowerCase().includes(area.toLowerCase()) ||
        area.toLowerCase().includes(areaStr.toLowerCase())
      );
      cleaned.area = matchedArea || areaStr;
    }
    
    return cleaned;
  }, []);

  // Validate extracted data
  const validateExtractedData = useCallback((data) => {
    const errors = [];
    
    if (!data.rent || data.rent < 1000) {
      errors.push("Rent must be at least ₹1000");
    }
    
    if (data.deposit === undefined || data.deposit < 0) {
      errors.push("Deposit must be valid (0 or more)");
    }
    
    if (!data.type || data.type === "UNKNOWN") {
      errors.push("Please specify room type (RK, 1BHK, 2BHK, etc.)");
    }
    
    if (!data.area || data.area.trim().length < 2) {
      errors.push("Area/location is required");
    }
    
    if (!data.gender) {
      errors.push("Gender preference is required");
    }
    
    if (!data.furnished) {
      errors.push("Furnishing status is required");
    }
    
    if (!data.whatsapp || data.whatsapp.length !== 10) {
      errors.push("Valid 10-digit WhatsApp number is required");
    }
    
    if (!data.description || data.description.trim().length < 10) {
      errors.push("Description should be at least 10 characters");
    }
    
    // Amenities validation (optional)
    if (data.amenities && !Array.isArray(data.amenities)) {
      errors.push("Amenities should be an array");
    }
    
    return errors;
  }, []);

  // ================ IMAGE HANDLING FUNCTIONS (Same as PostRoom.jsx) ================

  // Select images with compression - UPDATED TO MATCH POSTROOM.JSX
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
          uploadedUrl: null, // Added to match PostRoom.jsx
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

  // Update image label - NEW FUNCTION
  const updateImageLabel = useCallback((index, label) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index].label = label;
      return updated;
    });
  }, []);

  // Update image caption - NEW FUNCTION
  const updateImageCaption = useCallback((index, caption) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated[index].caption = caption;
      return updated;
    });
  }, []);

  // Remove image - UPDATED TO MATCH POSTROOM.JSX
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

  // Upload images to Cloudinary - UPDATED TO MATCH POSTROOM.JSX
  const uploadImages = useCallback(async () => {
    const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD || !PRESET) {
      toast.error("Cloudinary configuration missing");
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
        const result = await uploadService.uploadToCloudinary(
          fileObj.file,
          CLOUD,
          PRESET,
          (pct) => setUploadProgress(p => ({ ...p, [fileObj.index]: pct }))
        );

        setSelectedFiles(prev => {
          const updated = [...prev];
          updated[fileObj.index] = {
            ...updated[fileObj.index],
            uploadedUrl: result.url,
            progress: 100,
            error: null,
          };
          return updated;
        });

        return { success: true, url: result.url };
      } catch (err) {
        if (attempt < MAX_UPLOAD_RETRIES) {
          await uploadSingle(fileObj, attempt + 1);
        } else {
          setSelectedFiles(prev => {
            const updated = [...prev];
            updated[fileObj.index].error = "Upload failed";
            return updated;
          });
          return { success: false, error: err.message };
        }
      }
    };

    try {
      for (let i = 0; i < pending.length; i += MAX_PARALLEL_UPLOADS) {
        const chunk = pending.slice(i, i + MAX_PARALLEL_UPLOADS);
        await Promise.all(chunk.map(uploadSingle));
      }

      toast.success("Upload complete");
      return true;
    } catch (err) {
      toast.error("Some uploads failed");
      return false;
    } finally {
      setUploading(false);
    }
  }, [selectedFiles]);

  // ================ END OF IMAGE HANDLING FUNCTIONS ================

  // Extract info using AI
  const extractData = async () => {
    if (!message.trim()) {
      toast.error("Please paste a message to analyze");
      return;
    }

    if (message.trim().length < 20) {
      toast.error("Message is too short. Please provide more details.");
      return;
    }

    setExtracting(true);
    setValidationErrors([]);

    try {
      const res = await fetch("/api/extract-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Clean and validate the extracted data
      const cleanedData = cleanExtractedData(data);
      const errors = validateExtractedData(cleanedData);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error("Please review and fix the extracted data");
        setManualEditMode(true);
      } else {
        toast.success("Data extracted successfully!");
      }
      
      setExtracted(cleanedData);
      setManualData(cleanedData);
      setSelectedAmenities(cleanedData.amenities || []);
      setCurrentStep(2);
      
    } catch (err) {
      console.error("Extraction error:", err);
      toast.error(err.message || "Failed to extract data. Please enter details manually.");
      setManualEditMode(true);
    } finally {
      setExtracting(false);
    }
  };

  // Manual data update
  const handleManualUpdate = useCallback((field, value) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle amenities change
  const handleAmenitiesChange = useCallback((newAmenities) => {
    setSelectedAmenities(newAmenities);
    handleManualUpdate('amenities', newAmenities);
  }, [handleManualUpdate]);

  // Validate manual data
  const validateAndProceed = () => {
    const dataToValidate = {
      ...manualData,
      amenities: selectedAmenities
    };
    
    const errors = validateExtractedData(dataToValidate);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix all errors before proceeding");
      return;
    }
    
    setValidationErrors([]);
    setExtracted(dataToValidate);
    setCurrentStep(3);
    toast.success("Data validated successfully!");
  };

  // Submit the room
  const submitRoom = async () => {
    if (!extracted && !manualData) {
      throw new Error("No data to submit");
    }

    const dataToSubmit = manualData || extracted;
    
    // Prepare images array with labels and captions - SAME AS POSTROOM.JSX
    const images = selectedFiles
      .filter(f => f.uploadedUrl)
      .map((img, index) => ({
        url: img.uploadedUrl,
        label: img.label,
        caption: img.caption || "",
        sequence: index
      }));

    // Prepare room data according to backend requirements
    const roomBody = {
      rent: Number(dataToSubmit.rent),
      deposit: Number(dataToSubmit.deposit),
      type: dataToSubmit.type,
      furnished: dataToSubmit.furnished,
      gender: dataToSubmit.gender,
      whatsapp: dataToSubmit.whatsapp,
      phone: dataToSubmit.whatsapp, // Same as WhatsApp for now
      instagram: "",
      telegram: "",
      contactPreference: "WHATSAPP",
      brokerageRequired: false,
      brokerageAmount: null,
      description: dataToSubmit.description,
      address: {
        line1: dataToSubmit.area || "",
        area: dataToSubmit.area || "",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001", // Default pincode
        latitude: null,
        longitude: null
      },
      amenities: selectedAmenities, // Include extracted amenities
      images: images
    };

    const result = await roomsAPI.createRoom(roomBody);
    return result;
  };

  // Complete process
  const completeUpload = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to upload rooms");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    setValidationErrors([]);

    try {
      // Step 1: Upload images
      toast.loading("Uploading images...");
      const uploadSuccess = await uploadImages();
      
      if (!uploadSuccess) {
        throw new Error("Image upload failed");
      }

      // Check if all images are uploaded
      const uploadedImages = selectedFiles.filter(f => f.uploadedUrl);
      if (uploadedImages.length < 1) {
        throw new Error("Please upload at least 1 image");
      }

      // Step 2: Submit room
      toast.loading("Creating room listing...");
      const result = await submitRoom();

      // Cleanup
      selectedFiles.forEach(img => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });

      toast.success("Room posted successfully!");
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = `/room/${result.id}`;
      }, 1500);

    } catch (err) {
      console.error("Upload error:", err);
      
      let errorMessage = "Failed to post room";
      if (err.message.includes("400")) {
        errorMessage = "Validation failed. Please check all fields.";
      } else if (err.message.includes("401")) {
        errorMessage = "Session expired. Please login again.";
      } else if (err.message.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      selectedFiles.forEach(img => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [selectedFiles]);

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Sample messages with amenities
  const sampleMessages = [
    "PG for boys in Kothrud. Rent: 8k, deposit: 5k. Amenities: washing machine, AC, wifi, geyser. Contact: 9876543210",
    "1 BHK fully furnished flat in Hinjewadi. Rent: 15000, deposit: 30000. For girls only. Amenities: lift, parking, water purifier, security.",
    "Shared room in Viman Nagar. Rent: 6000, deposit: 10000. Semi-furnished. Amenities: wifi, study table, wardrobe. Contact: 8765432109",
    "✅ Urgent Requirement ✅ 1 Girl Vacancy available. Fully furnished 2bhk flat. 4 sharing. Amenities: washing machine, AC, geyser, water purifier. Contact: 9998887770"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            AI Room Scanner
          </h1>
          <p className="text-lg text-slate-600">
            Paste any WhatsApp/Telegram message about room availability and let AI do the work!
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm">
            <FiCheck /> 100% Free • AI Extracts Amenities • No Credit Card Required
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}
                  ${step === currentStep ? 'ring-4 ring-blue-200' : ''}
                  font-semibold
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Input Message */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Step 1: Paste Your Message
            </h2>
            
            {/* Sample Messages */}
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-3">Try these samples (AI will extract amenities automatically):</p>
              <div className="space-y-2">
                {sampleMessages.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessage(sample);
                      toast.success("Sample message loaded!");
                    }}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 border border-slate-200 transition"
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{sample}</span>
                      <FiCopy className="text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <label className="block mb-3 font-medium text-slate-900">
                Paste message here:
              </label>
              <textarea
                rows="10"
                placeholder="Example: 'PG available for girls in Kothrud. Rent: 8k, deposit: 10k. Fully furnished with WiFi, AC, washing machine, geyser, and food. Contact: 9876543210'"
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={extracting}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-slate-500">
                  {message.length} characters
                </span>
                <button
                  onClick={() => copyToClipboard(message)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FiCopy size={14} /> Copy
                </button>
              </div>
            </div>

            {/* Extract Button */}
            <button
              onClick={extractData}
              disabled={extracting || !message.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-3"
            >
              {extracting ? (
                <>
                  <Spinner size={24} className="text-white" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <FiCheck size={24} />
                  Extract Details with AI
                </>
              )}
            </button>

            {extracting && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <Spinner size={24} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">AI is working...</p>
                    <p className="text-sm text-blue-600">
                      Extracting rent, location, amenities, contact details and more
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review Data */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Step 2: Review Extracted Data
            </h2>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800 mb-2">Please fix these issues:</p>
                    <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Data Display/Edit */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={manualData.rent || ""}
                    onChange={(e) => handleManualUpdate('rent', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg"
                    min="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={manualData.deposit || ""}
                    onChange={(e) => handleManualUpdate('deposit', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Room Type
                  </label>
                  <select
                    value={manualData.type || ""}
                    onChange={(e) => handleManualUpdate('type', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Type</option>
                    <option value="RK">1 RK</option>
                    <option value="BHK1">1 BHK</option>
                    <option value="BHK2">2 BHK</option>
                    <option value="BHK3">3 BHK</option>
                    <option value="SHARED">Shared Room</option>
                    <option value="PG">PG/Hostel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Area / Location
                  </label>
                  <input
                    type="text"
                    value={manualData.area || ""}
                    onChange={(e) => handleManualUpdate('area', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg"
                    placeholder="e.g. Kothrud, Hinjewadi"
                  />
                </div>
              </div>

              {/* Right Column - Other Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Preferred For
                  </label>
                  <select
                    value={manualData.gender || ""}
                    onChange={(e) => handleManualUpdate('gender', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="BOYS">Boys Only</option>
                    <option value="GIRLS">Girls Only</option>
                    <option value="ANYONE">Anyone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Furnishing
                  </label>
                  <select
                    value={manualData.furnished || ""}
                    onChange={(e) => handleManualUpdate('furnished', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={manualData.whatsapp || ""}
                        onChange={(e) => handleManualUpdate('whatsapp', e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg"
                        placeholder="10-digit number"
                        maxLength="10"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(manualData.whatsapp)}
                      className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      title="Copy number"
                    >
                      <FaWhatsapp />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={manualData.description || ""}
                    onChange={(e) => handleManualUpdate('description', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg resize-none"
                    placeholder="Room description..."
                  />
                </div>
              </div>
            </div>

            {/* Amenities Selector Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Amenities (AI Detected {selectedAmenities.length})
              </label>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <AmenitiesSelector
                  selectedAmenities={selectedAmenities}
                  onChange={handleAmenitiesChange}
                />
                {selectedAmenities.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    No amenities detected in message. You can add them manually above.
                  </p>
                )}
                {selectedAmenities.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <FiCheck className="text-green-600" />
                    <span className="text-sm text-green-700">
                      {selectedAmenities.length} amenity(ies) detected from message
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                ← Back to Message
              </button>
              <button
                onClick={validateAndProceed}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                ✓ Continue to Image Upload
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Images (WITH LABELS & CAPTIONS) */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl border p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Step 3: Upload Room Photos (Add Labels & Captions)
            </h2>

            {/* Data Summary */}
            <div className="mb-8 p-6 bg-slate-50 rounded-xl border">
              <h3 className="font-semibold text-slate-800 mb-4">Room Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600">Rent</p>
                  <p className="font-bold text-lg">₹{formatNumber(manualData.rent)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Deposit</p>
                  <p className="font-bold text-lg">₹{formatNumber(manualData.deposit)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Type</p>
                  <p className="font-bold text-lg">{manualData.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Location</p>
                  <p className="font-bold text-lg">{manualData.area}</p>
                </div>
              </div>
              
              {/* Amenities Summary */}
              {selectedAmenities.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-2">Amenities Detected</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAmenities.slice(0, 8).map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {amenity.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {selectedAmenities.length > 8 && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        +{selectedAmenities.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload Section (SAME AS POSTROOM.JSX) */}
            <div className="bg-white p-6 rounded-2xl shadow border mb-8">
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

                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={uploading}
                      onClick={uploadImages}
                    >
                      {uploading ? "Uploading..." : "Upload All Photos"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                ← Back to Details
              </button>
              <button
                onClick={completeUpload}
                disabled={uploading || selectedFiles.length === 0 || !isAuthenticated}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size={24} className="text-white" />
                    Uploading...
                  </div>
                ) : !isAuthenticated ? (
                  "Please Login to Upload"
                ) : (
                  "🚀 Publish Room Listing"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats/Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="text-3xl font-bold text-blue-700 mb-2">100%</div>
            <div className="font-medium text-blue-800 mb-1">Free Forever</div>
            <p className="text-sm text-blue-600">No hidden charges, no credit card required</p>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <div className="text-3xl font-bold text-green-700 mb-2">95%</div>
            <div className="font-medium text-green-800 mb-1">Amenity Accuracy</div>
            <p className="text-sm text-green-600">AI accurately extracts amenities from messages</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <div className="text-3xl font-bold text-purple-700 mb-2">2 Min</div>
            <div className="font-medium text-purple-800 mb-1">Average Time</div>
            <p className="text-sm text-purple-600">From message to published listing</p>
          </div>
        </div>
      </main>
    </div>
  );
}