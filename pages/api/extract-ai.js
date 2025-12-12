import Groq from "groq-sdk";

// Comprehensive amenity mapping for Indian rental messages
const AMENITY_MAPPING = {
  // Kitchen & Appliances
  "washing machine": "WASHING_MACHINE",
  "washingmachine": "WASHING_MACHINE",
  "washing": "WASHING_MACHINE",
  "washer": "WASHING_MACHINE",
  "geyser": "WATER_HEATER",
  "hot water": "WATER_HEATER",
  "water heater": "WATER_HEATER",
  "gas": "GAS_CONNECTION",
  "gas cylinder": "GAS_CONNECTION",
  "cooking gas": "GAS_CONNECTION",
  "lpg": "GAS_CONNECTION",
  "water purifier": "WATER_PURIFIER",
  "purifier": "WATER_PURIFIER",
  "ro": "WATER_PURIFIER",
  "aquaguard": "WATER_PURIFIER",
  "microwave": "MICROWAVE",
  "oven": "OVEN",
  "refrigerator": "REFRIGERATOR",
  "fridge": "REFRIGERATOR",
  "stove": "STOVE",
  "induction": "INDUCTION_STOVE",
  "chimney": "CHIMNEY",
  
  // Furniture
  "furnished": "FURNISHED",
  "fully furnished": "FURNISHED",
  "full furnished": "FURNISHED",
  "semi furnished": "SEMI_FURNISHED",
  "semi-furnished": "SEMI_FURNISHED",
  "wardrobe": "WARDROBE",
  "almirah": "WARDROBE",
  "cupboard": "WARDROBE",
  "closet": "WARDROBE",
  "study table": "STUDY_TABLE",
  "study desk": "STUDY_TABLE",
  "desk": "STUDY_TABLE",
  "single bed": "BED",
  "double bed": "BED",
  "bed": "BED",
  "beds": "BED",
  "mattress": "BED",
  "cot": "BED",
  "sofa": "SOFA",
  "dining table": "DINING_TABLE",
  "chair": "CHAIR",
  "curtains": "CURTAINS",
  
  // Connectivity
  "wifi": "WIFI_INTERNET",
  "internet": "WIFI_INTERNET",
  "broadband": "WIFI_INTERNET",
  "wi-fi": "WIFI_INTERNET",
  "wifi internet": "WIFI_INTERNET",
  "high speed internet": "WIFI_INTERNET",
  
  // Comfort & Cooling
  "ac": "AIR_CONDITIONING",
  "air conditioner": "AIR_CONDITIONING",
  "air conditioning": "AIR_CONDITIONING",
  "a.c.": "AIR_CONDITIONING",
  "cooler": "AIR_COOLER",
  "air cooler": "AIR_COOLER",
  "fan": "FAN",
  "ceiling fan": "FAN",
  "table fan": "FAN",
  "heater": "ROOM_HEATER",
  "room heater": "ROOM_HEATER",
  
  // Building Facilities
  "lift": "LIFT",
  "elevator": "LIFT",
  "parking": "PARKING",
  "car parking": "PARKING",
  "bike parking": "PARKING",
  "two wheeler parking": "PARKING",
  "four wheeler parking": "PARKING",
  "vehicle parking": "PARKING",
  "security": "SECURITY",
  "gated": "SECURITY",
  "24x7 security": "SECURITY",
  "24 hour security": "SECURITY",
  "security guard": "SECURITY",
  "watchman": "SECURITY",
  "cctv": "CCTV",
  "cctv camera": "CCTV",
  "surveillance": "CCTV",
  "power backup": "POWER_BACKUP",
  "inverter": "POWER_BACKUP",
  "generator": "POWER_BACKUP",
  "ups": "POWER_BACKUP",
  "water 24": "24_HOUR_WATER",
  "24 hour water": "24_HOUR_WATER",
  "24x7 water": "24_HOUR_WATER",
  "continuous water": "24_HOUR_WATER",
  "running water": "24_HOUR_WATER",
  "water supply": "24_HOUR_WATER",
  "society": "GATED_SOCIETY",
  "apartment": "GATED_SOCIETY",
  "complex": "GATED_SOCIETY",
  
  // Recreational
  "gym": "GYM",
  "fitness": "GYM",
  "exercise": "GYM",
  "swimming": "SWIMMING_POOL",
  "pool": "SWIMMING_POOL",
  "swimming pool": "SWIMMING_POOL",
  "club house": "CLUB_HOUSE",
  "clubhouse": "CLUB_HOUSE",
  "playground": "PLAYGROUND",
  "garden": "GARDEN",
  "lawn": "GARDEN",
  "park": "GARDEN",
  
  // Additional Spaces
  "balcony": "BALCONY",
  "terrace": "BALCONY",
  "verandah": "BALCONY",
  "store room": "STORE_ROOM",
  "storeroom": "STORE_ROOM",
  "puja room": "PUJA_ROOM",
  "puja": "PUJA_ROOM",
  
  // Utilities
  "housekeeping": "HOUSEKEEPING",
  "maid": "HOUSEKEEPING",
  "cook": "COOKING_SERVICE",
  "laundry": "LAUNDRY_SERVICE",
  "room service": "ROOM_SERVICE",
  
  // Restrictions (negative amenities)
  "no restrictions": "NO_RESTRICTIONS",
  "no owner interference": "NO_OWNER_INTERFERENCE",
  "independent": "INDEPENDENT_FLAT"
};

