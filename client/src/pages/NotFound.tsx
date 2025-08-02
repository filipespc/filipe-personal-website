import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-baron text-6xl text-gray-900 mb-4">404</h1>
        <p className="font-apercu text-xl text-gray-600 mb-8">
          Page not found
        </p>
        <Link href="/" className="text-sollo-red hover:text-sollo-gold transition-colors">
          Go back home
        </Link>
      </div>
    </div>
  );
}