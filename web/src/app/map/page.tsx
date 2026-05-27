import type { Metadata } from "next";
import MapClient from "./map-client";

export const metadata: Metadata = {
  title: "Mapa",
};

export default function MapPage() {
  return <MapClient />;
}
