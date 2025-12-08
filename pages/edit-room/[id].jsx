import { useEffect, useState, useContext, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { roomsAPI, uploadService } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { FiLoader, FiTrash2 } from "react-icons/fi";

export default function EditRoom() {
  const router = useRouter();
  const { id } = router.query;

  const { isAuthenticated, loading: authLoading, user } = useContext(AuthContext);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
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
          address: {
            line1: data.address?.line1 || "",
            area: data.address?.area || "",
            city: data.address?.city || "Pune",
            state: data.address?.state || "Maharashtra",
            pincode: data.address?.pincode || "",
            latitude: data.address?.latitude || null,
            longitude: data.address?.longitude || null,
          },
          imageUrls: data.imageUrls || [],
        });
      } catch {
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
    const { name, value } = e.target;

    if (name.includes(".")) {
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
      SELECT IMAGES + COMPRESS
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
          progress: 0,
          uploadedUrl: null,
        });
      } catch {
        toast.error("Image compression failed");
      }
    }

    setSelectedFiles((prev) => [...prev, ...compressedList]);
  };

  /* ========================================================
      UPLOAD PHOTOS TO CLOUDINARY
  ========================================================= */
  const uploadNewImages = async () => {
    const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD || !PRESET) {
      toast.error("Cloudinary is not configured");
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls = [];

      for (let index in selectedFiles) {
        const fileObj = selectedFiles[index];

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

        uploadedUrls.push(result.url);
      }

      setForm((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls],
      }));

      toast.success("Images uploaded successfully!");
      setSelectedFiles([]);
      setUploadProgress({});
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  /* ========================================================
      REMOVE EXISTING IMAGE
  ========================================================= */
  const removeImage = (url) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((img) => img !== url),
    }));
  };

  /* ========================================================
      SUBMIT UPDATE FORM
  ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      await roomsAPI.updateRoom(id, form);
      toast.success("Room updated successfully!");
      router.push(`/room/${id}`);
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
      LOADING UI
  ========================================================= */
  if (authLoading || loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-slate-600" size={40} />
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
        <h1 className="text-3xl font-bold mb-8">Edit Room</h1>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Rent */}
          <div>
            <label className="block mb-2 font-medium">Rent (₹)</label>
            <input
              type="number"
              name="rent"
              value={form.rent}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-lg"
            />
          </div>

          {/* Deposit */}
          <div>
            <label className="block mb-2 font-medium">Deposit (₹)</label>
            <input
              type="number"
              name="deposit"
              value={form.deposit}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-lg"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block mb-2 font-medium">Address</label>

            <input
              type="text"
              name="address.line1"
              placeholder="Flat / building"
              value={form.address.line1}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-lg mb-3"
            />

            <input
              type="text"
              name="address.area"
              placeholder="Area"
              value={form.address.area}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-lg mb-3"
            />

            <input
              type="text"
              name="address.city"
              value={form.address.city}
              readOnly
              className="w-full border px-4 py-3 rounded-lg bg-slate-100 mb-3"
            />

            <input
              type="text"
              name="address.pincode"
              placeholder="Pincode"
              value={form.address.pincode}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-lg"
            />
          </div>

          {/* Existing Images */}
          <div>
            <h3 className="font-semibold mb-3">Existing Photos</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {form.imageUrls.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    className="h-32 w-full object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Select New Photos */}
          <div>
            <label className="block mb-2 font-medium">Add More Photos</label>

            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageSelect} 
            />

            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={uploadNewImages}
                disabled={uploading}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                {uploading ? "Uploading…" : "Upload Selected"}
              </button>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

        </form>
      </main>

      <Footer />
    </div>
  );
}
