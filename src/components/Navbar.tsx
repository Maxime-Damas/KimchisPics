import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b border-zinc-900 py-4 px-6 md:px-12 flex justify-between items-center bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 group">
        <Camera className="w-6 h-6 group-hover:text-zinc-400 transition-colors" />
        <span className="font-bold text-xl tracking-tighter uppercase">Kimchi</span>
      </Link>
      <div className="flex gap-8 items-center text-sm font-medium tracking-wide">
        <Link to="/portfolio" className="hover:text-zinc-400 transition-colors uppercase">Portfolio</Link>
        <Link to="/client" className="hover:text-zinc-400 transition-colors uppercase">Accès Client</Link>
        <Link to="/admin/dashboard" className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded-full hover:bg-zinc-900 transition-colors">
          <span className="text-[10px]">AD</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
