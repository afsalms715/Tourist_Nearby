import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { getUserSavedPlaces, savePlaceToFirestore, removeSavedPlace } from '../api/firestore';
import { generateTravelPlan } from '../api/ai';
import { ArrowLeft, MapPin, MapIcon, Star, Bookmark, Navigation, Phone, Globe, Sparkles, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../App.css';

// Fix for default Leaflet marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PlaceDetails() {
  const { placeId } = useParams();
  const locationState = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [place, setPlace] = useState(locationState.state?.place || null);
  const [isSaved, setIsSaved] = useState(false);
  const [travelPlan, setTravelPlan] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    // If we reach here without a place in state, navigate back (or we could fetch it, but OSM IDs aren't persistent enough easily)
    if (!place) {
      navigate('/');
      return;
    }
    
    // Check if saved
    if (currentUser) {
      getUserSavedPlaces(currentUser.uid).then(places => {
        setIsSaved(places.some(p => p.placeId === place.id));
      }).catch(console.error);
    }
    
    // Generate AI Plan
    async function loadPlan() {
      setIsAiLoading(true);
      try {
        const plan = await generateTravelPlan(place);
        setTravelPlan(plan);
      } catch (error) {
        setTravelPlan("Could not generate travel plan at this time. Here's a generic tip: The best time to visit most outdoor spots is early morning or late afternoon!");
      } finally {
        setIsAiLoading(false);
      }
    }
    
    loadPlan();
    window.scrollTo(0, 0);
  }, [place, currentUser, navigate]);

  const handleSaveToggle = async () => {
    if (!currentUser) {
      alert("Please log in to save places to your list.");
      return;
    }
    try {
      if (isSaved) {
        await removeSavedPlace(currentUser.uid, place.id);
        setIsSaved(false);
      } else {
        await savePlaceToFirestore(currentUser.uid, place);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      alert("Error processing request. Please try again.");
    }
  };

  if (!place) return null;

  return (
    <div className="app-layout" style={{ background: 'var(--bg-color)', overflowY: 'auto' }}>
      <header className="app-header glass-panel border-b sticky top-0" style={{ zIndex: 1000 }}>
        <div className="header-content flex items-center gap-4 w-full max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <ArrowLeft size={24} className="text-dark" />
          </button>
          <div className="brand flex-1">
            <h1 className="text-xl font-bold truncate">{place.name}</h1>
          </div>
          <button 
            onClick={handleSaveToggle}
            className={`p-2 rounded-full transition ${isSaved ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500 hover:text-blue-500'}`}
          >
            <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
        
        {/* Left Column: Details & Plan */}
        <div className="lg:col-span-2 space-y-8 animate-fade-in">
          
          {/* Header Info Banner */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-dark mb-2">{place.name}</h1>
                <div className="flex items-center gap-3">
                  <span className={`category-badge bg-${place.category} text-sm`}>
                    {place.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500 font-semibold bg-yellow-50 px-2 py-0.5 rounded-md">
                    <Star size={16} fill="currentColor" />
                    {place.rating}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={20} className="mt-0.5 text-blue-500 shrink-0" />
                <span className="text-sm">{place.address}</span>
              </div>
              {place.distance && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Navigation size={20} className="text-blue-500 shrink-0" />
                  <span className="text-sm">{place.distance} km from your location</span>
                </div>
              )}
              {place.phone !== 'N/A' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={20} className="text-blue-500 shrink-0" />
                  <a href={`tel:${place.phone}`} className="text-sm hover:underline">{place.phone}</a>
                </div>
              )}
              {place.website && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe size={20} className="text-blue-500 shrink-0" />
                  <a href={place.website} target="_blank" rel="noreferrer" className="text-sm hover:underline truncate w-48">
                    {place.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* AI Travel Plan */}
          <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 text-blue-200 opacity-50">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-blue-800">
                <Sparkles size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold">AI Travel Plan</h2>
              </div>
              
              {isAiLoading ? (
                <div className="flex flex-col gap-3 py-4">
                  <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-blue-100 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-blue-100 rounded animate-pulse w-5/6"></div>
                  <p className="text-sm text-blue-500 mt-2 font-medium">Generating your curated experience...</p>
                </div>
              ) : (
                <div className="text-blue-900 prose prose-blue prose-sm sm:prose-base max-w-none">
                  <ReactMarkdown>{travelPlan}</ReactMarkdown>
                </div>
              )}
            </div>
          </section>
          
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="h-64 w-full bg-gray-100 relative">
              <MapContainer 
                center={[place.latitude, place.longitude]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[place.latitude, place.longitude]}>
                  <Popup>{place.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="p-4 bg-white">
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank')}
              >
                <MapIcon size={20} />
                Open Details in Google Maps
                <ExternalLink size={16} className="ml-1 opacity-75" />
              </button>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
