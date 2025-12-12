"use client";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  FiMapPin,
  FiHome,
  FiUsers,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiTv,
  FiWifi,
  FiMaximize2,
  FiMessageCircle,
  FiCheck,
  FiCalendar,
  FiUser,
  FiInfo,
  FiExternalLink,
  FiX,
  FiPhone,
  FiBook,
  FiCoffee,
} from "react-icons/fi";

import {
  MdOutlineLocalParking,
  MdOutlineElevator,
  MdDeck,
  MdOutlineSmokeFree,
  MdOutlineNoFood,
  MdOutlineLiquor,
  MdSecurity,
  MdVerified,
  MdCall,
  MdOutlineHouse,
  MdOutlineWater,
  MdOutlineLibraryBooks,
  MdOutlineLocalLaundryService,
  MdFitnessCenter,
  MdRestaurant,
} from "react-icons/md";

import { GiWashingMachine, GiBookshelf, GiWeightLiftingUp } from "react-icons/gi";
import { TbAirConditioning, TbMicrowave, TbTable } from "react-icons/tb";
import { FaCctv, FaRegSnowflake, FaWhatsapp, FaShieldAlt } from "react-icons/fa";
import { BsLightningCharge, BsThreeDots } from "react-icons/bs";
import { IoWaterOutline, IoCallOutline, IoSpeedometer } from "react-icons/io5";
import { LuArmchair, LuFlame } from "react-icons/lu";
import { BiWater } from "react-icons/bi";
import { Ri24HoursLine, RiWifiLine } from "react-icons/ri";

import { useRouter } from "next/navigation";

