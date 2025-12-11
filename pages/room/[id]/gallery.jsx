"use client";
import SectionGallery from "@/components/room-ui/SectionGallery";
import RoomGallery from "../../../components/room-ui/RoomGallery";
import { useRouter } from "next/router";

export default function GalleryPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return null;

  return <SectionGallery roomId={id} />;
}
