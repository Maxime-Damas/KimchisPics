import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Download, ChevronLeft } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Session {
  id: number;
  title: string;
  category: string;
  photos: {
    id: number;
    url: string;
  }[];
}

const ClientGallery = () => {
  const { code } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/public/client/${code}`);
        setSession(response.data);
      } catch (err: any) {
        setError(err.response?.status === 404 ? 'Code invalide' : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [code]);

  const downloadAllPhotos = async () => {
    if (!session || session.photos.length === 0) return;
    
    setDownloading(true);
    const zip = new JSZip();
    const folder = zip.folder(session.title);

    try {
      const downloadPromises = session.photos.map(async (photo, index) => {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        // Get extension from URL or default to jpg
        const extension = photo.url.split('.').pop()?.split('?')[0] || 'jpg';
        folder?.file(`photo-${index + 1}.${extension}`, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${session.title}.zip`);
    } catch (err) {
      console.error('Error creating ZIP:', err);
      alert('Une erreur est survenue lors du téléchargement groupé.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Chargement de votre galerie...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <p className="text-xl font-bold mb-4">{error}</p>
      <Link to="/client" className="btn-secondary">Retour à l'accès client</Link>
    </div>
  );

  return (
    <div className="px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <Link to="/client" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
          <h2 className="text-4xl font-bold uppercase tracking-tight">{session?.title}</h2>
          <p className="text-zinc-500 uppercase tracking-widest text-sm mt-2">{session?.category}</p>
        </div>

        <button 
          onClick={downloadAllPhotos}
          disabled={downloading}
          className="btn-primary flex items-center justify-center gap-3 py-4 px-8 self-start md:self-center disabled:opacity-50"
        >
          {downloading ? (
            'Préparation du ZIP...'
          ) : (
            <>
              Tout télécharger (.ZIP)
              <Download className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {session?.photos.map((photo) => (
          <div key={photo.id} className="group relative bg-zinc-900 overflow-hidden rounded-sm aspect-photo flex items-center justify-center">
            <img 
              src={photo.url} 
              alt="" 
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <a 
              href={photo.url} 
              download 
              target="_blank"
              rel="noreferrer"
              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientGallery;
