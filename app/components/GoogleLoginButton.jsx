'use client';

import { signIn, useSession } from "next-auth/react";

export default function GoogleLoginButton() {
  const { data: session, status } = useSession();

  // Show nothing if user is signed in
  if (session) {
    return null; // Button disappears completely
  }

  // Show loading state while checking
  if (status === "loading") {
    return (
      <button
        disabled
        className="
          w-full sm:w-auto
          flex items-center justify-center gap-3
          px-4 sm:px-6 py-3
          rounded-lg bg-gray-100 text-gray-500 font-semibold
          shadow-md
          text-sm sm:text-base
          cursor-not-allowed
        "
      >
        <span>Loading...</span>
      </button>
    );
  }

  // Only show button if NOT signed in
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="
        w-full sm:w-auto
        flex items-center justify-center gap-3
        px-4 sm:px-6 py-3
        rounded-lg bg-white text-gray-900 font-semibold
        hover:bg-gray-100 transition
        shadow-md
        text-sm sm:text-base
      "
    >
      {/* Google Icon */}
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5 sm:w-6 sm:h-6"
      />

      {/* Text */}
      <span className="truncate">
        Continue with Google
      </span>
    </button>
  );
}