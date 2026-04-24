import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import ClientAccess from './pages/ClientAccess';
import ClientGallery from './pages/ClientGallery';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/client" element={<ClientAccess />} />
            <Route path="/client/:code" element={<ClientGallery />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <footer className="py-8 border-t border-zinc-900 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Kimchi Photographe. Tous droits réservés.
        </footer>
      </div>
    </Router>
  );
}

export default App;
