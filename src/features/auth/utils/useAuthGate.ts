"use client";

/**
 * Prefer `useAuth` from AuthProvider. Kept so older imports keep working.
 */
export type { AuthIntent } from "@/features/auth/components/AuthProvider";
export { useAuth as useAuthGate } from "@/features/auth/components/AuthProvider";
