import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/* ==========================================
   REQUEST INTERCEPTOR → TOKEN + USER ID
========================================== */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ⭐ Add logged-in User ID to every request
      if (user) {
        try {
          const userObj = JSON.parse(user);
          if (userObj?.id) {
            config.headers["X-User-Id"] = userObj.id;
          }
        } catch (_) {}
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ==========================================
   RESPONSE INTERCEPTOR
========================================== */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    const errMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(errMsg));
  }
);

/* ==========================================
   =============== AUTH API =================
========================================== */
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password) => api.post("/auth/register", { name, email, password }),
  googleLogin: (idToken) => api.post("/auth/google", { idToken }),
  getCurrentUser: () => api.get("/auth/me"),
};

/* ==========================================
   =============== ROOMS API ================
========================================== */
export const roomsAPI = {
  getAllRooms: (params = {}) =>
    api.get("/api/rooms", { params }),

  getRoomById: (id) =>
    api.get(`/api/rooms/${id}`),

  searchRooms: (params = {}) =>
    api.get("/api/rooms/search", { params }),

  getFeaturedRooms: () =>
    api.get("/api/rooms/featured"),

  getPopularAreas: () =>
    api.get("/api/rooms/popular-areas"),

  createRoom: (roomData) =>
    api.post("/api/rooms", roomData),

  updateRoom: (id, roomData) =>
    api.put(`/api/rooms/${id}`, roomData),

  deleteRoom: (id) =>
    api.delete(`/api/rooms/${id}`),

  getMyRooms: (page = 0, size = 20) =>
    api.get("/api/rooms/my-rooms", { params: { page, size } }),
};

/* ==========================================
   CLOUDINARY UPLOAD SERVICE
========================================== */
export const uploadService = {
  uploadToCloudinary: (file, cloudName, uploadPreset, onProgress) =>
    new Promise((resolve, reject) => {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      // Progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          resolve({ url: res.secure_url, publicId: res.public_id });
        } else {
          reject(new Error("Cloudinary upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(data);
    }),
};

export default api;
