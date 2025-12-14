// pages/api/og/room/[id].js
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Helper function to fetch room data
async function fetchRoomData(roomId) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE 
      ? `${process.env.NEXT_PUBLIC_API_BASE}/api/rooms/${roomId}`
      : `https://roomsafar.com/api/rooms/${roomId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching room data:', error);
    return null;
  }
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = req.url.split('/').pop().split('?')[0];
    
    // Get parameters
    const title = searchParams.get('title') || 'Room for Rent';
    const rent = searchParams.get('rent') || '';
    const area = searchParams.get('area') || 'Pune';
    
    // Try to fetch room data
    let room = null;
    if (roomId && roomId !== 'undefined') {
      room = await fetchRoomData(roomId);
    }
    
    // Use room data if available, otherwise use query params
    const roomTitle = room?.type 
      ? `${room.type} in ${room.address?.area || 'Pune'}`
      : title;
    
    const roomRent = room?.rent || rent || 'Contact for Price';
    const roomArea = room?.address?.area || area || 'Pune';
    
    // Generate the OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: 'white',
            padding: 60,
            justifyContent: 'space-between',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {/* Logo/Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: 'white' }}>
              Roomsafar.com
            </div>
            <div style={{ 
              fontSize: 20, 
              color: 'rgba(255,255,255,0.9)', 
              background: 'rgba(0,0,0,0.3)', 
              padding: '10px 20px', 
              borderRadius: 30,
              fontWeight: 600
            }}>
              Verified Property
            </div>
          </div>

          {/* Main Content */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 24,
            flex: 1,
            justifyContent: 'center'
          }}>
            <div style={{ 
              fontSize: 56, 
              fontWeight: 800, 
              lineHeight: 1.2,
              maxWidth: '90%'
            }}>
              {roomTitle.length > 60 ? roomTitle.substring(0, 60) + '...' : roomTitle}
            </div>
            
            <div style={{ 
              fontSize: 36, 
              color: '#dbeafe', 
              fontWeight: 600,
              marginTop: 10
            }}>
              {roomArea} • Pune, Maharashtra
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              fontSize: 28, 
              color: '#bfdbfe',
              marginTop: 20
            }}>
              <div style={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                background: '#34d399' 
              }}></div>
              No Brokerage • Verified Owner • Secure Booking
            </div>
          </div>

          {/* Footer with Price */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingTop: 40, 
            borderTop: '3px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ 
              fontSize: 24, 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500
            }}>
              Find verified rooms & flats with no brokerage
            </div>
            
            <div style={{ 
              fontSize: 72, 
              fontWeight: 900, 
              color: 'white', 
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ₹{roomRent}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000',
          'Content-Type': 'image/png',
        },
      }
    );
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    
    // Fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: 'white',
            fontSize: 60,
            fontWeight: 800,
            textAlign: 'center',
            padding: 40
          }}
        >
          Roomsafar.com
          <div style={{ fontSize: 32, marginTop: 30, color: '#bfdbfe' }}>
            Find Verified Rooms & Flats
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