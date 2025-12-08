import { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { roomsAPI, uploadService } from "../services/api";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import {
  FiUpload,
  FiTrash2,
  FiCamera,
  FiDollarSign,
  FiHome,
  FiMapPin,
  FiMessageSquare,
  FiCheck,
} from "react-icons/fi";

const MAX_FILES = 10;
const MAX_ORIGINAL_SIZE_MB = 5;
const MAX_PARALLEL_UPLOADS = 3;
const MAX_UPLOAD_RETRIES = 2;

const initialFormState = {
  rent: "",
  deposit: "",
  type: "",
  furnished: "",
  gender: "",
  whatsapp: "",
  description: "",
  address: {
    line1: "",
    area: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "",
    latitude: null,
    longitude: null,
  },
  imageUrls: [],
};

export default function PostRoom() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState(initialFormState);

  /* ======================================================
      REDIRECT IF NOT LOGGED IN
  ====================================================== */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to post a room");
      router.push("/?redirect=/post");
    }
  }, [authLoading, isAuthenticated, router]);

  /* ======================================================
      AUTO-FILL WHATSAPP FIELD
  ====================================================== */
  useEffect(() => {
    if (user?.phone) {
      setForm((prev) => ({ ...prev, whatsapp: user.phone }));
    }
  }, [user]);

  /* ======================================================
      FORM INPUT HANDLER
  ====================================================== */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  /* ======================================================
      IMAGE SELECT + COMPRESSION
  ====================================================== */
  const handleImageSelect = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      if (files.length + selectedFiles.length > MAX_FILES) {
        toast.error(`You can upload maximum ${MAX_FILES} images`);
        return;
      }

      const compressedFiles = [];
      const maxSizeBytes = MAX_ORIGINAL_SIZE_MB * 1024 * 1024;

      for (const file of files) {
        if (file.size > maxSizeBytes) {
          toast.error(`File ${file.name} exceeds ${MAX_ORIGINAL_SIZE_MB}MB`);
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
            progress: 0,
            error: null,
          });
        } catch {
          toast.error(`Failed to compress ${file.name}`);
        }
      }

      setSelectedFiles((prev) => [...prev, ...compressedFiles]);
      e.target.value = null;
    },
    [selectedFiles.length]
  );

  /* ======================================================
      REMOVE SELECTED IMAGE
  ====================================================== */
  const removeImage = useCallback((index) => {
    setSelectedFiles((prev) => {
      const arr = [...prev];
      const removed = arr.splice(index, 1)[0];

      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);

      if (removed?.uploadedUrl) {
        setForm((f) => ({
          ...f,
          imageUrls: f.imageUrls.filter((u) => u !== removed.uploadedUrl),
        }));
      }

      return arr;
    });

    setUploadProgress((prev) => {
      const cp = { ...prev };
      delete cp[index];
      return cp;
    });
  }, []);

  /* ======================================================
      CLOUDINARY UPLOAD
  ====================================================== */
  const uploadImages = useCallback(async () => {
    const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD || !PRESET) {
      toast.error("Cloudinary not configured");
      return;
    }

    const pending = selectedFiles
      .map((f, i) => ({ ...f, index: i }))
      .filter((f) => !f.uploadedUrl);

    if (!pending.length) {
      toast.success("All photos already uploaded");
      return;
    }

    setUploading(true);

    const uploadSingle = async (fileObj, attempt = 1) => {
      try {
        const result = await uploadService.uploadToCloudinary(
          fileObj.file,
          CLOUD,
          PRESET,
          (pct) =>
            setUploadProgress((prev) => ({ ...prev, [fileObj.index]: pct }))
        );

        setSelectedFiles((prev) => {
          const upd = [...prev];
          upd[fileObj.index] = {
            ...upd[fileObj.index],
            uploadedUrl: result.url,
            progress: 100,
            error: null,
          };
          return upd;
        });

        setForm((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, result.url],
        }));
      } catch (err) {
        if (attempt < MAX_UPLOAD_RETRIES) {
          await uploadSingle(fileObj, attempt + 1);
        } else {
          setSelectedFiles((prev) => {
            const upd = [...prev];
            upd[fileObj.index].error = "Upload failed";
            return upd;
          });
        }
      }
    };

    try {
      for (let i = 0; i < pending.length; i += MAX_PARALLEL_UPLOADS) {
        const chunk = pending.slice(i, i + MAX_PARALLEL_UPLOADS);
        await Promise.all(chunk.map((f) => uploadSingle(f)));
      }

      toast.success("Upload complete");
    } finally {
      setUploading(false);
    }
  }, [selectedFiles]);

  /* ======================================================
      VALIDATION
  ====================================================== */
  const validateForm = useCallback(() => {
    const errors = [];

    if (!form.rent || +form.rent < 1000) errors.push("Rent must be at least ₹1000");
    if (!form.deposit || +form.deposit < 0) errors.push("Deposit must be positive");
    if (!form.type) errors.push("Select a room type");
    if (!form.furnished) errors.push("Select furnishing status");
    if (!form.gender) errors.push("Select preferred gender");

    if (!form.whatsapp || form.whatsapp.length !== 10)
      errors.push("Invalid WhatsApp number");

    if (!form.address.line1) errors.push("Enter full address");
    if (!form.address.area) errors.push("Enter locality");
    if (!/^\d{6}$/.test(form.address.pincode))
      errors.push("Invalid 6-digit pincode");

    if (form.imageUrls.length < 1)
      errors.push("Upload at least one image and click 'Upload Photos'");

    errors.forEach((e) => toast.error(e));
    return errors.length === 0;
  }, [form]);

  /* ======================================================
      SUBMIT FORM → CREATE ROOM
  ====================================================== */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);

      try {
        const body = {
          ...form,
          rent: +form.rent,
          deposit: +form.deposit,
        };

        const res = await roomsAPI.createRoom(body);

        toast.success("Room posted successfully!");
        router.push(`/room/${res.id}`);
      } catch (err) {
        toast.error(err.message || "Failed to post room");
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  /* ======================================================
      UI RENDER
  ====================================================== */
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  const uploadedCount = selectedFiles.filter((f) => f.uploadedUrl).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Post Your Room</h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* ------------------------------------------------------ */}
          {/* PHOTOS SECTION */}
          {/* ------------------------------------------------------ */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiCamera /> Photos
            </h2>

            <label className="block cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={uploading}
              />
              <div className="p-8 border-2 border-dashed rounded-xl text-center">
                <FiUpload size={32} className="mx-auto text-slate-400" />
                <p>Click or drag & drop to upload</p>
                <p className="text-xs text-slate-500">
                  Max {MAX_FILES} files, auto-compressed
                </p>
              </div>
            </label>

            {/* Preview Grid */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="relative">
                    <img
                      src={f.previewUrl}
                      alt="preview"
                      className="rounded-xl object-cover h-32 w-full"
                    />

                    {!f.uploadedUrl ? (
                      <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center">
                        {f.error ? (
                          <>
                            <p className="text-xs">{f.error}</p>
                            <button
                              onClick={uploadImages}
                              className="mt-2 bg-white text-red-600 px-2 rounded"
                            >
                              Retry
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{uploadProgress[i] || 0}%</span>
                            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-green-500/60 flex items-center justify-center">
                        <FiCheck size={28} className="text-white" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              disabled={uploading}
              onClick={uploadImages}
            >
              {uploading ? "Uploading..." : "Upload Photos"}
            </button>
          </div>

          {/* ------------------------------------------------------ */}
          {/* PRICING */}
          {/* ------------------------------------------------------ */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiDollarSign /> Pricing
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <input
                name="rent"
                type="number"
                placeholder="Monthly Rent ₹"
                value={form.rent}
                onChange={handleInputChange}
                className="border px-4 py-3 rounded-lg"
              />

              <input
                name="deposit"
                type="number"
                placeholder="Deposit ₹"
                value={form.deposit}
                onChange={handleInputChange}
                className="border px-4 py-3 rounded-lg"
              />
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* ROOM DETAILS */}
          {/* ------------------------------------------------------ */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiHome /> Room Details
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <select
                name="type"
                value={form.type}
                onChange={handleInputChange}
                className="border px-4 py-3 rounded-lg"
              >
                <option value="">Select Type</option>
                <option value="RK">1 RK</option>
                <option value="BHK1">1 BHK</option>
                <option value="BHK2">2 BHK</option>
                <option value="SHARED">Shared Room</option>
                <option value="PG">PG</option>
              </select>

              <select
                name="furnished"
                value={form.furnished}
                onChange={handleInputChange}
                className="border px-4 py-3 rounded-lg"
              >
                <option value="">Furnishing</option>
                <option value="FURNISHED">Fully Furnished</option>
                <option value="SEMI_FURNISHED">Semi-furnished</option>
                <option value="UNFURNISHED">Unfurnished</option>
              </select>

              <select
                name="gender"
                value={form.gender}
                onChange={handleInputChange}
                className="border px-4 py-3 rounded-lg"
              >
                <option value="">Preferred For</option>
                <option value="BOYS">Boys</option>
                <option value="GIRLS">Girls</option>
                <option value="ANYONE">Anyone</option>
              </select>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* ADDRESS */}
          {/* ------------------------------------------------------ */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiMapPin /> Address
            </h2>

            <input
              name="address.line1"
              placeholder="Flat/Building/Street"
              value={form.address.line1}
              onChange={handleInputChange}
              className="border px-4 py-3 rounded-lg w-full mb-4"
            />

            <input
              name="address.area"
              placeholder="Area / Locality"
              value={form.address.area}
              onChange={handleInputChange}
              className="border px-4 py-3 rounded-lg w-full mb-4"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="address.city"
                value={form.address.city}
                className="border px-4 py-3 rounded-lg"
                readOnly
              />

              <input
                name="address.state"
                value={form.address.state}
                className="border px-4 py-3 rounded-lg"
                readOnly
              />
            </div>

            <input
              name="address.pincode"
              placeholder="Pincode"
              value={form.address.pincode}
              onChange={handleInputChange}
              maxLength="6"
              className="border px-4 py-3 rounded-lg w-full mt-4"
            />
          </div>

          {/* ------------------------------------------------------ */}
          {/* CONTACT + DESCRIPTION */}
          {/* ------------------------------------------------------ */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiMessageSquare /> Contact & Description
            </h2>

            <div className="flex mb-4">
              <span className="bg-green-200 px-4 flex items-center rounded-l-lg">
                +91
              </span>
              <input
                type="text"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleInputChange}
                placeholder="Whatsapp number"
                maxLength="10"
                className="border px-4 py-3 rounded-r-lg flex-1"
              />
            </div>

            <textarea
              name="description"
              rows="6"
              placeholder="Describe your room..."
              value={form.description}
              onChange={handleInputChange}
              className="border px-4 py-3 rounded-lg w-full"
            />
          </div>

          {/* ------------------------------------------------------ */}
          {/* SUBMIT */}
          {/* ------------------------------------------------------ */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold"
          >
            {loading ? "Posting..." : "Post Room"}
          </button>
        </form>
      </main>
    </div>
  );
}
