import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { roomsAPI } from "../../services/api";
import {
  FiMapPin,
  FiHome,
  FiUsers,
  FiStar,
  FiCheck,
  FiShare2,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiPhone,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

export default function RoomDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Fetch details
  useEffect(() => {
    if (id) fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const data = await roomsAPI.getRoomById(id);
      setRoom(data);
    } catch (err) {
      toast.error("Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  // Modern sharing
  const handleShare = async () => {
    const area = room.address?.area || "Room";
    const city = room.address?.city || "City";

    if (navigator.share) {
      await navigator.share({
        title: room.title || "Room for Rent",
        text: `Check out this room in ${area}, ${city}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleWhatsApp = () => {
    const area = room.address?.area || "Location";
    const city = room.address?.city || "City";

    const message = `Hi, I'm interested in the room at ${area}, ${city} (₹${room.rent}/month). Please share more details.`;

    window.open(
      `https://wa.me/91${room.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Placeholder loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 animate-pulse">
          <div className="h-10 bg-slate-200 w-1/3 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-200 rounded-xl"></div>
            <div className="space-y-5">
              <div className="h-8 bg-slate-200 w-2/3 rounded"></div>
              <div className="h-4 bg-slate-200 w-1/2 rounded"></div>
              <div className="h-20 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Room Not Found</h1>
          <button
            onClick={() => router.push("/rooms")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Browse Rooms
          </button>
        </div>
      </div>
    );
  }

  const images = room.imageUrls || [];
  const area = room.address?.area || "Area";
  const city = room.address?.city || "City";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <FiChevronLeft size={20} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SECTION - Images */}
          <div>
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
              <img
                src={images[currentImageIndex] || "/no-image.jpg"}
                className="w-full h-96 object-cover"
              />

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        currentImageIndex === 0
                          ? images.length - 1
                          : currentImageIndex - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        currentImageIndex === images.length - 1
                          ? 0
                          : currentImageIndex + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`rounded-xl overflow-hidden border ${
                      index === currentImageIndex
                        ? "border-blue-600"
                        : "border-transparent"
                    }`}
                  >
                    <img src={img} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SECTION - Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Header + Actions */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                  {room.type}
                </span>

                {room.isVerified && (
                  <span className="ml-2 px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full flex items-center gap-1 inline-flex">
                    <FiCheck /> Verified
                  </span>
                )}

                <h1 className="text-2xl font-bold text-slate-900 mt-3">{room.title}</h1>

                <div className="flex items-center gap-2 text-slate-600 mt-2">
                  <FiMapPin />
                  <span>
                    {area}, {city}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handleFavorite} className="p-2 hover:bg-slate-100 rounded-lg">
                  <FiHeart
                    size={22}
                    className={isFavorite ? "text-red-500 fill-red-500" : "text-slate-500"}
                  />
                </button>
                <button onClick={handleShare} className="p-2 hover:bg-slate-100 rounded-lg">
                  <FiShare2 size={22} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="bg-blue-50 p-5 rounded-xl mb-6">
              <div className="text-blue-600 text-sm">Monthly Rent</div>
              <div className="text-3xl font-bold text-slate-900">
                ₹{room.rent?.toLocaleString("en-IN")}
              </div>
              <div className="text-slate-500 text-sm">
                + ₹{room.deposit?.toLocaleString("en-IN")} deposit
              </div>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiHome className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Furnishing</p>
                  <p className="font-medium">{room.furnished}</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FiUsers className="text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Preferred For</p>
                  <p className="font-medium">
                    {room.gender === "BOYS"
                      ? "Boys Only"
                      : room.gender === "GIRLS"
                      ? "Girls Only"
                      : "Anyone"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Description</h2>
              <p className="text-slate-700 leading-relaxed">
                {room.description || "No description provided."}
              </p>
            </div>

            {/* Contact Owner */}
            {!showContact ? (
              <div className="bg-slate-50 p-6 rounded-xl text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Interested in this room?
                </h3>
                <p className="text-slate-600 mb-5">
                  Contact owner and schedule a visit.
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleWhatsApp}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl flex items-center gap-2 hover:bg-green-700"
                  >
                    <FaWhatsapp size={20} /> WhatsApp
                  </button>

                  <button
                    onClick={() => setShowContact(true)}
                    className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 flex items-center gap-2"
                  >
                    <FiPhone size={20} /> View Number
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact Owner</h3>

                <p className="text-lg font-semibold mb-4">
                  +91 {room.whatsapp}
                </p>

                <div className="flex gap-4">
                  <a
                    href={`tel:+91${room.whatsapp}`}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-center hover:bg-blue-700"
                  >
                    Call Now
                  </a>

                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 flex justify-center items-center gap-2"
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
              <h4 className="font-semibold text-yellow-800 mb-2">Safety Tips</h4>
              <ul className="text-yellow-700 space-y-1">
                <li>• Visit the property before making payments</li>
                <li>• Do not pay token without verification</li>
                <li>• Confirm documents & agreement carefully</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Rooms Placeholder */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Similar Rooms in {area}
          </h2>
          <p className="text-slate-500">Coming soon...</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
