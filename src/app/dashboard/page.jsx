"use client";

import { useAuth } from "@/context/AuthContext";
import StudentDashboardPage from "./StudentDashboardPage";
import MentorDashboardPage  from "../mentor-dashboard/page";

export default function DashboardPage() {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;
  if (!user) return null;

  if (user.role === "MENTOR") {
    return <MentorDashboardPage />;
  }

  return <StudentDashboardPage />;
}