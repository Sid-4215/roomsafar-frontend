import { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { roomsAPI } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import {
  FiEdit,
  FiTrash2,
  FiHome,
  FiMapPin,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Spinner from "../components/Spinner";   // ✅ ADD THIS

export default function MyRooms() {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to view your listings");
      router.push("/");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchMyRooms();
  }, [isAuthenticated]);

  const fetchMyRooms = async () => {
    try {
      setLoading(true);
      const data = await roomsAPI.getMyRooms(0, 50);
      setRooms(data.content || []);
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id) => {
    if (!confirm("Delete this listing?")) return;

    try {
      await roomsAPI.deleteRoom(id);
      toast.success("Listing deleted");
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <Spinner size={48} />  {/* ✅ unified spinner */}
        </div>
      </div>
    );

  const formatType = (t) => {
    const map = {
      RK: "1 RK",
      BHK1: "1 BHK",
      BHK2: "2 BHK",
      SHARED: "Shared Room",
      PG: "PG",
    };
    return map[t] || t;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size={40} /> {/* 🔵 unified spinner */}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24">
            <FiHome size={48} className="text-slate-400 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-slate-700">
              No Listings Found
            </h2>
            <p className="text-slate-500 mt-2 mb-6">
              You have not posted any rooms yet.
            </p>

            <a
              href="/post"
              className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Post Your First Room
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const area = room.address?.area || "Unknown Area";
              const city = room.address?.city || "City";

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
                >
                  <img
                    src={room.imageUrls?.[0] || "/no-image.jpg"}
                    alt="room"
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {formatType(room.type)} • ₹{room.rent}
                    </h3>

                    <div className="flex items-center text-slate-600 text-sm mb-4">
                      <FiMapPin size={14} className="mr-1" />
                      {area}, {city}
                    </div>

                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => router.push(`/room/${room.id}`)}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        View
                      </button>

                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/edit-room/${room.id}`)}
                          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          <FiEdit className="text-blue-600" />
                        </button>

                        <button
                          onClick={() => deleteRoom(room.id)}
                          className="p-2 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          <FiTrash2 className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
