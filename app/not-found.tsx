import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a24] to-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-[#a1a1aa] mb-4">Could not find requested resource</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-[#00A3FF] to-[#00E5B0] text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
