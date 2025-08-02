import { useQuery } from "@tanstack/react-query";

async function fetchHealthCheck() {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}

export default function Portfolio() {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealthCheck,
  });

  return (
    <div className="min-h-screen bg-white texture-overlay">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <h1 className="font-baron text-4xl md:text-6xl text-gray-900 mb-4">
            FILIPE CARNEIRO
          </h1>
          <p className="font-apercu text-lg text-gray-600 max-w-2xl mx-auto">
            Portfolio under construction. We're building something great!
          </p>
        </header>
        
        <section className="text-center">
          <h2 className="font-baron text-2xl text-gray-800 mb-6">
            System Status
          </h2>
          
          {isLoading && (
            <div className="text-gray-500">Checking system status...</div>
          )}
          
          {error && (
            <div className="text-red-600">
              ⚠️ System check failed. Please try again later.
            </div>
          )}
          
          {health && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-green-800 font-semibold mb-2">
                ✅ System Online
              </div>
              <div className="text-sm text-green-600 space-y-1">
                <div>Environment: {health.environment}</div>
                <div>Status: {health.status}</div>
                <div>Last check: {new Date(health.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}