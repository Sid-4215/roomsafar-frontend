"use client";
import React from "react";
import RoomsList from "./RoomsList";
import RoomDetails from "./RoomDetails";
import RoomGallery from "./RoomGallery";

export default function RoomsUI({ api, page = "rooms", id }) {
  if (page === "details") return <RoomDetails api={api} roomId={id} />;
  if (page === "gallery") return <RoomGallery api={api} roomId={id} />;

  return <RoomsList api={api} />;
}
