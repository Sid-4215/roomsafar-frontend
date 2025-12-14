import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

export default function handler(req) {
  const roomId = req.url.split("/").pop();
  return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:60,background:"linear-gradient(135deg,#1e40af,#2563eb)",color:"white",fontFamily:"system-ui,sans-serif"}}><div style={{display:"flex",fontSize:40,fontWeight:800}}>Roomsafar</div><div style={{display:"flex",flexDirection:"column"}}><div style={{fontSize:56,fontWeight:900}}>Verified Room</div><div style={{fontSize:32,marginTop:10}}>Room ID: {roomId}</div></div><div style={{display:"flex",fontSize:28,fontWeight:700}}>No Brokerage • Direct Owner</div></div>,{width:1200,height:630});
}
