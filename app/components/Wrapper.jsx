'use client'
import { SessionProvider } from "next-auth/react";

export default function Wrapper({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </SessionProvider>
  );
}