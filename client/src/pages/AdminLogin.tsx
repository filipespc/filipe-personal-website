import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface SetupData {
  username: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

async function setupAdmin(data: SetupData) {
  const response = await fetch("/api/admin/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Setup failed");
  }
  
  return response.json();
}

async function loginAdmin(data: LoginData) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }
  
  return response.json();
}

export default function AdminLogin() {
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const setupMutation = useMutation({
    mutationFn: setupAdmin,
    onSuccess: () => {
      alert("Admin user created successfully! You can now login.");
      setIsSetupMode(false);
      setUsername("");
      setPassword("");
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => {
      alert("Login successful!");
      // Here you would typically redirect to admin dashboard
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    if (isSetupMode) {
      setupMutation.mutate({ username, password });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-baron text-gray-900">
            {isSetupMode ? "Setup Admin User" : "Admin Login"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSetupMode 
              ? "Create your first admin account" 
              : "Sign in to manage your portfolio"
            }
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={setupMutation.isPending || loginMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {setupMutation.isPending || loginMutation.isPending ? (
                "Processing..."
              ) : isSetupMode ? (
                "Create Admin User"
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSetupMode(!isSetupMode)}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {isSetupMode 
                ? "Already have an account? Sign in" 
                : "First time? Setup admin user"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}