export default function RoomDetailsUI({
  room = {},
  images = [],
  currentImageIndex = 0,
  setCurrentImageIndex = () => {},
  isFavorite = false,
  handleFavorite = () => {},
  handleShare = () => {},
}) {
  const router = useRouter();
  const touchAreaRef = useRef(null);
  const detailsRef = useRef(null);
  
  // Extract address from room object
  const address = room?.address || {
    line1: room?.line1 || "",
    area: room?.area || "",
    city: room?.city || "",
    state: room?.state || "",
    pincode: room?.pincode || "",
  };
  
  // Extract images from room object if not provided as prop
  const roomImages = images.length > 0 ? images : room?.images || [];
  
  // Transform image objects to URLs array
  const imageUrls = useMemo(() => {
    if (!roomImages || roomImages.length === 0) return ["/no-image.jpg"];
    
    if (typeof roomImages[0] === 'string') {
      return roomImages;
    }
    
    if (roomImages[0]?.url) {
      return roomImages.map(img => img.url);
    }
    
    return ["/no-image.jpg"];
  }, [roomImages]);

  // States
  const [localIndex, setLocalIndex] = useState(currentImageIndex || 0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(isFavorite);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (!e.touches?.length) return;
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX == null) return;
    
    if (!e.changedTouches?.length) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 30;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        const next = (localIndex + 1) % imageUrls.length;
        setLocalIndex(next);
        setCurrentImageIndex(next);
      } else {
        const prev = localIndex === 0 ? imageUrls.length - 1 : localIndex - 1;
        setLocalIndex(prev);
        setCurrentImageIndex(prev);
      }
    }
    setTouchStartX(null);
  }, [touchStartX, localIndex, imageUrls.length, setCurrentImageIndex]);

  // Sync with external index
  useEffect(() => {
    setLocalIndex(currentImageIndex || 0);
  }, [currentImageIndex]);

  // Image load handler
  const handleImageLoad = (index) => {
    setImageLoaded((prev) => ({ ...prev, [index]: true }));
  };

  // Amenity icon mapping
  const getAmenityIcon = (key) => {
    const exactMap = {
      "WIFI": FiWifi,
      "AC": TbAirConditioning,
      "GEYSER": LuFlame,
      "WASHING_MACHINE": GiWashingMachine,
      "REFRIGERATOR": FaRegSnowflake,
      "MICROWAVE": TbMicrowave,
      "TV": FiTv,
      "CUPBOARD": LuArmchair,
      "LIFT": MdOutlineElevator,
      "PARKING": MdOutlineLocalParking,
      "SECURITY": FaShieldAlt,
      "CCTV": FaCctv,
      "HOUSEKEEPING": MdOutlineLocalLaundryService,
      "ATTACHED_BATHROOM": IoWaterOutline,
      "BALCONY": MdDeck,
      "STUDY_TABLE": TbTable,
      "WATER_PURIFIER": FiDroplet,
      "INVERTER": BsLightningCharge,
      "NO_NON_VEG": MdOutlineNoFood,
      "NO_SMOKING": MdOutlineSmokeFree,
      "NO_ALCOHOL": MdOutlineLiquor,
      "NO_OUTSIDERS": FiUser,
      "WATER_HEATER": LuFlame,
      "WIFI_INTERNET": RiWifiLine,
      "24_HOUR_WATER": Ri24HoursLine,
      "LIBRARY": FiBook,
      "MESS": MdRestaurant,
      "GYM": MdFitnessCenter,
      "INTERNET": RiWifiLine,
      "BROADBAND": RiWifiLine,
      "HOT_WATER": LuFlame,
      "COLD_WATER": FiDroplet,
      "FAN": IoSpeedometer,
      "BED": FiHome,
      "MATTRESS": FiHome,
      "PILLOW": FiHome,
      "CURTAINS": FiHome,
      "LIGHTS": FiHome,
      "POWER": BsLightningCharge,
      "ELECTRICITY": BsLightningCharge,
      "COOKING": FiCoffee,
      "KITCHEN": FiCoffee,
      "GAS": FiHome,
      "STOVE": FiCoffee,
      "GYMNASIUM": MdFitnessCenter,
      "SWIMMING_POOL": FiHome,
      "POOL": FiHome,
      "GARDEN": FiHome,
      "LAUNDRY": MdOutlineLocalLaundryService,
      "DRYER": MdOutlineLocalLaundryService,
      "IRON": MdOutlineLocalLaundryService,
      "DTH": FiTv,
      "SET_TOP_BOX": FiTv,
      "MUSIC": FiHome,
      "SPEAKER": FiHome,
      "HEATING": LuFlame,
      "COOLING": TbAirConditioning,
      "VENTILATION": IoSpeedometer,
      "EXHAUST": IoSpeedometer,
      "WATER_SUPPLY": BiWater,
      "ROUND_THE_CLOCK_WATER": Ri24HoursLine,
      "CONTINUOUS_WATER": Ri24HoursLine,
      "READING_ROOM": FiBook,
      "BOOKS": FiBook,
      "FOOD": MdRestaurant,
      "CAFETERIA": MdRestaurant,
      "DINING": MdRestaurant,
    };
    
    if (exactMap[key]) {
      return exactMap[key];
    }
    
    const keyLower = key.toLowerCase().trim();
    const keywordMap = {
      "wifi": FiWifi,
      "internet": RiWifiLine,
      "wi-fi": RiWifiLine,
      "ac": TbAirConditioning,
      "air conditioner": TbAirConditioning,
      "air conditioning": TbAirConditioning,
      "geyser": LuFlame,
      "water heater": LuFlame,
      "heater": LuFlame,
      "washing machine": GiWashingMachine,
      "washing": GiWashingMachine,
      "refrigerator": FaRegSnowflake,
      "fridge": FaRegSnowflake,
      "microwave": TbMicrowave,
      "tv": FiTv,
      "television": FiTv,
      "cupboard": LuArmchair,
      "wardrobe": LuArmchair,
      "storage": LuArmchair,
      "lift": MdOutlineElevator,
      "elevator": MdOutlineElevator,
      "parking": MdOutlineLocalParking,
      "car parking": MdOutlineLocalParking,
      "security": FaShieldAlt,
      "cctv": FaCctv,
      "housekeeping": MdOutlineLocalLaundryService,
      "maid": MdOutlineLocalLaundryService,
      "cleaning": MdOutlineLocalLaundryService,
      "attached bathroom": IoWaterOutline,
      "private bathroom": IoWaterOutline,
      "bathroom": IoWaterOutline,
      "balcony": MdDeck,
      "study table": TbTable,
      "desk": TbTable,
      "water purifier": FiDroplet,
      "purifier": FiDroplet,
      "inverter": BsLightningCharge,
      "power backup": BsLightningCharge,
      "generator": BsLightningCharge,
      "no non veg": MdOutlineNoFood,
      "no non-veg": MdOutlineNoFood,
      "vegetarian": MdOutlineNoFood,
      "no smoking": MdOutlineSmokeFree,
      "smoke free": MdOutlineSmokeFree,
      "no alcohol": MdOutlineLiquor,
      "alcohol free": MdOutlineLiquor,
      "no outsiders": FiUser,
      "restricted entry": FiUser,
      "24 hour": Ri24HoursLine,
      "24 hours": Ri24HoursLine,
      "24/7": Ri24HoursLine,
      "24x7": Ri24HoursLine,
      "continuous": Ri24HoursLine,
      "round the clock": Ri24HoursLine,
      "library": FiBook,
      "reading": FiBook,
      "books": FiBook,
      "water": BiWater,
      "water supply": BiWater,
      "hot water": LuFlame,
      "cold water": FiDroplet,
      "fan": IoSpeedometer,
      "bed": FiHome,
      "mattress": FiHome,
      "pillow": FiHome,
      "curtains": FiHome,
      "lights": FiHome,
      "power": BsLightningCharge,
      "electricity": BsLightningCharge,
      "cooking": FiCoffee,
      "kitchen": FiCoffee,
      "gas": FiHome,
      "stove": FiCoffee,
      "gym": MdFitnessCenter,
      "gymnasium": MdFitnessCenter,
      "fitness": MdFitnessCenter,
      "workout": MdFitnessCenter,
      "swimming pool": FiHome,
      "pool": FiHome,
      "garden": FiHome,
      "laundry": MdOutlineLocalLaundryService,
      "dryer": MdOutlineLocalLaundryService,
      "iron": MdOutlineLocalLaundryService,
      "broadband": RiWifiLine,
      "dth": FiTv,
      "set top box": FiTv,
      "music": FiHome,
      "speaker": FiHome,
      "heating": LuFlame,
      "cooling": TbAirConditioning,
      "ventilation": IoSpeedometer,
      "exhaust": IoSpeedometer,
      "mess": MdRestaurant,
      "food": MdRestaurant,
      "cafeteria": MdRestaurant,
      "dining": MdRestaurant,
    };
    
    for (const [keyword, icon] of Object.entries(keywordMap)) {
      if (keyLower.includes(keyword)) {
        return icon;
      }
    }
    
    return FiHome;
  };

  const formatAmenity = (text) => {
    if (!text) return "";
    
    const specialCases = {
      "WIFI_INTERNET": "WiFi Internet",
      "24_HOUR_WATER": "24 Hour Water",
      "WATER_HEATER": "Water Heater",
      "WASHING_MACHINE": "Washing Machine",
      "ATTACHED_BATHROOM": "Attached Bathroom",
      "STUDY_TABLE": "Study Table",
      "WATER_PURIFIER": "Water Purifier",
      "NO_NON_VEG": "No Non-Veg",
      "NO_SMOKING": "No Smoking",
      "NO_ALCOHOL": "No Alcohol",
      "NO_OUTSIDERS": "No Outsiders",
    };
    
    if (specialCases[text]) {
      return specialCases[text];
    }
    
    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\bNo\b/g, "No")
      .replace(/\bAc\b/g, "AC")
      .replace(/\bTv\b/g, "TV")
      .replace(/\bWifi\b/g, "WiFi");
  };

  const formatBHK = (type) => {
    if (!type) return "Room";
    const typeMap = {
      "RK": "RK (Room + Kitchen)",
      "BHK1": "1 BHK",
      "BHK2": "2 BHK",
      "BHK3": "3 BHK",
      "SHARED": "Shared Room",
      "PG": "PG / Hostel"
    };
    return typeMap[type] || type;
  };

  const formatFurnishing = (furnished) => {
    if (!furnished) return "Not specified";
    const map = {
      "FURNISHED": "Fully Furnished",
      "SEMI_FURNISHED": "Semi-Furnished",
      "UNFURNISHED": "Unfurnished",
    };
    return map[furnished] || furnished.replace(/_/g, " ");
  };

  const formatGender = (gender) => {
    if (!gender) return "Anyone";
    const map = {
      "BOYS": "Boys Only",
      "GIRLS": "Girls Only",
      "ANYONE": "Anyone"
    };
    return map[gender] || gender;
  };

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    handleFavorite(newLiked);
  };

  const handleContact = (method = "whatsapp") => {
    const phone = room.phone || room.whatsapp || "";
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (!cleanPhone) {
      setShowContactSheet(true);
      return;
    }
    
    const message = `Hi, I'm interested in your ${formatBHK(room.type)} at ${address.area || address.line1 || "your property"}.`;
    
    if (method === "whatsapp") {
      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } else if (method === "phone") {
      window.open(`tel:${cleanPhone}`, "_blank");
    }
    setShowContactSheet(false);
  };

  // Fullscreen Viewer Component
  const FullscreenView = () => {
    if (!isFullscreen) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onClick={() => setIsFullscreen(false)}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white p-3 hover:bg-white/10 rounded-full transition-all z-20"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imageUrls[localIndex]}
              alt={`Fullscreen view ${localIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              draggable="false"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-black/70 px-4 py-2 rounded-full text-sm">
            {localIndex + 1} / {imageUrls.length}
          </div>
          
          {imageUrls.length > 1 && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-8">
              <button
                onClick={() =>
                  setLocalIndex((i) => i === 0 ? imageUrls.length - 1 : i - 1)
                }
                className="p-3 bg-black/60 text-white rounded-full"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={() =>
                  setLocalIndex((i) => (i + 1) % imageUrls.length)
                }
                className="p-3 bg-black/60 text-white rounded-full"
              >
                <FiChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Contact Sheet Modal
  const ContactSheet = () => {
    if (!showContactSheet) return null;

    const phone = room.phone || room.whatsapp || "";
    
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4 touch-none"
        onClick={() => setShowContactSheet(false)}
      >
        <div 
          className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg">Contact Options</h3>
            <button
              onClick={() => setShowContactSheet(false)}
              className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {phone ? (
              <>
                <button
                  onClick={() => handleContact("whatsapp")}
                  className="w-full bg-green-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 active:bg-green-600 touch-manipulation"
                >
                  <FaWhatsapp size={24} />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleContact("phone")}
                  className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 active:bg-blue-700 touch-manipulation"
                >
                  <IoCallOutline size={24} />
                  <span>Call Now</span>
                </button>
                
                <div className="text-center text-gray-600 mt-4">
                  <p className="font-medium">Phone: {phone}</p>
                  <p className="text-sm mt-2">Tap above to contact directly</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <MdCall size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contact information available</p>
              </div>
            )}
            
            <button
              onClick={() => {
                handleShare();
                setShowContactSheet(false);
              }}
              className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-3 active:bg-gray-50 touch-manipulation"
            >
              <FiShare2 size={20} />
              <span>Share Listing</span>
            </button>
          </div>
          
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={() => setShowContactSheet(false)}
              className="text-gray-500 hover:text-gray-700 font-medium py-2 px-4 active:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Image Gallery Component - FIXED FOR MOBILE
  const GalleryArea = () => {
    return (
      <div className="relative">
        <div
          ref={touchAreaRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-black overflow-hidden"
        >
          {/* Responsive height - Reduced for mobile */}
          <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]">
            {/* Blur placeholder */}
            <img
              src={imageUrls[localIndex]}
              className={`absolute inset-0 w-full h-full object-cover blur-xl transition-opacity duration-500 ${
                imageLoaded[localIndex] ? "opacity-0" : "opacity-50"
              }`}
              alt=""
            />

            {/* Main image */}
            <img
              src={imageUrls[localIndex]}
              onLoad={() => handleImageLoad(localIndex)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded[localIndex] ? "opacity-100" : "opacity-0"
              }`}
              draggable="false"
              alt={`Room image ${localIndex + 1}`}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white active:bg-black/80"
              >
                <FiChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white active:bg-black/80"
                >
                  <FiHeart
                    size={20}
                    className={liked ? "fill-red-500 text-red-500" : ""}
                  />
                </button>
                <button
                  onClick={() => setShowContactSheet(true)}
                  className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white active:bg-black/80"
                >
                  <FiShare2 size={20} />
                </button>
              </div>
            </div>

            {/* Zoom button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-20 right-4 p-3 bg-black/60 backdrop-blur-sm rounded-full text-white active:bg-black/80"
              aria-label="Zoom in"
            >
              <FiMaximize2 size={20} />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {localIndex + 1} / {imageUrls.length}
            </div>

            {/* Mobile navigation arrows */}
            {imageUrls.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const prev = localIndex === 0 ? imageUrls.length - 1 : localIndex - 1;
                    setLocalIndex(prev);
                    setCurrentImageIndex(prev);
                  }}
                  className="pointer-events-auto p-3 bg-black/40 text-white rounded-full active:bg-black/60"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = (localIndex + 1) % imageUrls.length;
                    setLocalIndex(next);
                    setCurrentImageIndex(next);
                  }}
                  className="pointer-events-auto p-3 bg-black/40 text-white rounded-full active:bg-black/60"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Dots indicator */}
          {imageUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocalIndex(idx);
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === localIndex
                      ? "bg-white w-6"
                      : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mobile-friendly Action Bar
  const MobileActionBar = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-bottom">
        <div className="flex items-center justify-between">
          {/* Price info */}
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">
                ₹{room.rent?.toLocaleString("en-IN") || "0"}
              </span>
              <span className="text-xs text-gray-500">
                + ₹{room.deposit?.toLocaleString("en-IN") || "0"} deposit
              </span>
            </div>
            {room.type && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {formatBHK(room.type)} • {formatFurnishing(room.furnished)}
              </p>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowContactSheet(true)}
              className="p-3 rounded-xl bg-gray-100 active:bg-gray-200 touch-manipulation flex-shrink-0"
              aria-label="More options"
            >
              <BsThreeDots size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => handleContact("whatsapp")}
              className="bg-green-500 text-white font-semibold py-3 px-4 rounded-xl active:bg-green-600 touch-manipulation min-w-[100px] flex-shrink-0 whitespace-nowrap"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Details Panel Component
  const DetailsPanel = () => {
    const amenitiesList = room.amenities || [];
    const visibleAmenities = showAllAmenities
      ? amenitiesList
      : amenitiesList.slice(0, 8); // Show 8 amenities initially

    const formattedAddress = [
      address.area,
      address.city,
      address.state
    ].filter(Boolean).join(", ");

    return (
      <div className="px-4 pb-24" ref={detailsRef}>
        {/* Main details card - No negative margin */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4">
            {/* Property type badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {formatBHK(room.type)}
              </span>
              
              {room.furnished && (
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                  {formatFurnishing(room.furnished)}
                </span>
              )}
              
              {room.brokerageRequired !== undefined && !room.brokerageRequired && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  No Brokerage
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {room.title || `${formatBHK(room.type)} in ${address.area || address.city || "Pune"}`}
            </h1>

            {/* Address - Fixed for better mobile display */}
            <div className="flex items-start gap-2 text-gray-600 mb-4">
              <FiMapPin className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">{formattedAddress || "Location"}</p>
                {address.line1 && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{address.line1}</p>
                )}
              </div>
            </div>

            {/* Quick stats - Mobile optimized */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FiUsers className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">For</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatGender(room.gender)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <LuArmchair className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Furnishing</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatFurnishing(room.furnished)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <FiInfo className="text-gray-400" size={16} />
              <h3 className="font-semibold text-gray-900 text-sm">Description</h3>
            </div>
            <div className="max-h-[120px] overflow-y-auto">
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {room.description && room.description.trim() !== "" 
                  ? room.description 
                  : "No detailed description provided. Contact for more details."}
              </p>
            </div>
          </div>

          {/* Amenities */}
          {amenitiesList.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Amenities & Rules</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {amenitiesList.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {visibleAmenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  const isRule = amenity.toLowerCase().includes('no ');
                  
                  return (
                    <div
                      key={amenity}
                      className={`flex items-center gap-2 p-2.5 rounded-lg ${
                        isRule
                          ? "bg-red-50 border border-red-100"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <Icon 
                        className={isRule ? "text-red-600" : "text-blue-600"} 
                        size={14} 
                      />
                      <span className={`text-xs font-medium ${
                        isRule ? "text-red-700" : "text-gray-700"
                      }`}>
                        {formatAmenity(amenity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {amenitiesList.length > 8 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="w-full mt-3 text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center justify-center gap-1 py-2 active:text-blue-800"
                >
                  {showAllAmenities ? "Show less" : "Show all amenities"}
                  <FiExternalLink size={10} />
                </button>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="p-4 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Contact Info</h3>
            <div className="space-y-2">
              {room.phone && (
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <IoCallOutline className="text-green-600" size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900 text-sm truncate">{room.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleContact("phone")}
                    className="text-blue-600 font-medium text-xs px-2 py-1.5 active:text-blue-800 whitespace-nowrap"
                  >
                    Call
                  </button>
                </div>
              )}
              
              {room.whatsapp && (
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <FaWhatsapp className="text-green-600" size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="font-medium text-gray-900 text-sm truncate">{room.whatsapp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleContact("whatsapp")}
                    className="text-green-600 font-medium text-xs px-2 py-1.5 active:text-green-800 whitespace-nowrap"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>
            
            {/* Contact buttons */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleContact("whatsapp")}
                className="bg-green-500 text-white font-semibold py-2.5 px-2 rounded-xl active:bg-green-700 flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <FaWhatsapp size={16} />
                <span className="text-xs">WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleContact("phone")}
                className="bg-blue-600 text-white font-semibold py-2.5 px-2 rounded-xl active:bg-blue-800 flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <MdCall size={16} />
                <span className="text-xs">Call Now</span>
              </button>
            </div>
          </div>

          {/* Additional info */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ID: {room.id || "N/A"}</span>
              <span>Posted: {room.createdAt 
                ? new Date(room.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  })
                : "Recently"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <FullscreenView />
      <ContactSheet />
      
      <div className="min-h-screen bg-gray-50">
        {/* Mobile header - Simplified */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between safe-top">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full active:bg-gray-100 touch-manipulation"
          >
            <FiChevronLeft size={18} />
          </button>
          <h2 className="font-semibold text-gray-900 text-sm truncate max-w-[160px]">
            Property Details
          </h2>
          <button
            onClick={handleLike}
            className="p-2 rounded-full active:bg-gray-100 touch-manipulation"
          >
            <FiHeart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : "text-gray-600"}
            />
          </button>
        </div>

        <GalleryArea />
        <DetailsPanel />
        <MobileActionBar />
      </div>
      
      {/* Mobile optimization styles */}
      <style jsx global>{`
        /* Safe areas for mobile devices */
        .safe-top {
          padding-top: env(safe-area-inset-top, 0);
        }
        
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        /* Hide scrollbar for horizontal scroll */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Better touch handling */
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        .touch-pan-x {
          touch-action: pan-x;
        }
        
        /* Better text truncation */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Prevent blue highlight on mobile */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          input, select, textarea, button {
            font-size: 16px;
          }
          
          /* Ensure content doesn't overflow */
          body {
            overflow-x: hidden;
          }
          
          /* Better scrolling for description */
          .overflow-y-auto {
            scrollbar-width: none;
          }
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        }
        
        /* Prevent pull-to-refresh on mobile */
        body {
          overscroll-behavior-y: contain;
        }
        
        /* Improve font rendering on mobile */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </>
  );
}