// Enhanced validation functions
const parseAmount = (str) => {
  if (!str) return 0;
  
  const cleanStr = String(str).toLowerCase().replace(/,/g, '').trim();
  
  // Extract number and multiplier
  const match = cleanStr.match(/(\d+(?:\.\d+)?)\s*([kmlacr]?)/);
  if (!match) return 0;
  
  const [_, numStr, multiplier] = match;
  const num = parseFloat(numStr);
  
  switch (multiplier) {
    case 'k': return num * 1000;
    case 'm': return num * 1000000;
    case 'l': // lakh
    case 'la':
    case 'lakh': return num * 100000;
    case 'cr': // crore
    case 'crore': return num * 10000000;
    default: return num;
  }
};

const extractWhatsApp = (text) => {
  if (!text) return '';
  
  // Multiple patterns for phone numbers
  const patterns = [
    /\b\d{10}\b/, // 10 digits
    /\b\+91\s*(\d{10})\b/, // +91 prefix
    /\b(\d{5}\s*\d{5})\b/, // 5+5 digits
    /(?:\bcontact\b|\bphone\b|\bmobile\b|\bwhatsapp\b)[:\s]*(\d{10})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const number = match[1] || match[0];
      return number.replace(/\D/g, '').slice(-10);
    }
  }
  
  return '';
};

const extractArea = (text) => {
  const puneAreas = [
    "Kothrud", "Hinjewadi", "Dattawadi", "Karve Nagar", "Shivaji Nagar",
    "Viman Nagar", "Kharadi", "Wagholi", "Hadapsar", "Baner", "Aundh",
    "Pashan", "Bavdhan", "Warje", "Katraj", "Kondhwa", "Market Yard",
    "Shukrawar Peth", "Mangalwar Peth", "Budhwar Peth", "Gokhale Nagar",
    "Deccan", "FC Road", "JM Road", "Bibwewadi", "Sahakar Nagar",
    "Nagar Road", "Yerwada", "Kalyani Nagar", "Koregaon Park", "Camp",
    "Prabhat Road", "Erandwane", "Model Colony", "Mukund Nagar",
    "Parvati", "Sinhagad Road", "Narhe", "Ambegaon", "Katraj",
    "Sadashiv Peth", "Tilak Road", "Navipeth", "Shaniwar Peth"
  ];
  
  const textLower = text.toLowerCase();
  for (const area of puneAreas) {
    if (textLower.includes(area.toLowerCase())) {
      return area;
    }
  }
  
  // Try to extract any location-like word
  const locationMatch = text.match(/\b(in|at|near|beside|opposite)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (locationMatch) {
    return locationMatch[2];
  }
  
  return "Pune";
};

const determineType = (text) => {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('pg') || textLower.includes('hostel') || textLower.includes('paying guest')) {
    return 'PG';
  }
  if (textLower.includes('shared') || textLower.includes('sharing') || textLower.includes('co-living')) {
    return 'SHARED';
  }
  if (textLower.includes('1 bhk') || textLower.includes('1bhk')) {
    return 'BHK1';
  }
  if (textLower.includes('2 bhk') || textLower.includes('2bhk')) {
    return 'BHK2';
  }
  if (textLower.includes('3 bhk') || textLower.includes('3bhk')) {
    return 'BHK3';
  }
  if (textLower.includes('rk') || textLower.includes('room kitchen')) {
    return 'RK';
  }
  
  return 'SHARED';
};

