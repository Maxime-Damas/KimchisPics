import { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: number;
  url: string;
  category: string;
  sessionTitle: string;
}

const Portfolio = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState(['Toutes']);
  const [filter, setFilter] = useState('Toutes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const [photosRes, forfaitsRes] = await Promise.all([
          api.get('/public/portfolio'),
          api.get('/public/forfaits')
        ]);
        
        setPhotos(photosRes.data);
        
        const dynamicLabels = forfaitsRes.data.map((f: any) => f.label);
        setCategories(['Toutes', ...dynamicLabels]);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const filteredPhotos = filter === 'Toutes' 
    ? photos 
    : photos.filter(p => p.category === filter);

  return (
    <div className="px-6 md:px-12 py-12">
      <header className="mb-12">
        <h2 className="text-4xl font-bold uppercase tracking-tight mb-8">Portfolio</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1 text-sm border transition-colors ${
                filter === cat 
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100' 
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-photo bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={photo.id}
                className="group relative aspect-photo overflow-hidden bg-zinc-900"
              >
                <img 
                  src={photo.url} 
                  alt={photo.sessionTitle}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <p className="text-xs uppercase tracking-widest text-zinc-300 mb-1">{photo.category}</p>
                  <p className="font-bold text-lg">{photo.sessionTitle}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && filteredPhotos.length === 0 && (
        <div className="text-center py-24 text-zinc-500">
          Aucune photo disponible dans cette catégorie.
        </div>
      )}
    </div>
  );
};

export default Portfolio;
