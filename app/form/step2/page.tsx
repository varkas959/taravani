"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PlaceSuggestion {
  display_name: string;
  place_id: number;
}

export default function Step2() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    timeOfBirth: "",
    approximateTime: false,
    placeOfBirth: "",
  });
  const [errors, setErrors] = useState<{
    dateOfBirth?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
  }>({});
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load previous step data
    const stored = sessionStorage.getItem("formData");
    if (!stored) {
      router.push("/form/step1");
    }
  }, [router]);

  // Fetch place suggestions
  const fetchPlaceSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setPlaceSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Taravani Astrology App' // Required by Nominatim
          }
        }
      );
      const data = await response.json();
      setPlaceSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
      setPlaceSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle place input change with debouncing
  const handlePlaceChange = (value: string) => {
    setFormData({ ...formData, placeOfBirth: value });
    
    // Clear previous timeout
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    // Debounce API calls
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchPlaceSuggestions(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setFormData({ ...formData, placeOfBirth: suggestion.display_name });
    setShowSuggestions(false);
    setPlaceSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validate = () => {
    const newErrors: {
      dateOfBirth?: string;
      timeOfBirth?: string;
      placeOfBirth?: string;
    } = {};
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.timeOfBirth && !formData.approximateTime) {
      newErrors.timeOfBirth = "Time of birth is required";
    }
    if (!formData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = "Place of birth is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Merge with previous step data
      const stored = JSON.parse(sessionStorage.getItem("formData") || "{}");
      sessionStorage.setItem("formData", JSON.stringify({ ...stored, ...formData }));
      router.push("/form/step3");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/form/step1" className="text-[#1a1a2e] hover:text-[#d4af37] transition-colors">
            ← Back to Step 1
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-[#8a8a9e]">Step 2 of 3</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#1a1a2e] mb-2">Birth Details</h1>
            <p className="text-[#4a4a5e]">These details allow accurate birth chart mapping.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${
                  errors.dateOfBirth ? "border-red-500" : "border-[#e0e0e0]"
                }`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label htmlFor="timeOfBirth" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Time of Birth <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <input
                  type="time"
                  id="timeOfBirth"
                  value={formData.timeOfBirth}
                  onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                  disabled={formData.approximateTime}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${
                    errors.timeOfBirth ? "border-red-500" : "border-[#e0e0e0]"
                  } ${formData.approximateTime ? "bg-gray-100" : ""}`}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="approximateTime"
                    checked={formData.approximateTime}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        approximateTime: e.target.checked,
                        timeOfBirth: e.target.checked ? "" : formData.timeOfBirth,
                      });
                    }}
                    className="w-4 h-4 text-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37]"
                  />
                  <label htmlFor="approximateTime" className="ml-2 text-sm text-[#4a4a5e]">
                    I don't know the exact time
                  </label>
                </div>
                {formData.approximateTime && (
                  <select
                    value={formData.timeOfBirth}
                    onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="">Select approximate time</option>
                    <option value="00:00">Midnight (12:00 AM)</option>
                    <option value="06:00">Early Morning (6:00 AM)</option>
                    <option value="12:00">Noon (12:00 PM)</option>
                    <option value="18:00">Evening (6:00 PM)</option>
                  </select>
                )}
              </div>
              {errors.timeOfBirth && <p className="mt-1 text-sm text-red-500">{errors.timeOfBirth}</p>}
            </div>

            <div className="relative">
              <label htmlFor="placeOfBirth" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Place of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={(e) => handlePlaceChange(e.target.value)}
                  onFocus={() => {
                    if (placeSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] ${
                    errors.placeOfBirth ? "border-red-500" : "border-[#e0e0e0]"
                  }`}
                  placeholder="Start typing city name (e.g., Tirupati, Mumbai)"
                  autoComplete="off"
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6366f1]"></div>
                  </div>
                )}
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && placeSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-[#e0e0e0] rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {placeSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-[#f8f9fa] focus:bg-[#f8f9fa] focus:outline-none transition-colors border-b border-[#e0e0e0] last:border-b-0"
                    >
                      <div className="text-sm text-[#1a1a2e]">{suggestion.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {errors.placeOfBirth && <p className="mt-1 text-sm text-red-500">{errors.placeOfBirth}</p>}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-[#1a1a2e] text-white px-8 py-3 rounded-md font-medium hover:bg-[#2a2a3e] transition-colors"
              >
                Next →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

