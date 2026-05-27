import type { Metadata } from "next";
import RestaurantsClient from "./restaurants-client";

export const metadata: Metadata = {
  title: "Restaurantes",
};

export default function RestaurantsPage() {
  return <RestaurantsClient />;
}