const determineGender = (text) => {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('boy') || textLower.includes('male') || textLower.includes('gents')) {
    return 'BOYS';
  }
  if (textLower.includes('girl') || textLower.includes('female') || textLower.includes('ladies')) {
    return 'GIRLS';
  }
  
  return 'ANYONE';
};

const determineFurnished = (text) => {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('fully furnished') || textLower.includes('full furnished')) {
    return 'FURNISHED';
  }
  if (textLower.includes('semi') || textLower.includes('partial')) {
    return 'SEMI_FURNISHED';
  }
  if (textLower.includes('unfurnished') || textLower.includes('non-furnished')) {
    return 'UNFURNISHED';
  }
  
  return 'UNFURNISHED';
};

const extractRent = (text) => {
  const patterns = [
    /rent[:\s]*₹?\s*(\d+(?:\.\d+)?[kmlacr]?)/i,
    /₹\s*(\d+(?:\.\d+)?[kmlacr]?)/,
    /(\d+(?:\.\d+)?[kmlacr]?)\s*(?:per month|pm|p\.m\.|monthly)/i,
    /rent[:\s]*(\d+(?:\.\d+)?[kmlacr]?)\s*per head/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseAmount(match[1]);
    }
  }
  
  return 0;
};

const extractDeposit = (text) => {
  const patterns = [
    /deposit[:\s]*₹?\s*(\d+(?:\.\d+)?[kmlacr]?)/i,
    /security[:\s]*₹?\s*(\d+(?:\.\d+)?[kmlacr]?)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseAmount(match[1]);
    }
  }
  
  return 0;
};

// ENHANCED: Amenity extraction function
const extractAmenities = (text) => {
  if (!text) return [];
  
  const textLower = text.toLowerCase();
  const foundAmenities = new Set();
  
  // Check each amenity keyword
  for (const [keyword, amenityCode] of Object.entries(AMENITY_MAPPING)) {
    // Create regex pattern to match whole word
    const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) {
      foundAmenities.add(amenityCode);
    }
  }
  
  // Handle furnishing status as amenity
  if (textLower.includes('fully furnished') || textLower.includes('full furnished')) {
    foundAmenities.add('FURNISHED');
  }
  if (textLower.includes('semi furnished') || textLower.includes('semi-furnished')) {
    foundAmenities.add('SEMI_FURNISHED');
  }
  
  // Handle "no restrictions" as amenity
  if (textLower.includes('no restrictions') || textLower.includes('no owner interference')) {
    foundAmenities.add('NO_RESTRICTIONS');
  }
  
  // Convert Set to Array
  return Array.from(foundAmenities);
};

const createDescription = (text) => {
  // Extract key points for description
  const lines = text.split(/[\.\n]/).filter(line => line.trim().length > 0);
  const keyLines = lines.slice(0, 4).map(line => `• ${line.trim()}`).join('\n');
  
  return `Room details extracted from message:\n${keyLines}\n\nContact for more information.`;
};

