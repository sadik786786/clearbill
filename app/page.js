import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import GoogleLoginButton from "./components/GoogleLoginButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Smart & Simple{" "}
          <span className="text-blue-400">Invoice Management</span>
        </h1>

        <p className="mt-4 text-lg text-gray-200">
          ClearBill helps businesses create professional invoices, manage clients,
          track payments, and gain financial insights — all in one place.
        </p>

        {/* Show different content based on auth status */}
        {session ? (
          <div className="mt-8">
            <p className="text-xl text-white mb-4">
              Welcome back, {session.user?.name?.split(" ")[0] || "User"}!
            </p>
            <p className="text-gray-300">
              You're already signed in. Go to your{" "}
              <a href="/dashboard" className="text-blue-300 hover:text-blue-200 underline">
                dashboard
              </a>{" "}
              to get started.
            </p>
          </div>
        ) : (
          <>
            {/* CTA - Button will only show if NOT signed in */}
            <div className="mt-8 flex justify-center">
              <GoogleLoginButton />
            </div>

            <p className="mt-6 text-sm text-gray-300">
              Secure sign-in powered by Google
            </p>
          </>
        )}
      </div>
    </section>
  );
}