import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Trash2, LogOut, Camera, X, Globe, Lock, LayoutGrid, Settings2, Inbox } from 'lucide-react';
import AdminForfaits from '../components/AdminForfaits';
import AdminContacts from '../components/AdminContacts';

interface Session {
  id: number;
  title: string;
  category: string;
  accessCode: string;
  createdAt: string;
  photos: any[];
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'forfaits' | 'contacts'>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [forfaits, setForfaits] = useState<{id: number, label: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    Promise.all([fetchSessions(), fetchForfaits()]);
  }, [navigate]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      localStorage.removeItem('token');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchForfaits = async () => {
    try {
      const response = await api.get('/admin/forfaits');
      setForfaits(response.data);
      if (response.data.length > 0 && !category) {
        setCategory(response.data[0].label);
      }
    } catch (error) {
      console.error('Error fetching forfaits:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photos) return alert('Veuillez sélectionner au moins une photo');

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('accessCode', accessCode);
    formData.append('isPublic', String(isPublic));
    Array.from(photos).forEach(photo => {
      formData.append('photos', photo);
    });

    try {
      await api.post('/sessions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      resetForm();
      fetchSessions();
    } catch (error) {
      alert('Erreur lors de la création de la séance');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Solo');
    setAccessCode('');
    setIsPublic(false);
    setPhotos(null);
  };

  return (
    <div className="px-6 md:px-12 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-bold uppercase tracking-tight">Dashboard</h2>
          <p className="text-zinc-500 text-sm mt-1">Gérer vos séances, photos et forfaits</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-zinc-900 mb-12">
        <button 
          onClick={() => setActiveTab('sessions')}
          className={`pb-4 px-2 flex items-center gap-2 uppercase tracking-widest text-xs font-bold transition-all ${activeTab === 'sessions' ? 'border-b-2 border-zinc-100 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <LayoutGrid className="w-4 h-4" /> Séances
        </button>
        <button 
          onClick={() => setActiveTab('forfaits')}
          className={`pb-4 px-2 flex items-center gap-2 uppercase tracking-widest text-xs font-bold transition-all ${activeTab === 'forfaits' ? 'border-b-2 border-zinc-100 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Settings2 className="w-4 h-4" /> Forfaits & Prix
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`pb-4 px-2 flex items-center gap-2 uppercase tracking-widest text-xs font-bold transition-all ${activeTab === 'contacts' ? 'border-b-2 border-zinc-100 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Inbox className="w-4 h-4" /> Messages
        </button>
      </div>

      {activeTab === 'sessions' ? (
        <>
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouvelle Séance
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-24 text-zinc-500">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
                    <th className="py-4 font-medium">Titre</th>
                    <th className="py-4 font-medium">Catégorie</th>
                    <th className="py-4 font-medium">Code</th>
                    <th className="py-4 font-medium">Statut</th>
                    <th className="py-4 font-medium">Photos</th>
                    <th className="py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-4 font-bold">{session.title}</td>
                      <td className="py-4 text-zinc-400">{session.category}</td>
                      <td className="py-4"><code className="bg-zinc-900 px-2 py-1 rounded text-zinc-300 text-xs">{session.accessCode}</code></td>
                      <td className="py-4">
                        {session.photos.some(p => p.isPublic) ? (
                          <span className="flex items-center gap-1 text-green-500 text-xs uppercase font-bold">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-zinc-600 text-xs uppercase font-bold">
                            <Lock className="w-3 h-3" /> Privé
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-zinc-400">{session.photos.length}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDelete(session.id)}
                          className="text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sessions.length === 0 && (
                <div className="text-center py-24 text-zinc-500 bg-zinc-900/10 mt-4 rounded">
                  Aucune séance créée pour le moment.
                </div>
              )}
            </div>
          )}
        </>
      ) : activeTab === 'forfaits' ? (
        <AdminForfaits />
      ) : (
        <AdminContacts />
      )}

      {/* Modal Création */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold uppercase tracking-tight">Nouvelle Séance</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Titre de la séance</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
                    placeholder="Ex: Mariage de Sarah & Tom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:outline-none"
                  >
                    {forfaits.map(f => <option key={f.id} value={f.label}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Code d'accès</label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:outline-none uppercase"
                    placeholder="Ex: MARIAGE24"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-4 rounded cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-0"
                />
                <div>
                  <label className="block text-sm font-bold cursor-pointer">Rendre cette séance publique</label>
                  <p className="text-xs text-zinc-500">Les photos apparaîtront dans le portfolio et sur l'accueil.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Photos</label>
                <div className="relative border-2 border-dashed border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center hover:border-zinc-600 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setPhotos(e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Camera className="w-10 h-10 text-zinc-700 mb-4" />
                  <p className="text-zinc-400 text-sm">{photos ? `${photos.length} photos sélectionnées` : 'Cliquez ou glissez vos photos ici'}</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Création en cours...' : 'Créer la Séance'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
