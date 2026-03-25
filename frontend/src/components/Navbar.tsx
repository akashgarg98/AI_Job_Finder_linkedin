import { Briefcase } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
        <Briefcase className="text-blue-500" />
        Job<span className="text-blue-500">Finder</span>
      </div>
    </nav>
  );
}
