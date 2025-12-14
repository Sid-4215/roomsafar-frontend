import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  const { id } = req.query;

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/rooms/${id}`
  );
  if (!apiRes.ok) return res.status(404).end();

  const room = await apiRes.json();

  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  let bgLoaded = false;

  // 🔹 Load ROOM IMAGE from Cloudinary
  try {
    const imgUrl = room.images?.[0]?.url;
    if (imgUrl) {
      const img = await loadImage(imgUrl);

      // cover-style crop (no stretching)
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;

      ctx.drawImage(
        img,
        x,
        y,
        img.width * scale,
        img.height * scale
      );

      bgLoaded = true;
    }
  } catch {}

  // fallback background
  if (!bgLoaded) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
  }

  // overlay
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, width, height);

  // text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px sans-serif";
  ctx.fillText(`₹${room.rent}`, 60, 130);

  ctx.font = "40px sans-serif";
  ctx.fillText(
    `${room.type || "Room"} · ${room.address?.area || "Pune"}`,
    60,
    200
  );

  ctx.font = "28px sans-serif";
  ctx.fillText("No Brokerage • Verified Rooms", 60, 260);

  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Roomsafar", 60, 580);

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(canvas.toBuffer("image/png"));
}
