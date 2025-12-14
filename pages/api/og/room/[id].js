// pages/api/og/room/[id].js
import { ImageResponse } from '@vercel/og';

export default async function handler(req, res) {
  try {
    const roomId = req.query.id;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1e40af, #2563eb)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 60,
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 800 }}>
            Roomsafar
          </div>

          <div>
            <div style={{ fontSize: 56, fontWeight: 900 }}>
              Verified Room
            </div>
            <div style={{ fontSize: 32, marginTop: 10 }}>
              Room ID: {roomId}
            </div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 700 }}>
            No Brokerage • Direct Owner
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      }
    );
  } catch (e) {
    return new ImageResponse(
      <div style={{ fontSize: 48 }}>Roomsafar</div>,
      { width: 1200, height: 630 }
    );
  }
}
