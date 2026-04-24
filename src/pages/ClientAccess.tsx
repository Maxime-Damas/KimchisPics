import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';
import { motion } from 'framer-motion';

const ClientAccess = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    
    // Secret code for admin redirection
    if (cleanCode === 'ADMIN2026') {
      navigate('/admin/login');
      return;
    }

    if (cleanCode) {
      navigate(`/client/${cleanCode}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900/50 p-8 border border-zinc-800 rounded-lg"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-950 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Accès Client</h2>
          <p className="text-zinc-500 text-sm mt-2">Entrez votre code d'accès pour voir vos photos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Code d'accès (ex: SEO-2026)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors uppercase tracking-widest text-center"
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary py-3">
            Accéder à la galerie
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ClientAccess;
