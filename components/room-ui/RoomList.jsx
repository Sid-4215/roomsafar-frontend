"use client";
import React, { useEffect, useState } from "react";
import RoomCard from "./RoomCard";

export default function RoomsList({ api }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api.searchRooms({ page: 0, size: 20 }).then((res) => {
      setRooms(res.content || res);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Rooms Near You</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((r) => (
          <RoomCard key={r.id} room={r} onClick={() => (window.location.href = `/room/${r.id}`)} />
        ))}
      </div>
    </div>
  );
}
