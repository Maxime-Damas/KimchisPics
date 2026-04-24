import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import api from '../api';

interface Forfait {
  id: number;
  label: string;
  prices: Record<string, string>;
}

const ContactForm = () => {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    forfait: '',
    nbPhotos: '10',
    message: '',
  });

  useEffect(() => {
    const fetchForfaits = async () => {
      try {
        const response = await api.get('/public/forfaits');
        setForfaits(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, forfait: response.data[0].id.toString() }));
        }
      } catch (error) {
        console.error('Error fetching forfaits:', error);
      }
    };
    fetchForfaits();
  }, []);

  const [submitted, setSubmitted] = useState(false);

  const selectedForfait = forfaits.find(f => f.id.toString() === formData.forfait);
  const availablePhotoCounts = selectedForfait ? Object.keys(selectedForfait.prices).filter(count => selectedForfait.prices[count] && selectedForfait.prices[count].trim() !== '') : [];

  useEffect(() => {
    if (selectedForfait && !availablePhotoCounts.includes(formData.nbPhotos) && availablePhotoCounts.length > 0) {
      setFormData(prev => ({ ...prev, nbPhotos: availablePhotoCounts[0] }));
    }
  }, [formData.forfait, forfaits]);

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Check if it starts with 555
    if (digits.startsWith('555')) {
      if (digits.length > 3) {
        return `555-${digits.slice(3, 8)}`;
      }
      return '555';
    }
    return digits.slice(0, 8);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'telephone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const forfaitLabel = forfaits.find(f => f.id.toString() === formData.forfait)?.label || formData.forfait;
      await api.post('/public/contact', {
        ...formData,
        forfait: forfaitLabel
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert('Une erreur est survenue lors de l\'envoi de votre demande.');
    }
  };

  return (
    <section className="px-6 md:px-12 py-24 border-t border-zinc-900 bg-zinc-950/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">
              Réserver <br /> <span className="text-zinc-500">Votre Séance.</span>
            </h2>
            <p className="text-zinc-400 text-sm uppercase tracking-widest leading-relaxed">
              Prêt à créer des souvenirs ? Remplissez le formulaire et je vous recontacterai rapidement.
            </p>
          </div>

          <div className="md:w-2/3">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-lg flex flex-col items-center text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-zinc-100 mb-6" />
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Message Envoyé !</h3>
                <p className="text-zinc-500">Merci {formData.prenom}, je vous recontacte très prochainement au {formData.telephone}.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      placeholder="Jacks"
                      className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      placeholder="Jackson"
                      className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Téléphone (Format 555xxxxx)</label>
                    <input
                      type="text"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                      placeholder="555-85749"
                      className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors rounded-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Forfait souhaité</label>
                    <select
                      name="forfait"
                      value={formData.forfait}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors rounded-none appearance-none"
                    >
                      {forfaits.map(f => (
                        <option key={f.id} value={f.id.toString()} className="bg-zinc-900">{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Nombre de photos</label>
                    <select
                      name="nbPhotos"
                      value={formData.nbPhotos}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors rounded-none appearance-none"
                    >
                      {availablePhotoCounts.map(count => (
                        <option key={count} value={count} className="bg-zinc-900">
                          {count === 'sur_mesure' ? 'Sur mesure' : `${count} Photos`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 p-6 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Estimation du forfait</span>
                    <span className="text-xl font-bold uppercase tracking-tight">
                      {forfaits.find(f => f.id.toString() === formData.forfait)?.label} — {formData.nbPhotos === 'sur_mesure' ? 'Sur mesure' : `${formData.nbPhotos} Photos`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Prix</span>
                    <span className="text-3xl font-black text-white">
                      {forfaits.find(f => f.id.toString() === formData.forfait)?.prices[formData.nbPhotos] || '—'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Message (Optionnel)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Dites-m'en plus sur votre projet..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors rounded-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-100 text-zinc-950 py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all flex items-center justify-center gap-3 group"
                >
                  Envoyer la demande
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
