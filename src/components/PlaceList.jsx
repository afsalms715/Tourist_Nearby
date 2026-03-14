import { MapPin, Navigation, Star, Phone, Globe, ExternalLink, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { savePlaceToFirestore, removeSavedPlace } from '../api/firestore';
import { useNavigate } from 'react-router-dom';

export default function PlaceList({ places, loading, error, selectedPlaceId, onPlaceSelect, savedPlaceIds, setSavedPlaceIds }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSaveToggle = async (e, place) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Please log in to save places to your list.");
      return;
    }
    
    const isSaved = savedPlaceIds.has(place.id);

    try {
      if (isSaved) {
        await removeSavedPlace(currentUser.uid, place.id);
        setSavedPlaceIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(place.id);
          return newSet;
        });
      } else {
        await savePlaceToFirestore(currentUser.uid, place);
        setSavedPlaceIds(prev => new Set(prev).add(place.id));
      }
    } catch (err) {
      console.error("Error saving/removing place:", err);
      alert("Error processing request. Please try again.");
    }
  };

  const handleCardClick = (place) => {
    if (place.id === selectedPlaceId) {
      // If already selected, navigate to details
      navigate(`/place/${place.id}`, { state: { place } });
    } else {
      // Otherwise just select it to expand small details on map
      onPlaceSelect(place.id);
    }
  };
  if (loading) {
    return (
      <div className="list-loading animate-fade-in">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-error animate-fade-in">
        <p>Something went wrong:</p>
        <span className="error-text">{error.message || error}</span>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="list-empty animate-fade-in">
        <div className="empty-icon-wrap">
          <MapPin size={32} opacity={0.4} />
        </div>
        <h3>No places found</h3>
        <p>Try expanding your search or selecting a different category.</p>
      </div>
    );
  }

  return (
    <div className="place-list-container">
      {places.map((place) => (
        <div 
          key={place.id} 
          className={`place-card animate-fade-in ${place.id === selectedPlaceId ? 'selected cursor-pointer' : 'cursor-pointer'}`}
          onClick={() => handleCardClick(place)}
          id={`place-${place.id}`}
        >
          <div className="card-header">
            <h3 className="place-name">{place.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`category-badge bg-${place.category}`}>
                {place.category}
              </span>
              <button 
                className={`transition-colors p-1 ${savedPlaceIds?.has(place.id) ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                onClick={(e) => handleSaveToggle(e, place)}
                title={savedPlaceIds?.has(place.id) ? "Remove from My List" : "Save to My List"}
              >
                <Bookmark size={20} fill={savedPlaceIds?.has(place.id) ? "currentColor" : "none" } />
              </button>
            </div>
          </div>

          <div className="card-meta">
            <div className="meta-item rating">
              <Star size={14} fill="currentColor" />
              <span>{place.rating}</span>
            </div>
            <div className="meta-item distance">
              <Navigation size={14} />
              <span>{place.distance} km</span>
            </div>
          </div>

          <p className="place-address truncate-text">{place.address}</p>

          {/* Details Section (Visible when selected) */}
          <div className={`place-details ${place.id === selectedPlaceId ? 'expanded' : ''}`}>
            {place.phone !== 'N/A' && (
              <a href={`tel:${place.phone}`} className="detail-row actionable" onClick={(e) => e.stopPropagation()}>
                <Phone size={14} />
                <span>{place.phone}</span>
              </a>
            )}
            
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="detail-row actionable" onClick={(e) => e.stopPropagation()}>
                <Globe size={14} />
                <span className="truncate-text">{place.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            <button 
              className="maps-btn"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank');
              }}
            >
              <ExternalLink size={16} />
              Open in Google Maps
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
