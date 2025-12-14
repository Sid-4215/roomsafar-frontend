"use client";
import { ensureAbsoluteUrl } from "@/utils/imageUtils";
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
  FiLoader,
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

// Define amenity icon mapping outside component to avoid re-renders
const amenityIcons = {
  // Direct mappings
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
  
  // Additional common amenities
  "BHK": FiHome,
  "ROOM": FiHome,
  "SHARED": FiUsers,
  "PRIVATE": FiUser,
  "BOYS": FiUser,
  "GIRLS": FiUser,
  "ANYONE": FiUsers,
  "FURNISHED": LuArmchair,
  "SEMI_FURNISHED": LuArmchair,
  "UNFURNISHED": LuArmchair,
  "MAINTENANCE": FiHome,
  "RENT": FiHome,
  "DEPOSIT": FiHome,
  "BROKERAGE": FiUser,
  "NO_BROKERAGE": FiCheck,
  "VERIFIED": MdVerified,
  "AVAILABLE": FiCheck,
  "BOOKED": FiCalendar,
  "VACANT": FiHome,
};

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
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
  
  // Transform image objects to URLs array - SIMPLIFIED

// In RoomDetailsUI component, update the imageUrls useMemo:

const imageUrls = useMemo(() => {
  if (!roomImages || roomImages.length === 0) {
    return ["/no-image.jpg"];
  }

  const urls = roomImages.map(img => {
    if (!img) return null;
    
    if (typeof img === "string") {
      // It's already a string URL
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
        return img;
      }
      // It's a Cloudinary URL or other format
      return ensureAbsoluteUrl(img);
    }
    
    // It's an object with url property
    if (img.url) {
      if (img.url.startsWith('http://') || img.url.startsWith('https://')) {
        return img.url;
      }
      return ensureAbsoluteUrl(img.url);
    }
    
    return null;
  }).filter(Boolean); // Remove null values

  return urls.length > 0 ? urls : ["/no-image.jpg"];
}, [roomImages]);


  // States - SIMPLIFIED
  const [localIndex, setLocalIndex] = useState(currentImageIndex || 0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(isFavorite);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentImageLoaded, setCurrentImageLoaded] = useState(false);

  // Check if mobile on mount and resize - SIMPLIFIED
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset image loaded state when image changes
  useEffect(() => {
    setCurrentImageLoaded(false);
  }, [localIndex]);

  // Touch handlers - FIXED with better swipe detection
  const handleTouchStart = useCallback((e) => {
    if (!e.touches?.length) return;
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX == null) return;
    
    if (!e.changedTouches?.length) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 50; // Increased threshold for better UX
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        const next = (localIndex + 1) % imageUrls.length;
        setLocalIndex(next);
        setCurrentImageIndex(next);
      } else {
        // Swipe right - previous image
        const prev = localIndex === 0 ? imageUrls.length - 1 : localIndex - 1;
        setLocalIndex(prev);
        setCurrentImageIndex(prev);
      }
    }
    setTouchStartX(null);
  }, [touchStartX, localIndex, imageUrls.length, setCurrentImageIndex]);

  // Mouse drag handlers for desktop
  const handleMouseDown = useCallback((e) => {
    if (isMobile) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(localIndex);
    e.preventDefault();
  }, [localIndex, isMobile]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 2; // Adjust sensitivity
    const threshold = 100;
    
    if (Math.abs(walk) > threshold) {
      if (walk > 0) {
        // Drag right - previous image
        const prev = localIndex === 0 ? imageUrls.length - 1 : localIndex - 1;
        setLocalIndex(prev);
        setCurrentImageIndex(prev);
        setIsDragging(false);
      } else {
        // Drag left - next image
        const next = (localIndex + 1) % imageUrls.length;
        setLocalIndex(next);
        setCurrentImageIndex(next);
        setIsDragging(false);
      }
    }
  }, [isDragging, startX, localIndex, imageUrls.length, setCurrentImageIndex]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Sync with external index
  useEffect(() => {
    setLocalIndex(currentImageIndex || 0);
  }, [currentImageIndex]);

  // Image load handler
  const handleImageLoad = () => {
    setCurrentImageLoaded(true);
  };

  // Add event listeners for mouse drag
  useEffect(() => {
    if (isMobile) return;
    
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, isMobile]);

  // Amenity icon mapping - FIXED VERSION
  const getAmenityIcon = useCallback((key) => {
    if (!key) return FiHome;
    
    // Convert key to uppercase for matching
    const upperKey = key.toUpperCase().trim();
    
    // First try exact match
    if (amenityIcons[upperKey]) {
      return amenityIcons[upperKey];
    }
    
    // Try partial matches for common patterns
    const keyLower = key.toLowerCase().trim();
    
    // Common keyword patterns
    if (keyLower.includes('wifi') || keyLower.includes('internet')) {
      return FiWifi;
    }
    if (keyLower.includes('ac') || keyLower.includes('air condition')) {
      return TbAirConditioning;
    }
    if (keyLower.includes('geyser') || keyLower.includes('water heater') || keyLower.includes('heater')) {
      return LuFlame;
    }
    if (keyLower.includes('washing')) {
      return GiWashingMachine;
    }
    if (keyLower.includes('fridge') || keyLower.includes('refrigerator')) {
      return FaRegSnowflake;
    }
    if (keyLower.includes('microwave')) {
      return TbMicrowave;
    }
    if (keyLower.includes('tv') || keyLower.includes('television')) {
      return FiTv;
    }
    if (keyLower.includes('cupboard') || keyLower.includes('wardrobe') || keyLower.includes('storage')) {
      return LuArmchair;
    }
    if (keyLower.includes('lift') || keyLower.includes('elevator')) {
      return MdOutlineElevator;
    }
    if (keyLower.includes('parking')) {
      return MdOutlineLocalParking;
    }
    if (keyLower.includes('security')) {
      return FaShieldAlt;
    }
    if (keyLower.includes('cctv')) {
      return FaCctv;
    }
    if (keyLower.includes('housekeeping') || keyLower.includes('cleaning')) {
      return MdOutlineLocalLaundryService;
    }
    if (keyLower.includes('bathroom') || keyLower.includes('toilet')) {
      return IoWaterOutline;
    }
    if (keyLower.includes('balcony')) {
      return MdDeck;
    }
    if (keyLower.includes('study') || keyLower.includes('desk')) {
      return TbTable;
    }
    if (keyLower.includes('water purifier') || keyLower.includes('purifier')) {
      return FiDroplet;
    }
    if (keyLower.includes('inverter') || keyLower.includes('power backup')) {
      return BsLightningCharge;
    }
    if (keyLower.includes('no ') || keyLower.includes('restrict')) {
      if (keyLower.includes('non veg') || keyLower.includes('non-veg')) {
        return MdOutlineNoFood;
      }
      if (keyLower.includes('smok')) {
        return MdOutlineSmokeFree;
      }
      if (keyLower.includes('alcohol')) {
        return MdOutlineLiquor;
      }
      if (keyLower.includes('outsider')) {
        return FiUser;
      }
    }
    if (keyLower.includes('24') || keyLower.includes('round the clock')) {
      return Ri24HoursLine;
    }
    if (keyLower.includes('library') || keyLower.includes('book')) {
      return FiBook;
    }
    if (keyLower.includes('mess') || keyLower.includes('food') || keyLower.includes('dining')) {
      return MdRestaurant;
    }
    if (keyLower.includes('gym') || keyLower.includes('fitness')) {
      return MdFitnessCenter;
    }
    if (keyLower.includes('fan')) {
      return IoSpeedometer;
    }
    if (keyLower.includes('bed') || keyLower.includes('mattress')) {
      return FiHome;
    }
    if (keyLower.includes('cooking') || keyLower.includes('kitchen')) {
      return FiCoffee;
    }
    if (keyLower.includes('laundry')) {
      return MdOutlineLocalLaundryService;
    }
    
    // Default icon
    return FiHome;
  }, []);

  const formatAmenity = useCallback((text) => {
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
  }, []);

  const formatBHK = useCallback((type) => {
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
  }, []);

  const formatFurnishing = useCallback((furnished) => {
    if (!furnished) return "Not specified";
    const map = {
      "FURNISHED": "Fully Furnished",
      "SEMI_FURNISHED": "Semi-Furnished",
      "UNFURNISHED": "Unfurnished",
    };
    return map[furnished] || furnished.replace(/_/g, " ");
  }, []);

  const formatGender = useCallback((gender) => {
    if (!gender) return "Anyone";
    const map = {
      "BOYS": "Boys Only",
      "GIRLS": "Girls Only",
      "ANYONE": "Anyone"
    };
    return map[gender] || gender;
  }, []);

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

  // Fullscreen Viewer Component - FIXED with Instagram-style navigation
  const FullscreenView = () => {
    if (!isFullscreen) return null;

    const handleFullscreenTouchStart = (e) => {
      if (!e.touches?.length) return;
      setTouchStartX(e.touches[0].clientX);
    };

    const handleFullscreenTouchEnd = (e) => {
      if (touchStartX == null) return;
      
      if (!e.changedTouches?.length) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      const swipeThreshold = 50;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left
          setLocalIndex((prev) => (prev + 1) % imageUrls.length);
        } else {
          // Swipe right
          setLocalIndex((prev) => prev === 0 ? imageUrls.length - 1 : prev - 1);
        }
      }
      setTouchStartX(null);
    };

    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onClick={() => setIsFullscreen(false)}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleFullscreenTouchStart}
          onTouchEnd={handleFullscreenTouchEnd}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white p-3 hover:bg-white/10 rounded-full transition-all z-20"
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
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalIndex((i) => i === 0 ? imageUrls.length - 1 : i - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full z-10"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalIndex((i) => (i + 1) % imageUrls.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 text-white rounded-full z-10"
              >
                <FiChevronRight size={24} />
              </button>
            </>
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
        className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4"
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
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {phone ? (
              <>
                <button
                  onClick={() => handleContact("whatsapp")}
                  className="w-full bg-green-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3"
                >
                  <FaWhatsapp size={24} />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleContact("phone")}
                  className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3"
                >
                  <IoCallOutline size={24} />
                  <span>Call Now</span>
                </button>
                
                <div className="text-center text-gray-600 mt-4">
                  <p className="font-medium">Phone: {phone}</p>
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
              className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-3"
            >
              <FiShare2 size={20} />
              <span>Share Listing</span>
            </button>
          </div>
          
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={() => setShowContactSheet(false)}
              className="text-gray-500 hover:text-gray-700 font-medium py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };


  // Image Gallery Component - FIXED with Instagram-style carousel
const GalleryArea = () => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const handleImageError = (index) => {
  setImageErrors(prev => ({ ...prev, [index]: true }));
};

  
  // Swipe threshold
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - next image
      const next = (localIndex + 1) % imageUrls.length;
      setLocalIndex(next);
      setCurrentImageIndex(next);
    } else if (isRightSwipe) {
      // Swipe right - previous image
      const prev = localIndex === 0 ? imageUrls.length - 1 : localIndex - 1;
      setLocalIndex(prev);
      setCurrentImageIndex(prev);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') {
          const prev = localIndex === 0 ? imageUrls.length - 1 : localIndex - 1;
          setLocalIndex(prev);
        } else if (e.key === 'ArrowRight') {
          const next = (localIndex + 1) % imageUrls.length;
          setLocalIndex(next);
        } else if (e.key === 'Escape') {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, localIndex, imageUrls.length]);

  return (
    <div className="relative md:col-span-2 lg:col-span-3">
      <div
        className="relative bg-black overflow-hidden md:rounded-xl select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[400px] lg:h-[500px] xl:h-[600px]">
          {/* Loading spinner */}
          {!currentImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
              <FiLoader className="text-white animate-spin" size={32} />
            </div>
          )}

          {/* Main image */}
          <img
            src={imageUrls[localIndex]}
            onLoad={handleImageLoad}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              currentImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            draggable="false"
            alt={`Room image ${localIndex + 1}`}
            loading="lazy"
            style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

          {/* Top controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            {/* <button
              onClick={() => {
                // Save scroll position before going back
                if (typeof window !== 'undefined') {
                  localStorage.setItem('roomsScrollPosition', window.scrollY.toString());
                }
                router.back();
              }}
              className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <FiChevronLeft size={20} />
            </button> */}
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
              >
                <FiHeart
                  size={20}
                  className={liked ? "fill-red-500 text-red-500" : ""}
                />
              </button>
              <button
                onClick={() => setShowContactSheet(true)}
                className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
              >
                <FiShare2 size={20} />
              </button>
            </div>
          </div>

          {/* Zoom button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-20 right-4 p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors z-10"
          >
            <FiMaximize2 size={20} />
          </button>

          {/* Image counter */}
          <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium z-10">
            {localIndex + 1} / {imageUrls.length}
          </div>

          {/* Navigation arrows - Always visible on desktop, hidden on mobile */}
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prev = localIndex === 0 ? imageUrls.length - 1 : localIndex - 1;
                  setLocalIndex(prev);
                  setCurrentImageIndex(prev);
                }}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors z-10 ${
                  isMobile ? 'hidden' : 'block'
                }`}
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
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors z-10 ${
                  isMobile ? 'hidden' : 'block'
                }`}
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}

          {/* Swipe hint for mobile */}
          {/* {isMobile && imageUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/70 text-sm">
              <FiChevronLeft size={16} />
              <span>Swipe to navigate</span>
              <FiChevronRight size={16} />
            </div>
          )} */}
        </div>

        {/* Thumbnail dots */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {imageUrls.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalIndex(idx);
                  setCurrentImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === localIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip for desktop */}
      {!isMobile && imageUrls.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {imageUrls.map((url, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLocalIndex(idx);
                setCurrentImageIndex(idx);
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === localIndex
                  ? "border-blue-500 scale-105"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

  // Mobile Action Bar
  const MobileActionBar = () => {
    if (!isMobile) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex items-center justify-between">
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
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowContactSheet(true)}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <BsThreeDots size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => handleContact("whatsapp")}
              className="bg-green-500 text-white font-semibold py-3 px-4 rounded-xl min-w-[100px] hover:bg-green-600 transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => {
    if (isMobile) return null;
    
    return (
      <div className="md:col-span-1 lg:col-span-2">
        <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pricing Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{room.rent?.toLocaleString("en-IN") || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Security Deposit</span>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{room.deposit?.toLocaleString("en-IN") || "0"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Owner</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleContact("whatsapp")}
                className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <FaWhatsapp size={20} />
                <span>WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleContact("phone")}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <IoCallOutline size={20} />
                <span>Call Now</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Property Type</p>
                <p className="font-semibold text-gray-900">{formatBHK(room.type)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Furnishing</p>
                <p className="font-semibold text-gray-900">{formatFurnishing(room.furnished)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Available For</p>
                <p className="font-semibold text-gray-900">{formatGender(room.gender)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Details Panel Component - FIXED SCROLLING
  const DetailsPanel = () => {
    const amenitiesList = room.amenities || [];
    const visibleAmenities = showAllAmenities
      ? amenitiesList
      : amenitiesList.slice(0, 8);

    const formattedAddress = [
      address.area,
      address.city,
      address.state
    ].filter(Boolean).join(", ");

    const description = room.description && room.description.trim() !== "" 
      ? room.description 
      : "No detailed description provided. Contact for more details.";
    
    const needsExpansion = description.length > 300;

    return (
      <div className="md:col-span-2 lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {formatBHK(room.type)}
              </span>
              
              {room.furnished && (
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                  {formatFurnishing(room.furnished)}
                </span>
              )}
              
              {room.brokerageRequired !== undefined && !room.brokerageRequired && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  No Brokerage
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {room.title || `${formatBHK(room.type)} in ${address.area || address.city || "Pune"}`}
            </h1>

            <div className="flex items-start gap-3 text-gray-600 mb-6">
              <FiMapPin className="text-blue-500 mt-1 flex-shrink-0" size={18} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-lg mb-1">{formattedAddress || "Location"}</p>
                {address.line1 && (
                  <p className="text-gray-500 text-sm">{address.line1}</p>
                )}
              </div>
            </div>

            {/* Description with FIXED scrolling */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <FiInfo className="text-gray-400" size={18} />
                Description
              </h3>
              <div 
                className="description-container"
                style={{
                  maxHeight: isMobile ? '120px' : '200px',
                  overflowY: 'auto',
                  paddingRight: '1rem'
                }}
              >
                <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                  {description}
                </p>
              </div>
              
              {needsExpansion && (
                <button
                  onClick={() => {
                    const container = document.querySelector('.description-container');
                    if (container) {
                      container.style.maxHeight = container.style.maxHeight === 'none' 
                        ? (isMobile ? '120px' : '200px') 
                        : 'none';
                    }
                  }}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  Read more
                  <FiExternalLink size={12} />
                </button>
              )}
            </div>

            {/* Amenities - FIXED ICON RENDERING */}
            {amenitiesList.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Amenities & Rules</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {amenitiesList.length} amenities
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {visibleAmenities.map((amenity) => {
                    const IconComponent = getAmenityIcon(amenity);
                    const isRule = amenity.toLowerCase().includes('no ');
                    
                    return (
                      <div
                        key={amenity}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          isRule ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        {IconComponent && React.createElement(IconComponent, {
                          className: isRule ? "text-red-600" : "text-blue-600",
                          size: 16
                        })}
                        <span className={`text-sm font-medium ${
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
                    className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2 py-2"
                  >
                    {showAllAmenities ? "Show less amenities" : `Show all ${amenitiesList.length} amenities`}
                    <FiExternalLink size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Contact Information - Mobile only */}
            {isMobile && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Contact Info</h3>
                <div className="space-y-3">
                  {room.phone && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <IoCallOutline className="text-green-600" size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone Number</p>
                          <p className="font-medium text-gray-900">{room.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleContact("phone")}
                        className="text-blue-600 font-medium text-sm px-3 py-1.5"
                      >
                        Call
                      </button>
                    </div>
                  )}
                  
                  {room.whatsapp && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FaWhatsapp className="text-green-600" size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">WhatsApp</p>
                          <p className="font-medium text-gray-900">{room.whatsapp}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleContact("whatsapp")}
                        className="text-green-600 font-medium text-sm px-3 py-1.5"
                      >
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Mobile only */}
          {isMobile && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>ID: {room.id || "N/A"}</span>
                <span>Posted: {room.createdAt 
                  ? new Date(room.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })
                  : "Recently"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <FullscreenView />
      <ContactSheet />
      
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => {
              // Save scroll position before going back
              sessionStorage.setItem('roomsScrollPosition', window.scrollY.toString());
              router.back();
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>
          <h2 className="font-semibold text-gray-900 text-sm truncate max-w-[160px]">
            Property Details
          </h2>
          <button
            onClick={handleLike}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiHeart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : "text-gray-600"}
            />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  // Save scroll position before going back
                  sessionStorage.setItem('roomsScrollPosition', window.scrollY.toString());
                  router.back();
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiChevronLeft size={20} />
                <span>Back to Listings</span>
              </button>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiHeart
                    size={20}
                    className={liked ? "fill-red-500 text-red-500" : ""}
                  />
                  <span>{liked ? "Saved" : "Save"}</span>
                </button>
                
                <button
                  onClick={() => setShowContactSheet(true)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiShare2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <GalleryArea />
            <DetailsPanel />
            <DesktopSidebar />
          </div>
        </div>

        <MobileActionBar />
      </div>
      
      {/* Clean, simple styles */}
      <style jsx global>{`
        /* Basic scrollbar styling */
        .description-container {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }
        
        .description-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .description-container::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        
        .description-container::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        /* Prevent blue highlight on mobile */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Image loading animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Improve font rendering */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Prevent image drag */
        img {
          -webkit-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </> 
  );
}