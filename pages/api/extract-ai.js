import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const client = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    });

    const { message } = req.body;

    if (!message || message.trim().length < 10) {
      return res.status(400).json({ 
        error: "Message too short. Please provide a proper message." 
      });
    }

    const prompt = `
Extract room rental details from this message. Return ONLY JSON with no other text.

MESSAGE:
"""${message}"""

Return this exact JSON structure:
{
  "rent": number,
  "deposit": number,
  "type": "RK | SHARED | PG | BHK1 | BHK2 | BHK3 | UNKNOWN",
  "area": string,
  "gender": "BOYS | GIRLS | ANYONE",
  "furnished": "FURNISHED | SEMI_FURNISHED | UNFURNISHED",
  "whatsapp": string,
  "description": string
}

IMPORTANT RULES:
- Rent: Convert like 7k → 7000, 7.5k → 7500
- Deposit: Extract number or use 0 if not found
- Type: 
  * PG, hostel → "PG"
  * sharing, shared → "SHARED"
  * 1 RK, RK → "RK"
  * 1 BHK → "BHK1"
  * 2 BHK → "BHK2"
  * 3 BHK → "BHK3"
- Area: Extract location like "Kothrud", "Hinjewadi", "Dattawadi"
- Gender: 
  * boys, male → "BOYS"
  * girls, female → "GIRLS"
  * mixed, anyone → "ANYONE"
- Furnished:
  * fully furnished → "FURNISHED"
  * semi furnished → "SEMI_FURNISHED"
  * unfurnished → "UNFURNISHED"
- WhatsApp: Extract only 10-digit number
- Description: Summarize in 3-6 lines with amenities

RETURN ONLY JSON. NO CODE BLOCKS. NO MARKDOWN. NO EXTRA TEXT.
`;

    console.log("Sending request to Groq AI...");
    
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "You are a JSON-only API. You must return ONLY valid JSON, no other text, no explanations, no markdown, no code blocks." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const text = response.choices[0].message.content.trim();
    console.log("Raw AI response:", text);

    // Clean the response - remove any markdown code blocks
    let cleanedText = text;
    
    // Remove ```json and ``` markers
    cleanedText = cleanedText.replace(/```json\s*/g, '');
    cleanedText = cleanedText.replace(/```\s*/g, '');
    
    // Remove any text before the first { and after the last }
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("No JSON found in response:", cleanedText);
      return res.status(500).json({ 
        error: "AI returned invalid format",
        rawResponse: text 
      });
    }
    
    const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
    console.log("Extracted JSON text:", jsonText);

    // Parse and validate the JSON
    try {
      const data = JSON.parse(jsonText);
      
      // Ensure all required fields have default values
      const validatedData = {
        rent: typeof data.rent === 'number' ? data.rent : 
              typeof data.rent === 'string' ? parseRent(data.rent) : 0,
        deposit: typeof data.deposit === 'number' ? data.deposit : 
                typeof data.deposit === 'string' ? parseDeposit(data.deposit) : 0,
        type: validateType(data.type || "UNKNOWN"),
        area: data.area || "Unknown Area",
        gender: validateGender(data.gender || "ANYONE"),
        furnished: validateFurnished(data.furnished || "UNFURNISHED"),
        whatsapp: extractWhatsAppNumber(data.whatsapp || ""),
        description: data.description || "No description available"
      };

      console.log("Validated data:", validatedData);
      return res.status(200).json(validatedData);

    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Problematic JSON text:", jsonText);
      
      // Try to create a basic response from the raw text
      const fallbackData = createFallbackData(text, message);
      return res.status(200).json(fallbackData);
    }

  } catch (err) {
    console.error("GROQ AI ERROR →", err.message || err);
    
    // Provide more specific error messages
    if (err.message?.includes("API key")) {
      return res.status(500).json({ 
        error: "AI service configuration error. Check API key." 
      });
    }
    
    if (err.message?.includes("rate limit")) {
      return res.status(429).json({ 
        error: "AI service rate limit exceeded. Try again later." 
      });
    }
    
    return res.status(500).json({ 
      error: "AI extraction failed. Please try again or enter details manually.",
      details: err.message 
    });
  }
}

