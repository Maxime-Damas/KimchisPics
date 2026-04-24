import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import ContactForm from '../components/ContactForm';

interface FeaturedPhotos {
  [category: string]: {
    id: number;
    url: string;
    session: { title: string; category: string };
  }[];
}

const Home = () => {
  const [featured, setFeatured] = useState<FeaturedPhotos>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/public/featured');
        setFeatured(response.data);
      } catch (error) {
        console.error('Error fetching featured photos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6">
            Capturer <br /> L'Instant.
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto text-lg mb-12">
            Photographe professionnel spécialisé dans l'automobile, les portraits et les événements. Une approche sobre et élégante pour vos souvenirs les plus précieux.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/portfolio" className="btn-primary">
              Voir le Portfolio
            </Link>
            <Link to="/client" className="btn-secondary">
              Espace Client
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Featured Categories */}
      <div className="px-6 md:px-12 space-y-24">
        {loading ? (
          <div className="text-center text-zinc-500">Chargement des catégories...</div>
        ) : (
          Object.entries(featured).map(([category, photos]) => (
            <section key={category}>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">{category}</h2>
                <Link to={`/portfolio`} className="text-zinc-500 hover:text-zinc-100 text-sm uppercase tracking-widest transition-colors">
                  Voir tout
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <motion.div 
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    key={photo.id}
                    className="aspect-photo bg-zinc-900 overflow-hidden group"
                  >
                    <img 
                      src={photo.url} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-zinc-800/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[120px]" />
      </div>

      <ContactForm />
    </div>
  );
};

export default Home;
