import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui";

export default function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow: Array<"ADMIN" | "STUDENT" | "MODERATOR" | "USER">;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.profile_type as any)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
