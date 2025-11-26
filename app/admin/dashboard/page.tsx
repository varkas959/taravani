"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AdminDashboard() {
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }

    // Check if password change is required
    const requiresPasswordChange = localStorage.getItem("requiresPasswordChange");
    if (requiresPasswordChange === "true") {
      setShowPasswordModal(true);
    }

    fetchReadings();
  }, [router, filter]);

  const fetchReadings = async () => {
    try {
      const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}");
      const url = filter === "all" 
        ? "/api/admin/submissions"
        : `/api/admin/submissions?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${adminSession.id}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReadings(data);
      } else if (response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem("adminSession");
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching readings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("requiresPasswordChange");
    router.push("/admin/login");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate passwords
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}");
      
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminSession.id}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the password change requirement flag
        localStorage.removeItem("requiresPasswordChange");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        alert("Password changed successfully!");
      } else {
        setPasswordError(data.message || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "SENT":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#4a4a5e]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-xl">
            <h2 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-4">
              Change Your Password
            </h2>
            <p className="text-[#4a4a5e] mb-6">
              For security reasons, please change your default password.
            </p>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 bg-[#1a1a2e] text-white px-6 py-3 rounded-md font-medium hover:bg-[#2a2a3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="border-b border-[#e0e0e0] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-serif font-semibold text-[#1a1a2e]">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-[#4a4a5e] hover:text-[#1a1a2e] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === "all"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white text-[#4a4a5e] hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("NEW")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === "NEW"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white text-[#4a4a5e] hover:bg-gray-50"
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilter("IN_PROGRESS")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === "IN_PROGRESS"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white text-[#4a4a5e] hover:bg-gray-50"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter("SENT")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === "SENT"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white text-[#4a4a5e] hover:bg-gray-50"
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter("FAILED")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === "FAILED"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white text-[#4a4a5e] hover:bg-gray-50"
            }`}
          >
            Failed
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e0e0e0]">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4a4a5e] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4a4a5e] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4a4a5e] uppercase tracking-wider">
                    Focus Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4a4a5e] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4a4a5e] uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4a4a5e] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e0e0e0]">
                {readings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#4a4a5e]">
                      No readings found
                    </td>
                  </tr>
                ) : (
                  readings.map((reading) => (
                    <tr key={reading.id} className="hover:bg-[#fafafa]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a1a2e]">
                        {reading.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4a4a5e]">
                        {reading.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4a4a5e]">
                        {reading.focusArea}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            reading.status
                          )}`}
                        >
                          {reading.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4a4a5e]">
                        {new Date(reading.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/submissions/${reading.id}`}
                          className="text-[#d4af37] hover:text-[#1a1a2e] font-medium"
                        >
                          View/Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
