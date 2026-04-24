import { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, Mail, Phone, Calendar, MessageSquare, Package } from 'lucide-react';

interface ContactRequest {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  forfait: string;
  nb_photos: string;
  message: string;
  created_at: string;
}

const AdminContacts = () => {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/admin/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette demande de contact ?')) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold uppercase tracking-tight">Demandes de Contact</h3>
        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          {contacts.length} Demandes
        </span>
      </div>

      {loading ? (
        <div className="text-center py-24 text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Chargement des messages...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg group hover:border-zinc-700 transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-2">
                    <Calendar className="w-3 h-3" /> {formatDate(contact.created_at)}
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">
                    {contact.prenom} {contact.nom}
                  </h4>
                  <div className="flex items-center gap-4 pt-2">
                    <a href={`tel:${contact.telephone}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-mono">
                      <Phone className="w-4 h-4" /> {contact.telephone}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3">
                  <div className="flex gap-2">
                    <div className="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" /> {contact.forfait}
                    </div>
                    <div className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      {contact.nb_photos === 'sur_mesure' ? 'Sur mesure' : `${contact.nb_photos} Photos`}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(contact.id)}
                    className="md:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-600 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {contact.message && (
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded relative">
                  <MessageSquare className="w-4 h-4 text-zinc-800 absolute top-4 right-4" />
                  <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {contact.message}
                  </p>
                </div>
              )}
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed border-zinc-900 rounded-lg text-zinc-600 uppercase tracking-widest font-bold text-sm">
              Aucune demande pour le moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
