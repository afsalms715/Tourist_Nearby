import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchNearbyPlaces } from '../api/overpass';
import { useAuth } from '../context/AuthContext';
import { getUserSavedPlaces } from '../api/firestore';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import PlaceList from '../components/PlaceList';
import CategoryFilter from '../components/CategoryFilter';
import { Compass, Map as MapIcon, RefreshCw, AlertCircle, LogIn, User, LogOut, List as ListIcon } from 'lucide-react';
import '../App.css';

export default function Discover() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState('all');
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Mobile view toggle state (Map / List)
  const [mobileView, setMobileView] = useState('map');
  const [savedPlaceIds, setSavedPlaceIds] = useState(new Set());

  const loadPlaces = async () => {
    if (!location) return;
    setPlacesLoading(true);
    setPlacesError(null);
    setSelectedPlaceId(null);
    try {
      const data = await fetchNearbyPlaces(location.latitude, location.longitude, 3000, category);
      setPlaces(data);
    } catch (err) {
      setPlacesError('Failed to discover nearby places. Please try again.');
    } finally {
      setPlacesLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      loadPlaces();
    }
  }, [location, category]);

  const handlePlaceSelect = (id) => {
    setSelectedPlaceId(id === selectedPlaceId ? null : id);
    if (id !== selectedPlaceId) {
      const element = document.getElementById(`place-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  async function handleLogout() {
    try {
      await logout();
    } catch {
      alert("Failed to log out");
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch saved places for current user
  useEffect(() => {
    if (currentUser) {
      getUserSavedPlaces(currentUser.uid).then(places => {
        const ids = new Set(places.map(p => p.placeId));
        setSavedPlaceIds(ids);
      }).catch(err => console.error("Error fetching saved places:", err));
    } else {
      setSavedPlaceIds(new Set());
    }
  }, [currentUser]);

  if (geoLoading) {
    return (
      <div className="full-screen-center">
        <div className="pulse-ring"></div>
        <h2>Locating you...</h2>
        <p className="text-light">Discovering nearby wonders</p>
      </div>
    );
  }

  if (geoError && !location) {
    return (
      <div className="full-screen-center error">
        <AlertCircle size={48} className="text-red mb-4" />
        <h2>Location Access Needed</h2>
        <p>{geoError}</p>
        <p className="text-light mt-2 max-w-sm text-center">
          We need your location to find nearby tourist attractions, hotels, and resorts. Please enable location services in your browser settings and refresh.
        </p>
        <button className="btn-primary mt-6" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header glass-panel">
        <div className="header-content flex justify-between items-center w-full">
          <div className="brand flex items-center gap-2">
            <Compass className="brand-icon" size={28} />
            <h1 className="text-xl font-bold">Tourist Nearby</h1>
            {placesLoading && <RefreshCw size={18} className="spinner text-light ml-2" />}
          </div>
          
          <div className="user-nav flex items-center gap-4">
            {currentUser ? (
              <>
                <Link to="/mylist" className="flex items-center gap-1 text-sm font-semibold text-dark hover:text-blue-500 transition">
                  <ListIcon size={18} />
                  <span className="hidden sm:inline">My List</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700 transition">
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-700 transition">
                <LogIn size={18} />
                <span>Log In</span>
              </Link>
            )}
          </div>
        </div>
        
        <CategoryFilter currentCategory={category} onCategoryChange={setCategory} />
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <aside className={`sidebar ${mobileView === 'list' ? 'mobile-active' : ''}`}>
          <div className="sidebar-header desktop-only">
            <h2>Discovered places</h2>
            <span className="places-count">{places.length} found</span>
          </div>
          <PlaceList 
            places={places} 
            loading={placesLoading} 
            error={placesError}
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={handlePlaceSelect}
            savedPlaceIds={savedPlaceIds}
            setSavedPlaceIds={setSavedPlaceIds}
          />
        </aside>

        <section className={`map-section ${mobileView === 'map' ? 'mobile-active' : ''}`}>
          <MapView 
            userLocation={location} 
            places={places} 
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={handlePlaceSelect}
          />
        </section>
      </main>

      <div className="mobile-fab-container">
        <button className="fab" onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}>
          {mobileView === 'map' ? (
            <>
              <Compass size={20} />
              <span>List View</span>
            </>
          ) : (
            <>
              <MapIcon size={20} />
              <span>Map View</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
