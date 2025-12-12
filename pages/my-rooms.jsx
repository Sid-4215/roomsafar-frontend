import { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { roomsAPI } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import { FiHome, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Spinner from "../components/Spinner";


// ⭐ NEW IMPORT
import EditRoomCard from "../components/EditRoomCard";

// Room type formatter function
const formatRoomType = (type) => {
  if (!type) return "Room";

  type = type.toUpperCase();

  const bhkMatch = type.match(/BHK(\d+)/);
  if (bhkMatch) return `${bhkMatch[1]}BHK`;

  const rkMatch = type.match(/(\d+)RK/);
  if (rkMatch) return `${rkMatch[1]} RK`;

  if (type === "SHARED" || type === "SHARED_ROOM") return "Shared Room";
  if (type === "PRIVATE_ROOM") return "Private Room";
  if (type === "SINGLE_ROOM") return "Single Room";
  if (type === "MASTER_ROOM") return "Master Room";

  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function MyRooms() {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to view your listings");
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyRooms();
    }
  }, [isAuthenticated]);

  const fetchMyRooms = async () => {
    try {
      setLoading(true);
      const data = await roomsAPI.getMyRooms(0, 50);
      const roomsList = data.content || data || [];
      setRooms(Array.isArray(roomsList) ? roomsList : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load your listings");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);

    try {
      await roomsAPI.deleteRoom(id);
      toast.success("Listing deleted successfully");
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  const getLocation = (room) => {
    if (room.address) {
      const area = room.address.area || "";
      const city = room.address.city || "";
      return `${area}${area && city ? ", " : ""}${city}`;
    }

    const area = room.area || "";
    const city = room.city || "";
    return `${area}${area && city ? ", " : ""}${city}`;
  };

  if (authLoading || loading) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex justify-center items-center h-[70vh]">
        <Spinner size={48} />
      </div>
    </div>
  );
}


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-slate-600 text-lg">Please login to view your listings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
            <p className="text-slate-600 mt-2">
              Manage your posted rooms and listings
            </p>
          </div>

          <button
            onClick={() => router.push("/post")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FiHome size={18} /> Post New Room
          </button>
        </div>

        {/* ⭐ NEW CARDS SECTION USING EditRoomCard ⭐ */}
        {rooms.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border">
            <FiHome size={64} className="text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-slate-700 mb-3">
              No Listings Yet
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Start sharing your available rooms with potential tenants.
              It only takes a few minutes to create your first listing.
            </p>

            <button
              onClick={() => router.push("/post")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition"
            >
              Post Your First Room
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <EditRoomCard
                key={room.id}
                room={room}
                onEdit={() => router.push(`/edit-room/${room.id}`)}
                onDelete={() => deleteRoom(room.id)}
              />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