// Enhanced prompt for Groq AI
const getEnhancedPrompt = (message) => {
  return `You are an expert AI extracting room rental information from Indian rental messages. 
Extract ALL details from this rental message:

MESSAGE:
${message}

Return ONLY a JSON object with these EXACT fields:
{
  "rent": number (convert "k"=1000, "lakh"=100000, "lac"=100000, "cr"=10000000, remove commas),
  "deposit": number (security deposit amount),
  "type": "RK" | "SHARED" | "PG" | "BHK1" | "BHK2" | "BHK3" | "UNKNOWN",
  "area": string (extract Pune location/area),
  "gender": "BOYS" | "GIRLS" | "ANYONE",
  "furnished": "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED",
  "amenities": array of strings (EXTRACT ALL mentioned amenities using these codes: WASHING_MACHINE, AIR_CONDITIONING, WATER_HEATER, GAS_CONNECTION, WATER_PURIFIER, WIFI_INTERNET, LIFT, PARKING, SECURITY, CCTV, POWER_BACKUP, 24_HOUR_WATER, GYM, SWIMMING_POOL, BALCONY, WARDROBE, STUDY_TABLE, BED, FURNISHED, SEMI_FURNISHED, NO_RESTRICTIONS, etc.),
  "whatsapp": string (10-digit number only),
  "description": string (2-4 sentence summary highlighting key features)
}

SPECIAL INSTRUCTIONS FOR AMENITIES:
1. Map these words to codes:
   - "washing machine" → "WASHING_MACHINE"
   - "AC", "air conditioner" → "AIR_CONDITIONING"
   - "geyser", "hot water" → "WATER_HEATER"
   - "wifi", "internet" → "WIFI_INTERNET"
   - "lift", "elevator" → "LIFT"
   - "parking" → "PARKING"
   - "security", "gated" → "SECURITY"
   - "24x7 water" → "24_HOUR_WATER"
   - "wardrobe", "almirah" → "WARDROBE"
   - "study table" → "STUDY_TABLE"
   - "fully furnished" → "FURNISHED" (add to amenities array too)
   - "semi furnished" → "SEMI_FURNISHED"
   - "no restrictions" → "NO_RESTRICTIONS"
   - "gym", "fitness" → "GYM"

2. Extract ALL amenities mentioned, even if separated by commas, slashes, or in list format.

3. Examples:
   - Input: "washing machine , AC , spacious wardrobe, study table" 
     → ["WASHING_MACHINE", "AIR_CONDITIONING", "WARDROBE", "STUDY_TABLE"]
   - Input: "water purifier, gas Geyser, Gas cylinder"
     → ["WATER_PURIFIER", "WATER_HEATER", "GAS_CONNECTION"]
   - Input: "fully furnished flat with wifi and parking"
     → ["FURNISHED", "WIFI_INTERNET", "PARKING"]

4. Include "FURNISHED" in amenities array if message says "fully furnished".

Return ONLY valid JSON. No explanations, no markdown, just JSON.`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || message.trim().length < 20) {
      return res.status(400).json({
        error: 'Message too short. Please provide a detailed message with room information.'
      });
    }

    // Use Groq AI for extraction if available
    if (process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      const groq = new Groq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      });

      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: getEnhancedPrompt(message) }],
          temperature: 0.1,
          max_tokens: 1000,
        });

        const content = response.choices[0].message.content;
        
        // Clean and parse JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let data;
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.log('AI JSON parse failed, using regex extraction');
            data = {};
          }
          
          // Validate and clean data with fallback to regex
          const validatedData = {
            rent: data.rent || extractRent(message),
            deposit: data.deposit || extractDeposit(message),
            type: data.type || determineType(message),
            area: data.area || extractArea(message),
            gender: data.gender || determineGender(message),
            furnished: data.furnished || determineFurnished(message),
            amenities: Array.isArray(data.amenities) ? data.amenities : extractAmenities(message),
            whatsapp: data.whatsapp || extractWhatsApp(message),
            description: data.description || createDescription(message)
          };
          
          // Ensure amenities is an array and remove duplicates
          if (validatedData.amenities && Array.isArray(validatedData.amenities)) {
            validatedData.amenities = [...new Set(validatedData.amenities)]
              .filter(amenity => amenity && typeof amenity === 'string' && amenity.trim().length > 0);
          } else {
            validatedData.amenities = extractAmenities(message);
          }
          
          return res.status(200).json(validatedData);
        }
      } catch (aiError) {
        console.log('AI extraction failed, falling back to regex:', aiError.message);
      }
    }

    // Fallback to regex extraction
    const fallbackData = {
      rent: extractRent(message),
      deposit: extractDeposit(message),
      type: determineType(message),
      area: extractArea(message),
      gender: determineGender(message),
      furnished: determineFurnished(message),
      amenities: extractAmenities(message), // Added amenities extraction
      whatsapp: extractWhatsApp(message),
      description: createDescription(message)
    };

    return res.status(200).json(fallbackData);

  } catch (error) {
    console.error('Extraction error:', error);
    
    return res.status(500).json({
      error: 'Failed to extract room details',
      details: error.message,
      suggestion: 'Please try entering details manually or use a different message format.'
    });
  }
}