import { useState } from 'react';

// Amenity categories with icons
const AMENITY_CATEGORIES = [
  {
    title: "Basic Amenities",
    amenities: [
      { id: "WIFI", label: "WiFi", icon: "📶" },
      { id: "AC", label: "Air Conditioner", icon: "❄️" },
      { id: "GEYSER", label: "Geyser", icon: "🔥" },
      { id: "WASHING_MACHINE", label: "Washing Machine", icon: "👕" },
      { id: "REFRIGERATOR", label: "Refrigerator", icon: "🧊" },
      { id: "MICROWAVE", label: "Microwave", icon: "🍽️" },
      { id: "TV", label: "Television", icon: "📺" },
      { id: "CUPBOARD", label: "Cupboard", icon: "🚪" }
    ]
  },
  {
    title: "Facilities",
    amenities: [
      { id: "LIFT", label: "Lift", icon: "🛗" },
      { id: "PARKING", label: "Parking", icon: "🅿️" },
      { id: "SECURITY", label: "Security", icon: "👮" },
      { id: "CCTV", label: "CCTV", icon: "🎥" },
      { id: "HOUSEKEEPING", label: "Housekeeping", icon: "🧹" }
    ]
  },
  {
    title: "Room Features",
    amenities: [
      { id: "ATTACHED_BATHROOM", label: "Attached Bathroom", icon: "🚽" },
      { id: "BALCONY", label: "Balcony", icon: "🌿" },
      { id: "STUDY_TABLE", label: "Study Table", icon: "📚" }
    ]
  },
  {
    title: "Utilities",
    amenities: [
      { id: "WATER_PURIFIER", label: "Water Purifier", icon: "💧" },
      { id: "INVERTER", label: "Inverter/Generator", icon: "⚡" }
    ]
  },
  {
    title: "House Rules",
    amenities: [
      { id: "NO_NON_VEG", label: "No Non-Veg", icon: "🥬" },
      { id: "NO_SMOKING", label: "No Smoking", icon: "🚭" },
      { id: "NO_ALCOHOL", label: "No Alcohol", icon: "🚫" },
      { id: "NO_OUTSIDERS", label: "No Outsiders", icon: "👥" }
    ]
  }
];

export default function AmenitiesSelector({ selectedAmenities, onChange }) {
  const handleAmenityToggle = (amenityId) => {
    if (selectedAmenities.includes(amenityId)) {
      onChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onChange([...selectedAmenities, amenityId]);
    }
  };

  return (
    <div className="space-y-6">
      {AMENITY_CATEGORIES.map((category) => (
        <div key={category.title} className="border rounded-xl p-4">
          <h3 className="font-semibold text-lg mb-3 text-slate-800">
            {category.title}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {category.amenities.map((amenity) => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => handleAmenityToggle(amenity.id)}
                className={`flex items-center gap-2 p-3 border rounded-lg transition ${
                  selectedAmenities.includes(amenity.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xl">{amenity.icon}</span>
                <span className="text-sm font-medium">{amenity.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="text-sm text-slate-600">
        <p>✅ Selected: {selectedAmenities.length} amenities</p>
      </div>
    </div>
  );
}