import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { roomsAPI } from "../services/api";
import { FiCheckCircle, FiShare2, FiCopy, FiExternalLink } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

export default function RoomSuccess() {
  const router = useRouter();
  const { id } = router.query;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      try {
        const roomData = await roomsAPI.getRoomById(id);
        setRoom(roomData);
      } catch (error) {
        console.error('Error fetching room:', error);
        toast.error('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!id) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/room/${id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [id, router]);

  const shareRoom = async () => {
    const roomUrl = `${window.location.origin}/room/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my room on Roomsafar`,
          text: `I just listed my room on Roomsafar. Check it out!`,
          url: roomUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback to copy
          await navigator.clipboard.writeText(roomUrl);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(roomUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const copyWhatsAppMessage = () => {
    const message = `Check out my room listing on Roomsafar: ${window.location.origin}/room/${id}`;
    navigator.clipboard.writeText(message);
    toast.success('Message copied! Paste it on WhatsApp');
  };

  const shareOnWhatsApp = () => {
    const message = `Check out my room listing on Roomsafar: ${window.location.origin}/room/${id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <FiCheckCircle className="text-green-600" size={40} />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Your room has been posted successfully!
            </h1>
            <p className="text-slate-600">
              Your listing is now live and visible to potential tenants.
            </p>
          </div>

          {/* Room Preview */}
          {room && (
            <div className="mb-10 bg-slate-50 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="rounded-xl overflow-hidden bg-slate-200 aspect-square">
                    {room.imageUrls?.[0] ? (
                      <img
                        src={room.imageUrls[0]}
                        alt="Room preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-slate-400">No image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">
                    ₹{room.rent?.toLocaleString("en-IN")}/month • {room.area}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Room Type</p>
                      <p className="font-medium">{room.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Furnishing</p>
                      <p className="font-medium">{room.furnished}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Deposit</p>
                      <p className="font-medium">₹{room.deposit?.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Listing ID</p>
                      <p className="font-mono font-medium">{room.id}</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm">
                    {room.description?.substring(0, 200)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Share Options */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Share your listing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={shareRoom}
                className="flex items-center justify-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition"
              >
                <FiShare2 size={20} />
                <span className="font-medium">Share Link</span>
              </button>
              
              <button
                onClick={shareOnWhatsApp}
                className="flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition"
              >
                <FaWhatsapp size={20} />
                <span className="font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={copyWhatsAppMessage}
                className="flex items-center justify-center gap-3 p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <FiCopy size={20} />
                <span className="font-medium">Copy Text</span>
              </button>
              
              <a
                href={`/room/${id}`}
                className="flex items-center justify-center gap-3 p-4 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition"
              >
                <FiExternalLink size={20} />
                <span className="font-medium">View Live</span>
              </a>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">What&apos;s next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Respond to inquiries</h4>
                  <p className="text-sm text-slate-600">
                    Check your WhatsApp for messages from interested tenants. Respond promptly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Schedule viewings</h4>
                  <p className="text-sm text-slate-600">
                    Arrange in-person visits for serious inquiries. Always meet in daylight hours.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Finalize tenant</h4>
                  <p className="text-sm text-slate-600">
                    Verify documents, collect deposit, and sign agreement before handing over keys.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/room/${id}`)}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:brightness-105 transition flex items-center justify-center gap-3"
            >
              View Your Listing
              <FiExternalLink />
            </button>
            
            <button
              onClick={() => router.push('/post')}
              className="px-8 py-3.5 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
            >
              Post Another Room
            </button>
          </div>

          {/* Countdown */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Redirecting to your room page in {countdown} seconds...
          </p>
          
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(5 - countdown) * 20}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}