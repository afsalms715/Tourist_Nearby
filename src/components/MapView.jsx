import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default Leaflet marker icons in React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom User Location Icon
const userIconHtml = `
  <div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
`;
const userLocationIcon = L.divIcon({
  html: userIconHtml,
  className: 'user-marker',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Category-specific icons
const createCategoryIcon = (color) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color}; 
      width: 24px; 
      height: 24px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      border: 2px solid white; 
      box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>`,
    className: 'custom-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const icons = {
  attraction: createCategoryIcon('#ef4444'), // Red
  hotel: createCategoryIcon('#3b82f6'),      // Blue
  resort: createCategoryIcon('#10b981'),     // Green
  default: createCategoryIcon('#8b5cf6')     // Purple
};

/**
 * Component to center map on user location automatically when it loads or changes
 */
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ userLocation, places, selectedPlaceId, onPlaceSelect }) {
  if (!userLocation) return <div className="map-placeholder">Waiting for location...</div>;

  const center = [userLocation.latitude, userLocation.longitude];

  return (
    <div className="map-wrapper" style={{ height: '100%', width: '100%', borderRadius: 'inherit', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={14} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <RecenterMap lat={userLocation.latitude} lng={userLocation.longitude} />

        {/* User Location Marker */}
        <Marker position={center} icon={userLocationIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Places Markers */}
        {places.map((place) => {
          const isSelected = place.id === selectedPlaceId;
          const pos = [place.latitude, place.longitude];
          const icon = icons[place.category] || icons.default;

          return (
            <Marker 
              key={place.id} 
              position={pos} 
              icon={icon}
              eventHandlers={{
                click: () => onPlaceSelect(place.id),
              }}
            >
              {isSelected && (
                <Popup className="custom-popup" autoPan={true}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                    {place.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