// Helper function to parse rent strings
function parseRent(rentStr) {
  if (!rentStr) return 0;
  
  const str = rentStr.toLowerCase().replace(/,/g, '');
  let match = str.match(/(\d+(?:\.\d+)?)\s*k/);
  
  if (match) {
    return parseFloat(match[1]) * 1000;
  }
  
  match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper function to parse deposit strings
function parseDeposit(depositStr) {
  if (!depositStr) return 0;
  
  const str = depositStr.toLowerCase().replace(/,/g, '');
  let match = str.match(/(\d+(?:\.\d+)?)\s*k/);
  
  if (match) {
    return parseFloat(match[1]) * 1000;
  }
  
  match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper function to validate and normalize type
function validateType(type) {
  const upperType = type.toUpperCase().trim();
  
  const typeMap = {
    'RK': 'RK',
    '1RK': 'RK',
    'SHARED': 'SHARED',
    'PG': 'PG',
    'HOSTEL': 'PG',
    '1BHK': 'BHK1',
    '1 BHK': 'BHK1',
    'BHK1': 'BHK1',
    '2BHK': 'BHK2',
    '2 BHK': 'BHK2',
    'BHK2': 'BHK2',
    '3BHK': 'BHK3',
    '3 BHK': 'BHK3',
    'BHK3': 'BHK3',
    'UNKNOWN': 'UNKNOWN'
  };
  
  return typeMap[upperType] || 'UNKNOWN';
}

// Helper function to validate and normalize gender
function validateGender(gender) {
  const upperGender = gender.toUpperCase().trim();
  
  if (upperGender.includes('BOY') || upperGender.includes('MALE')) {
    return 'BOYS';
  }
  
  if (upperGender.includes('GIRL') || upperGender.includes('FEMALE')) {
    return 'GIRLS';
  }
  
  return 'ANYONE';
}

// Helper function to validate and normalize furnished status
function validateFurnished(furnished) {
  const upperFurnished = furnished.toUpperCase().trim();
  
  if (upperFurnished.includes('FULLY') || upperFurnished.includes('FURNISHED')) {
    return 'FURNISHED';
  }
  
  if (upperFurnished.includes('SEMI')) {
    return 'SEMI_FURNISHED';
  }
  
  return 'UNFURNISHED';
}

// Helper function to extract WhatsApp number
function extractWhatsAppNumber(text) {
  if (!text) return '';
  
  // Extract 10-digit numbers
  const matches = text.match(/\d{10}/g);
  return matches ? matches[0] : '';
}

// Fallback function if AI extraction fails
function createFallbackData(rawText, originalMessage) {
  console.log("Creating fallback data from:", rawText);
  
  // Try to extract basic information using regex
  const rentMatch = originalMessage.match(/(\d+(?:\.\d+)?)\s*k/i);
  const rent = rentMatch ? parseFloat(rentMatch[1]) * 1000 : 0;
  
  const depositMatch = originalMessage.match(/deposit[:\s]+(\d+(?:\.\d+)?)\s*k/i);
  const deposit = depositMatch ? parseFloat(depositMatch[1]) * 1000 : 0;
  
  // Extract area (look for common Pune areas)
  const areas = [
    'Kothrud', 'Hinjewadi', 'Dattawadi', 'Karve Nagar', 'Shivaji Nagar',
    'Viman Nagar', 'Kharadi', 'Wagholi', 'Hadapsar', 'Baner', 'Aundh',
    'Pashan', 'Bavdhan', 'Warje', 'Katraj', 'Kondhwa', 'Market Yard'
  ];
  
  let area = "Unknown";
  for (const areaName of areas) {
    if (originalMessage.includes(areaName)) {
      area = areaName;
      break;
    }
  }
  
  // Determine type
  let type = "UNKNOWN";
  if (originalMessage.toLowerCase().includes('pg') || originalMessage.toLowerCase().includes('hostel')) {
    type = "PG";
  } else if (originalMessage.toLowerCase().includes('shared') || originalMessage.toLowerCase().includes('sharing')) {
    type = "SHARED";
  } else if (originalMessage.toLowerCase().includes('1 bhk')) {
    type = "BHK1";
  } else if (originalMessage.toLowerCase().includes('2 bhk')) {
    type = "BHK2";
  } else if (originalMessage.toLowerCase().includes('3 bhk')) {
    type = "BHK3";
  } else if (originalMessage.toLowerCase().includes('rk')) {
    type = "RK";
  }
  
  // Determine gender
  let gender = "ANYONE";
  if (originalMessage.toLowerCase().includes('boy') || originalMessage.toLowerCase().includes('male')) {
    gender = "BOYS";
  } else if (originalMessage.toLowerCase().includes('girl') || originalMessage.toLowerCase().includes('female')) {
    gender = "GIRLS";
  }
  
  // Determine furnished
  let furnished = "UNFURNISHED";
  if (originalMessage.toLowerCase().includes('fully furnished')) {
    furnished = "FURNISHED";
  } else if (originalMessage.toLowerCase().includes('semi')) {
    furnished = "SEMI_FURNISHED";
  }
  
  // Extract WhatsApp number
  const whatsappMatch = originalMessage.match(/\d{10}/);
  const whatsapp = whatsappMatch ? whatsappMatch[0] : "";
  
  // Create description
  const description = originalMessage.length > 200 
    ? originalMessage.substring(0, 200) + "..."
    : originalMessage;
  
  return {
    rent,
    deposit,
    type,
    area,
    gender,
    furnished,
    whatsapp,
    description
  };
}