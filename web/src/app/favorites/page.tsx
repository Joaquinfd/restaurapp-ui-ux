import type { Metadata } from "next";
import FavoritesClient from "./favorites-client";

export const metadata: Metadata = {
  title: "Mis Favoritos",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
