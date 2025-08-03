import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface User {
  id: string;
  username: string;
}

async function fetchCurrentUser(): Promise<User> {
  const response = await fetch("/api/admin/me");
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
}

async function logoutUser() {
  const response = await fetch("/api/admin/logout", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
  return response.json();
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences' | 'education' | 'case-studies'>('profile');

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    setLocation("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-apercu texture-overlay">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-baron text-2xl tracking-wider">ADMIN DASHBOARD</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={() => logoutMutation.mutate()}
                className="text-sollo-red hover:text-sollo-red/80 font-medium"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'profile'
                ? 'bg-white border-sollo-red text-sollo-red'
                : 'bg-white border-gray-200 hover:border-sollo-red hover:text-sollo-red'
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('experiences')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'experiences'
                ? 'bg-white border-sollo-gold text-sollo-gold'
                : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
            }`}
          >
            Manage Experiences
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'education'
                ? 'bg-white border-sollo-gold text-sollo-gold'
                : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
            }`}
          >
            Manage Education
          </button>
          <button
            onClick={() => setActiveTab('case-studies')}
            className={`px-6 py-3 font-medium transition-colors border ${
              activeTab === 'case-studies'
                ? 'bg-white border-sollo-gold text-sollo-gold'
                : 'bg-white border-gray-200 hover:border-sollo-gold hover:text-sollo-gold'
            }`}
          >
            Manage Case Studies
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 p-8">
          {activeTab === 'profile' && (
            <div>
              <h2 className="font-baron text-xl tracking-wide mb-6">PROFILE SETTINGS</h2>
              <p className="text-gray-600">Profile management functionality coming soon...</p>
            </div>
          )}

          {activeTab === 'experiences' && (
            <div>
              <h2 className="font-baron text-xl tracking-wide mb-6">MANAGE EXPERIENCES</h2>
              <p className="text-gray-600">Experience management functionality coming soon...</p>
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <h2 className="font-baron text-xl tracking-wide mb-6">MANAGE EDUCATION</h2>
              <p className="text-gray-600">Education management functionality coming soon...</p>
            </div>
          )}

          {activeTab === 'case-studies' && (
            <div>
              <h2 className="font-baron text-xl tracking-wide mb-6">MANAGE CASE STUDIES</h2>
              <p className="text-gray-600">Case study management functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}