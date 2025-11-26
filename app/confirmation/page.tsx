"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const payment = searchParams.get("payment");

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#f4e4bc] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#d4af37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#1a1a2e] mb-4">
              {payment === "success"
                ? "Payment Successful! Your order has been confirmed."
                : "Thank you, your details have been received."}
            </h1>
          </div>

          {payment === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Payment confirmed!</strong> Your reading request has been successfully submitted.
              </p>
            </div>
          )}

          <div className="space-y-4 text-[#4a4a5e] mb-8">
            <p className="text-lg">
              You'll receive your personalised reading at <strong className="text-[#1a1a2e]">{email}</strong> within 48 hours.
            </p>
            <p className="text-sm">
              We keep your details for 30 days so we can resend your report if needed. After that they are permanently deleted.
            </p>
          </div>

          <Link
            href="/"
            className="inline-block bg-[#1a1a2e] text-white px-8 py-3 rounded-md font-medium hover:bg-[#2a2a3e] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Confirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#4a4a5e]">Loading...</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
