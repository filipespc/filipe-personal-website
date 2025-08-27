import { useQuery } from "@tanstack/react-query";
import { Profile } from "@shared/schema";
import { FiGithub, FiLinkedin } from "react-icons/fi";

async function fetchProfile() {
  const response = await fetch("/api/profile");
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return response.json() as Promise<Profile>;
}

export default function HeroSection() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  if (isLoading) {
    return (
      <section className="pt-28 pb-18 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-16 md:h-24 lg:h-28 bg-gray-200 rounded mb-8 mx-auto max-w-2xl"></div>
              <div className="w-24 h-1 bg-gray-200 mx-auto mb-8"></div>
              <div className="space-y-3 max-w-3xl mx-auto">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-4/5 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-3/5 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-0 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-baron text-4xl md:text-6xl lg:text-7xl tracking-wider mb-8 leading-none">
            {profile?.name?.toUpperCase()}
          </h1>
          <div className="w-24 h-1 bg-sollo-gold mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto mb-8">
            {profile?.briefIntro}
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/filipespc"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-800 bg-gray-800 hover:bg-black hover:border-black transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="GitHub Profile"
            >
              <FiGithub className="w-5 h-5 text-white transition-colors duration-300" />
            </a>
            <a
              href="https://www.linkedin.com/in/filipespcarneiro/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 rounded-lg border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="LinkedIn Profile"
            >
              <FiLinkedin className="w-5 h-5 text-white transition-colors duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}