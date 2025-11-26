"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Reading {
  id: string;
  name: string;
  email: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  focusArea: string;
  status: string;
  reportText: string | null;
  reportSentAt: string | null;
  createdAt: string;
  deleteAt: string;
}

export default function ReadingDetail() {
  const router = useRouter();
  const params = useParams();
  const [reading, setReading] = useState<Reading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportText, setReportText] = useState("");
  const [status, setStatus] = useState("NEW");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }

    fetchReading();
  }, [router, params.id]);

  const fetchReading = async () => {
    try {
      const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}");
      const response = await fetch(`/api/admin/submissions/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${adminSession.id}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReading(data);
        setReportText(data.reportText || "");
        setStatus(data.status);
      } else if (response.status === 401) {
        router.push("/admin/login");
      } else {
        setMessage({ type: "error", text: "Failed to load reading" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error loading reading" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (sendEmail: boolean = false) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}");
      const response = await fetch(`/api/admin/submissions/${params.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminSession.id}`,
        },
        body: JSON.stringify({
          reportText,
          status: sendEmail ? "SENT" : status,
          sendEmail,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setReading(updated);
        setStatus(updated.status);
        setMessage({
          type: "success",
          text: sendEmail
            ? "Report saved and email sent successfully!"
            : "Report saved successfully!",
        });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.message || "Failed to save" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error saving report" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#4a4a5e]">Loading...</p>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#4a4a5e]">Reading not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-[#e0e0e0] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="text-sm text-[#4a4a5e] hover:text-[#1a1a2e] transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-xl font-serif font-semibold text-[#1a1a2e]">
              Edit Reading
            </h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reading Details */}
          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
            <h2 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-6">
              Customer Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Name</label>
                <p className="text-[#1a1a2e] font-medium">{reading.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Email</label>
                <p className="text-[#1a1a2e] font-medium">{reading.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Date of Birth</label>
                <p className="text-[#1a1a2e] font-medium">
                  {new Date(reading.dob).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Time of Birth</label>
                <p className="text-[#1a1a2e] font-medium">{reading.timeOfBirth}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Place of Birth</label>
                <p className="text-[#1a1a2e] font-medium">{reading.placeOfBirth}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Focus Area</label>
                <p className="text-[#1a1a2e] font-medium">{reading.focusArea}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              {reading.reportSentAt && (
                <div>
                  <label className="text-sm font-medium text-[#4a4a5e]">Report Sent At</label>
                  <p className="text-[#1a1a2e] font-medium">
                    {new Date(reading.reportSentAt).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-[#4a4a5e]">Delete At</label>
                <p className="text-[#1a1a2e] font-medium text-sm">
                  {new Date(reading.deleteAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Report Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
            <h2 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-6">
              Report Text
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4a4a5e] mb-2">
                  Write the personalised report here:
                </label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37] font-sans"
                  placeholder="Write the personalised birth chart reading here..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="flex-1 bg-[#1a1a2e] text-white px-6 py-3 rounded-md font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Report"}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSaving || !reportText.trim()}
                  className="flex-1 bg-[#d4af37] text-[#1a1a2e] px-6 py-3 rounded-md font-medium hover:bg-[#c4a027] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Sending..." : "Save & Send Email"}
                </button>
              </div>
              <p className="text-xs text-[#8a8a9e] mt-2">
                When you click "Save & Send Email", the status will be set to SENT and the report will be emailed to the customer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
