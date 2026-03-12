import { useState, useEffect } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { fetchNearbyPlaces } from './api/overpass';
import MapView from './components/MapView';
import PlaceList from './components/PlaceList';
import CategoryFilter from './components/CategoryFilter';
import { Compass, Map as MapIcon, RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState('all');
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  // Mobile view toggle state (Map / List)
  const [mobileView, setMobileView] = useState('map'); // 'map' or 'list'

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
    setSelectedPlaceId(id === selectedPlaceId ? null : id); // Toggle selection
    
    if (id !== selectedPlaceId) {
      // Scroll to the item in the list if selected from map
      const element = document.getElementById(`place-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Ensure scroll top on initial load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <div className="header-content">
          <div className="brand">
            <Compass className="brand-icon" size={28} />
            <h1>Tourist Nearby</h1>
          </div>
          
          {placesLoading && <RefreshCw size={20} className="spinner text-light" />}
        </div>
        
        <CategoryFilter 
          currentCategory={category} 
          onCategoryChange={setCategory} 
        />
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Desktop Sidebar / Mobile Bottom Sheet */}
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
          />
        </aside>

        {/* Map Area */}
        <section className={`map-section ${mobileView === 'map' ? 'mobile-active' : ''}`}>
          <MapView 
            userLocation={location} 
            places={places} 
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={handlePlaceSelect}
          />
        </section>
      </main>

      {/* Mobile Floating Action Button (FAB) toggles Map/List */}
      <div className="mobile-fab-container">
        <button 
          className="fab"
          onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
        >
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

export default App;
