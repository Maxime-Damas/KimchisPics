import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface Price {
  nb_photos: string;
  price: string;
}

interface Forfait {
  id?: number;
  label: string;
  prices: Price[];
}

const AdminForfaits = () => {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [label, setLabel] = useState('');
  const [prices, setPrices] = useState<Price[]>([
    { nb_photos: '5', price: '' },
    { nb_photos: '10', price: '' },
    { nb_photos: '15', price: '' },
    { nb_photos: 'sur_mesure', price: 'Sur devis' }
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchForfaits();
  }, []);

  const fetchForfaits = async () => {
    try {
      const response = await api.get('/admin/forfaits');
      setForfaits(response.data);
    } catch (error) {
      console.error('Error fetching forfaits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/forfaits/${editingId}`, { label, prices });
      } else {
        await api.post('/admin/forfaits', { label, prices });
      }
      setShowModal(false);
      resetForm();
      fetchForfaits();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (forfait: Forfait) => {
    setEditingId(forfait.id!);
    setLabel(forfait.label);
    setPrices(forfait.prices);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce forfait ?')) return;
    try {
      await api.delete(`/admin/forfaits/${id}`);
      fetchForfaits();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setLabel('');
    setPrices([
      { nb_photos: '5', price: '' },
      { nb_photos: '10', price: '' },
      { nb_photos: '15', price: '' },
      { nb_photos: 'sur_mesure', price: 'Sur devis' }
    ]);
    setEditingId(null);
  };

  const updatePrice = (index: number, value: string) => {
    const newPrices = [...prices];
    newPrices[index].price = value;
    setPrices(newPrices);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold uppercase tracking-tight">Gestion des Forfaits</h3>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2 py-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter un forfait
        </button>
      </div>

      {loading ? (
        <p className="text-zinc-500">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forfaits.map((forfait) => (
            <div key={forfait.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-black uppercase tracking-tight text-white">{forfait.label}</h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(forfait)} className="p-2 hover:bg-zinc-800 rounded transition-colors">
                    <Save className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button onClick={() => handleDelete(forfait.id!)} className="p-2 hover:bg-zinc-800 rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {forfait.prices.map((p, i) => (
                  <div key={i} className="flex justify-between bg-zinc-950 p-2 border border-zinc-900">
                    <span className="text-zinc-500 uppercase tracking-widest text-[10px]">{p.nb_photos === 'sur_mesure' ? 'Sur mesure' : `${p.nb_photos} Ph.`}</span>
                    <span className="font-bold">{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold uppercase tracking-tight">{editingId ? 'Modifier' : 'Nouveau'} Forfait</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Nom du forfait (ex: Solo)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500">Tarification</label>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest italic">Laissez vide pour masquer l'option</span>
                </div>
                {prices.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-24 text-xs uppercase tracking-widest text-zinc-400">
                      {p.nb_photos === 'sur_mesure' ? 'Sur mesure' : `${p.nb_photos} Photos`}
                    </span>
                    <input
                      type="text"
                      value={p.price}
                      onChange={(e) => updatePrice(i, e.target.value)}
                      placeholder="Ex: 50€ (ou vide)"
                      className="flex-grow bg-zinc-950 border border-zinc-800 p-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full btn-primary py-4 mt-4">
                Enregistrer le forfait
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForfaits;
