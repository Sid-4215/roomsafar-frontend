import { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { roomsAPI, uploadService } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import imageCompression from "browser-image-compression";

// Type mapping to ensure compatibility with backend
const TYPE_MAPPING = {
  "RK": "RK",
  "1RK": "RK",
  "1 RK": "RK",
  "SHARED": "SHARED",
  "PG": "PG",
  "1BHK": "BHK1",
  "1 BHK": "BHK1",
  "BHK1": "BHK1",
  "2BHK": "BHK2",
  "2 BHK": "BHK2",
  "BHK2": "BHK2",
  "3BHK": "BHK3",
  "3 BHK": "BHK3",
  "BHK3": "BHK3",
  "UNKNOWN": "UNKNOWN"
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
  "BOTH": "ANYONE"
};

// Furnished mapping
const FURNISHED_MAPPING = {
  "FURNISHED": "FURNISHED",
  "FULLY FURNISHED": "FURNISHED",
  "SEMI_FURNISHED": "SEMI_FURNISHED",
  "SEMI": "SEMI_FURNISHED",
  "SEMI FURNISHED": "SEMI_FURNISHED",
  "UNFURNISHED": "UNFURNISHED",
  "NOT FURNISHED": "UNFURNISHED"
};

export default function AIScanner() {
  const { isAuthenticated } = useContext(AuthContext);

  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  // Clean extracted data and map to correct values
  const cleanExtractedData = (data) => {
    if (!data) return null;
    
    const cleaned = { ...data };
    
    // Clean rent: handle "k" notation and remove commas
    if (cleaned.rent) {
      let rentStr = String(cleaned.rent).toLowerCase().replace(/,/g, '');
      if (rentStr.includes('k')) {
        rentStr = rentStr.replace('k', '');
        cleaned.rent = parseFloat(rentStr) * 1000;
      } else {
        cleaned.rent = parseInt(rentStr) || 0;
      }
    }
    
    // Clean deposit
    if (cleaned.deposit) {
      let depositStr = String(cleaned.deposit).toLowerCase().replace(/,/g, '');
      if (depositStr.includes('k')) {
        depositStr = depositStr.replace('k', '');
        cleaned.deposit = parseFloat(depositStr) * 1000;
      } else {
        cleaned.deposit = parseInt(depositStr) || 0;
      }
    }
    
    // Map type
    if (cleaned.type) {
      const typeUpper = cleaned.type.toUpperCase().trim();
      cleaned.type = TYPE_MAPPING[typeUpper] || "UNKNOWN";
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
    
    // Clean WhatsApp number (remove spaces, +91, etc.)
    if (cleaned.whatsapp) {
      cleaned.whatsapp = String(cleaned.whatsapp).replace(/\D/g, '').slice(-10);
    }
    
    return cleaned;
  };

  // Select Images with compression
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const compressedFiles = [];
    
    for (const file of files) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });

        compressedFiles.push({
          file: compressed,
          previewUrl: URL.createObjectURL(compressed),
          name: file.name,
          type: compressed.type || "image/jpeg",
        });
      } catch (err) {
        console.error("Compression error:", err);
        // Fallback to original file
        compressedFiles.push({
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          type: file.type || "image/jpeg",
        });
      }
    }

    setImages(compressedFiles);
  };

  // Extract info using GROQ AI
  const extractData = async () => {
    if (!message.trim()) {
      toast.error("Paste Telegram/WhatsApp message first");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/extract-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      
      if (data.error) {
        console.error("AI extraction error:", data.error);
        throw new Error(data.error || "Extraction failed");
      }

      // Clean and map the extracted data
      const cleanedData = cleanExtractedData(data);
      setExtracted(cleanedData);
      toast.success("AI extracted details!");
    } catch (err) {
      console.error("Extraction error:", err);
      toast.error("AI extraction failed: " + err.message);
    }

    setLoading(false);
  };

  // Upload images to Cloudinary with retry logic
  const uploadImages = async () => {
    const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD || !PRESET) {
      console.error("Missing Cloudinary config:", { CLOUD, PRESET });
      toast.error("Cloudinary configuration missing");
      return [];
    }

    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      let uploaded = false;
      let retries = 2;

      while (!uploaded && retries > 0) {
        try {
          console.log(`Uploading ${img.name}, attempt ${3 - retries}`);
          
          const res = await uploadService.uploadToCloudinary(
            img.file,
            CLOUD,
            PRESET,
            (progress) => {
              setUploadProgress(prev => ({ ...prev, [i]: progress }));
            }
          );

          uploadedUrls.push(res.url);
          uploaded = true;
          console.log(`Uploaded ${img.name}: ${res.url}`);
          
          setUploadProgress(prev => ({ ...prev, [i]: 100 }));
        } catch (err) {
          console.error(`Upload attempt failed for ${img.name}:`, err);
          retries--;
          
          if (retries === 0) {
            toast.error(`Failed to upload ${img.name}`);
            throw new Error(`Upload failed for ${img.name}`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    return uploadedUrls;
  };

  // Upload images + create room
  const uploadAndSubmit = async () => {
    if (!extracted) {
      toast.error("Extract data first");
      return;
    }
    
    if (images.length === 0) {
      toast.error("Select at least 1 image");
      return;
    }

    setLoading(true);
    setUploadProgress({});

    let uploadedUrls = [];

    try {
      // Upload images
      uploadedUrls = await uploadImages();
      
      if (uploadedUrls.length === 0) {
        throw new Error("No images uploaded successfully");
      }

      // Prepare room data - ensure all fields match backend expectations
      const roomBody = {
        rent: Number(extracted.rent) || 0,
        deposit: Number(extracted.deposit) || 0,
        type: extracted.type || "UNKNOWN",
        furnished: extracted.furnished || "UNFURNISHED",
        gender: extracted.gender || "ANYONE",
        whatsapp: extracted.whatsapp || "",
        description: extracted.description || "No description provided",
        imageUrls: uploadedUrls,
        address: {
          line1: extracted.area || "Not Provided",
          area: extracted.area || "",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
        },
      };

      console.log("Submitting room:", JSON.stringify(roomBody, null, 2));

      // Create room
      const result = await roomsAPI.createRoom(roomBody);
      toast.success("Room posted successfully!");
      
      // Cleanup image previews
      images.forEach(img => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
      
      // Redirect to new room
      window.location.href = `/room/${result.id}`;
      
    } catch (err) {
      console.error("Upload and submit error:", err);
      
      // Try to get more details from the error
      if (err.message.includes("400")) {
        // Log the exact request that failed
        console.error("Bad Request Details:", {
          extracted,
          roomBody,
          imagesCount: images.length,
          uploadedUrlsCount: uploadedUrls.length
        });
        
        // Try to parse if there's a response with validation errors
        if (err.response) {
          console.error("Error response:", err.response);
        }
        
        toast.error("Validation failed. Check console for details.");
      } else {
        toast.error(err.message || "Failed to post room");
      }
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  // Cleanup on unmount
  useState(() => {
    return () => {
      images.forEach(img => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [images]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-4">AI Room Scanner (FREE)</h1>

        {!isAuthenticated && (
          <p className="text-red-600 mb-4">Login required to auto-upload rooms.</p>
        )}

        {/* Message Input */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Paste Telegram/WhatsApp message:</label>
          <textarea
            rows="8"
            placeholder="Example: PG available for girls in Kothrud. Rent: 7k, deposit: 10k. Contact: 9876543210..."
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          onClick={extractData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !message.trim()}
        >
          {loading ? "Extracting..." : "Extract Info (AI FREE)"}
        </button>

        {/* Extracted Preview */}
        {extracted && (
          <div className="mt-6 p-4 bg-white shadow rounded-xl border">
            <h3 className="font-semibold mb-2">Extracted Data</h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Rent:</strong> ₹{extracted.rent}</div>
                <div><strong>Deposit:</strong> ₹{extracted.deposit}</div>
                <div><strong>Type:</strong> {extracted.type}</div>
                <div><strong>Furnished:</strong> {extracted.furnished}</div>
                <div><strong>Gender:</strong> {extracted.gender}</div>
                <div><strong>WhatsApp:</strong> {extracted.whatsapp}</div>
                <div className="col-span-2">
                  <strong>Area:</strong> {extracted.area}
                </div>
                <div className="col-span-2">
                  <strong>Description:</strong> {extracted.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="mt-6 p-4 bg-white rounded-xl shadow border">
          <h3 className="font-semibold mb-2">Upload Room Images</h3>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleImageSelect}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {images.length > 0 && (
            <>
              <p className="text-sm mt-2 mb-4">{images.length} file(s) selected</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="rounded-lg object-cover h-32 w-full"
                    />
                    {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Spinner size={24} />
                          <p className="text-xs mt-1">{uploadProgress[index]}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={uploadAndSubmit}
          disabled={!extracted || loading || images.length === 0 || !isAuthenticated}
          className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Upload Room Automatically"}
        </button>

        {loading && (
          <div className="mt-4 flex justify-center">
            <Spinner size={40} />
          </div>
        )}
      </main>
    </div>
  );
}