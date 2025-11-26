"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Step3() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    focusArea: "",
    consent1: false,
    consent2: false,
  });
  const [errors, setErrors] = useState<{
    focusArea?: string;
    consent1?: string;
    consent2?: string;
  }>({});

  useEffect(() => {
    // Load previous step data
    const stored = sessionStorage.getItem("formData");
    if (!stored) {
      router.push("/form/step1");
    }
  }, [router]);

  const validate = () => {
    const newErrors: {
      focusArea?: string;
      consent1?: string;
      consent2?: string;
    } = {};
    if (!formData.focusArea) {
      newErrors.focusArea = "Please select a focus area";
    }
    if (!formData.consent1) {
      newErrors.consent1 = "This consent is required";
    }
    if (!formData.consent2) {
      newErrors.consent2 = "This consent is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Merge with previous step data and save to sessionStorage
    const stored = JSON.parse(sessionStorage.getItem("formData") || "{}");
    sessionStorage.setItem("formData", JSON.stringify({ ...stored, ...formData }));
    
    // Redirect to payment page
    router.push("/form/payment");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/form/step2" className="text-[#1a1a2e] hover:text-[#d4af37] transition-colors">
            ← Back to Step 2
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-[#8a8a9e]">Step 3 of 4</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#1a1a2e] mb-2">Reading Preferences + Consent</h1>
            <p className="text-[#4a4a5e]">Choose your focus area and confirm your consent.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="focusArea" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Focus Area <span className="text-red-500">*</span>
              </label>
              <select
                id="focusArea"
                value={formData.focusArea}
                onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${
                  errors.focusArea ? "border-red-500" : "border-[#e0e0e0]"
                }`}
              >
                <option value="">Select a focus area</option>
                <option value="Career">Career</option>
                <option value="Relationships">Relationships</option>
                <option value="Health">Health</option>
                <option value="Money">Money</option>
                <option value="General">General</option>
              </select>
              {errors.focusArea && <p className="mt-1 text-sm text-red-500">{errors.focusArea}</p>}
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent1"
                    checked={formData.consent1}
                    onChange={(e) => setFormData({ ...formData, consent1: e.target.checked })}
                    className="w-5 h-5 mt-0.5 flex-shrink-0 accent-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37] cursor-pointer"
                    style={{ minWidth: '1.25rem', minHeight: '1.25rem', width: '1.25rem', height: '1.25rem' }}
                  />
                  <label htmlFor="consent1" className="ml-3 text-sm text-[#4a4a5e] cursor-pointer">
                    I understand this is a human-written report delivered by email within 48 hours.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.consent1 && <p className="mt-1 ml-8 text-sm text-red-500">{errors.consent1}</p>}
              </div>

              <div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent2"
                    checked={formData.consent2}
                    onChange={(e) => setFormData({ ...formData, consent2: e.target.checked })}
                    className="w-5 h-5 mt-0.5 flex-shrink-0 accent-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37] cursor-pointer"
                    style={{ minWidth: '1.25rem', minHeight: '1.25rem', width: '1.25rem', height: '1.25rem' }}
                  />
                  <label htmlFor="consent2" className="ml-3 text-sm text-[#4a4a5e] cursor-pointer">
                    I agree that my details will be stored only for up to 30 days so the report can be resent if needed, after which they will be deleted.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.consent2 && <p className="mt-1 ml-8 text-sm text-red-500">{errors.consent2}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-[#1a1a2e] text-white px-8 py-3 rounded-md font-medium hover:bg-[#2a2a3e] transition-colors"
              >
                Continue to Payment →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

