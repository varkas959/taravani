"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentContent() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load form data from sessionStorage
    const stored = sessionStorage.getItem("formData");
    if (!stored) {
      router.push("/form/step1");
      return;
    }

    const data = JSON.parse(stored);
    setFormData(data);
    
    // Create Razorpay order
    createOrder(data);
  }, [router]);

  const createOrder = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to create order");
      }

      setOrderData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (!orderData || !window.Razorpay) {
      setError("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Taravani",
      description: "Complete Astrology Report",
      order_id: orderData.orderId,
      handler: async function (response: any) {
        // Verify payment on server
        try {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              readingId: orderData.readingId,
            }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResponse.ok && verifyResult.success) {
            // Clear form data
            sessionStorage.removeItem("formData");
            // Redirect to confirmation page
            router.push(`/confirmation?email=${encodeURIComponent(formData.email)}&payment=success`);
          } else {
            setError(verifyResult.message || "Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        } catch (err) {
          setError("Payment verification failed. Please contact support.");
          setIsProcessing(false);
        }
      },
      prefill: {
        name: formData?.fullName || "",
        email: formData?.email || "",
        contact: "", // Explicitly set to empty to prevent auto-fill
      },
      theme: {
        color: "#1a1a2e",
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function (response: any) {
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    });
    razorpay.open();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a2e] mx-auto mb-4"></div>
          <p className="text-[#4a4a5e]">Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-red-300 p-8 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-4">
              Payment Setup Error
            </h1>
            <p className="text-[#4a4a5e] mb-6">{error}</p>
            <Link
              href="/form/step3"
              className="inline-block bg-[#1a1a2e] text-white px-8 py-3 rounded-md font-medium hover:bg-[#2a2a3e] transition-colors"
            >
              ← Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          setRazorpayLoaded(true);
        }}
        onError={() => {
          setError("Failed to load payment gateway. Please refresh the page.");
        }}
      />
      <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/form/step3"
              className="text-[#1a1a2e] hover:text-[#d4af37] transition-colors"
            >
              ← Back to Step 3
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-[#8a8a9e]">Step 4 of 4</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#1a1a2e] mb-2">
                Complete Your Payment
              </h1>
              <p className="text-[#4a4a5e]">
                Secure payment through Razorpay. Your reading will be processed after successful payment.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-[#f8f9fa] rounded-lg p-6 border border-[#e0e0e0]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#4a4a5e]">Service</span>
                  <span className="font-medium text-[#1a1a2e]">Complete Astrology Report</span>
                </div>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#e0e0e0]">
                  <span className="text-[#4a4a5e]">Focus Area</span>
                  <span className="font-medium text-[#1a1a2e]">{formData?.focusArea}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#1a1a2e]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#1a1a2e]">₹499</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Secure Payment:</strong> Your payment is processed securely through Razorpay. 
                  We accept UPI, Cards, Netbanking, and Wallets.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded || !window.Razorpay}
                className="w-full bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] text-white px-8 py-4 rounded-md font-medium hover:from-[#2a2a3e] hover:to-[#3a3a4e] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
              >
                {isProcessing
                  ? "Processing..."
                  : !razorpayLoaded || !window.Razorpay
                  ? "Loading Payment Gateway..."
                  : "Pay ₹499 & Complete Order"}
              </button>

              <p className="text-xs text-center text-[#8a8a9e]">
                By proceeding, you agree to our Terms & Conditions and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a2e] mx-auto mb-4"></div>
            <p className="text-[#4a4a5e]">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

