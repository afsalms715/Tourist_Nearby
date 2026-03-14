import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserSavedPlaces, removeSavedPlace } from '../api/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Trash2, MapPin, Navigation, Star, Map as MapIcon, ArrowLeft } from 'lucide-react';
import '../App.css';

export default function MyList() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    async function fetchList() {
      try {
        const places = await getUserSavedPlaces(currentUser.uid);
        setSavedPlaces(places);
      } catch (error) {
        console.error("Error fetching saved places:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, [currentUser, navigate]);

  const handleRemove = async (placeId) => {
    if (!currentUser) return;
    try {
      await removeSavedPlace(currentUser.uid, placeId);
      // Optimistically update UI
      setSavedPlaces(prev => prev.filter(p => p.placeId !== placeId));
    } catch (error) {
      alert("Failed to remove place. Please try again.");
    }
  };

  if (!currentUser) return null; // Wait for redirect

  return (
    <div className="app-layout" style={{ background: 'var(--bg-color)', overflowY: 'auto' }}>
      <header className="app-header glass-panel border-b sticky top-0">
        <div className="header-content flex justify-between items-center w-full max-w-4xl mx-auto">
          <div className="brand flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <ArrowLeft size={24} className="text-dark" />
            </Link>
            <div className="flex items-center gap-2">
              <Compass className="brand-icon" size={28} />
              <h1 className="text-xl font-bold">My List</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="pulse-ring"></div>
          </div>
        ) : savedPlaces.length === 0 ? (
          <div className="list-empty animate-fade-in mt-20">
            <div className="empty-icon-wrap">
              <Compass size={32} opacity={0.4} />
            </div>
            <h3>No saved places yet</h3>
            <p>Go to the discovery map to find and save places.</p>
            <Link to="/" className="btn-primary mt-6 inline-block">Explore Nearby</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {savedPlaces.map((place) => (
              <div key={place.documentId} className="place-card flex flex-col justify-between">
                <div>
                  <div className="card-header">
                    <h3 className="place-name">{place.placeName}</h3>
                    <span className={`category-badge bg-${place.category}`}>
                      {place.category}
                    </span>
                  </div>

                  <div className="card-meta">
                    <div className="meta-item rating">
                      <Star size={14} fill="currentColor" />
                      <span>{place.rating}</span>
                    </div>
                  </div>

                  <p className="place-address truncate-text mb-4">{place.address}</p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-md font-medium hover:bg-blue-100 transition"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank')}
                  >
                    <MapIcon size={16} />
                    Map
                  </button>
                  <button 
                    className="flex items-center justify-center p-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition"
                    onClick={() => handleRemove(place.placeId)}
                    title="Remove from My List"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
