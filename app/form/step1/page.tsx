"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Step1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});

  const validate = () => {
    const newErrors: { fullName?: string; email?: string } = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Store in sessionStorage and move to next step
      sessionStorage.setItem("formData", JSON.stringify(formData));
      router.push("/form/step2");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-[#1a1a2e] hover:text-[#d4af37] transition-colors">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-[#8a8a9e]">Step 1 of 3</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#1a1a2e] mb-2">Contact Information</h1>
            <p className="text-[#4a4a5e]">We'll send your report to this email.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${
                  errors.fullName ? "border-red-500" : "border-[#e0e0e0]"
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${
                  errors.email ? "border-red-500" : "border-[#e0e0e0]"
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-[#1a1a2e] text-white px-8 py-3 rounded-md font-medium hover:bg-[#2a2a3e] transition-colors"
              >
                Continue →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

