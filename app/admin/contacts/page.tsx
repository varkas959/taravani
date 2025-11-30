"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }

    fetchContacts();
  }, [router, filter]);

  const fetchContacts = async () => {
    try {
      const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}");
      const readParam = filter === "all" ? null : filter === "read" ? "true" : "false";
      const url = readParam ? `/api/admin/contacts?read=${readParam}` : "/api/admin/contacts";
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${adminSession.id}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else if (response.status === 401) {
        localStorage.removeItem("adminSession");
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReadStatus = async (contactId: string, currentRead: boolean) => {
    try {
      const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}");
      const response = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminSession.id}`,
        },
        body: JSON.stringify({
          id: contactId,
          read: !currentRead,
        }),
      });

      if (response.ok) {
        // Update local state
        setContacts(contacts.map(contact => 
          contact.id === contactId ? { ...contact, read: !currentRead } : contact
        ));
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("requiresPasswordChange");
    router.push("/admin/login");
  };

  const unreadCount = contacts.filter(c => !c.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[#4a4a5e]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-[#e0e0e0] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-sm text-[#4a4a5e] hover:text-[#1a1a2e] transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-serif font-semibold text-[#1a1a2e]">
                Contact Messages
              </h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
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
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === "unread"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white text-[#4a4a5e] hover:bg-gray-50"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === "read"
                ? "bg-[#1a1a2e] text-white"
                : "bg-white text-[#4a4a5e] hover:bg-gray-50"
            }`}
          >
            Read
          </button>
        </div>

        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-8 text-center">
              <p className="text-[#4a4a5e]">No contact messages found</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`bg-white rounded-lg shadow-sm border ${
                  contact.read ? "border-[#e0e0e0]" : "border-[#6366f1] border-l-4"
                } p-6`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#1a1a2e]">
                        {contact.name}
                      </h3>
                      {!contact.read && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#4a4a5e] mb-1">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-[#6366f1] hover:underline"
                      >
                        {contact.email}
                      </a>
                    </p>
                    <p className="text-xs text-[#8a8a9e]">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleReadStatus(contact.id, contact.read)}
                    className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                      contact.read
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-[#6366f1] text-white hover:bg-[#4f46e5]"
                    }`}
                  >
                    {contact.read ? "Mark as Unread" : "Mark as Read"}
                  </button>
                </div>
                <div className="bg-[#f8f9fa] rounded-md p-4">
                  <p className="text-[#1a1a2e] whitespace-pre-line">{contact.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

