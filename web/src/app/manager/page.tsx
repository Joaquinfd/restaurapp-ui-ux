import type { Metadata } from "next";
import ManagerDashboardClient from "./manager-dashboard-client";

export const metadata: Metadata = {
  title: "Mis Restaurantes",
};

export default function ManagerDashboardPage() {
  return <ManagerDashboardClient />;
}
