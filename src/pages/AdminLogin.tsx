import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Identifiants invalides');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <div className="w-full max-w-md bg-zinc-900/50 p-8 border border-zinc-800 rounded-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-center">Admin Panel</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full btn-primary py-3">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
