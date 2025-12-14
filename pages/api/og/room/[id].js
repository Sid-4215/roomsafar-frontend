import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const roomId = url.pathname.split("/").pop();

    let roomData = null;
    let imageUrl = null;
    
    if (roomId) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
        const response = await fetch(`${apiUrl}/api/rooms/${roomId}`, {
          cache: "no-store",
        });
        
        if (response.ok) {
          roomData = await response.json();
          
          if (roomData?.images && roomData.images.length > 0) {
            const primaryImage = roomData.images[0];
            imageUrl = primaryImage.url;
            // Make sure URL is absolute
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://roomsafar.com${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch room:", error);
      }
    }

    const title = roomData?.title || "Premium Room Available";
    const rent = roomData?.rent ? `₹${roomData.rent.toLocaleString("en-IN")}` : "Contact for Price";
    const location = roomData?.address?.area || roomData?.city || "Pune";
    const type = roomData?.type || "ROOM";
    const deposit = roomData?.deposit ? `₹${roomData.deposit.toLocaleString("en-IN")}` : "Contact";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Left side - Image */}
          <div
            style={{
              display: "flex",
              width: "600px",
              height: "630px",
              backgroundColor: "#f3f4f6",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                style={{
                  width: "600px",
                  height: "630px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "600px",
                  height: "630px",
                  backgroundColor: "#e5e7eb",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "40px",
                    color: "#6b7280",
                  }}
                >
                  🏠
                </div>
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "600px",
              height: "630px",
              padding: "50px",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#2563eb",
                }}
              >
                Roomsafar
              </div>
              
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "36px",
                    fontWeight: 800,
                    color: "#059669",
                  }}
                >
                  {rent}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "18px",
                    color: "#6b7280",
                  }}
                >
                  per month
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Room Type */}
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "30px",
                }}
              >
                {type === "BHK1" ? "1 BHK" : type}
              </div>


              {/* Location */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "24px",
                  color: "#4b5563",
                  marginBottom: "30px",
                }}
              >
                📍 {location}
              </div>

              {/* Details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "20px",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  Deposit: {deposit}
                </div>
                
                {roomData?.brokerageRequired === false && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    ✅ No Brokerage Required
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "18px",
                color: "#6b7280",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontWeight: 600,
                }}
              >
                roomsafar.com
              </div>
              
        
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image error:", error);
    
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#2563eb",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "48px",
              fontWeight: 700,
              color: "white",
            }}
          >
            Roomsafar
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}