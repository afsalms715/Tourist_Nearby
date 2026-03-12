import axios from 'axios';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetches nearby tourism points of interest (attractions, hotels, resorts) using Overpass API.
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @param {number} radius Radius in meters
 * @param {string} category Filter category (all, attractions, hotels, resorts)
 * @returns {Promise<Array>} List of formatted place objects
 */
export async function fetchNearbyPlaces(lat, lon, radius = 2000, category = 'all') {
  // Define Overpass QL query based on category
  let queryTypes = '';
  
  if (category === 'attractions' || category === 'all') {
    queryTypes += `node["tourism"="attraction"](around:${radius},${lat},${lon});\n`;
    queryTypes += `way["tourism"="attraction"](around:${radius},${lat},${lon});\n`;
    queryTypes += `node["tourism"="museum"](around:${radius},${lat},${lon});\n`;
  }
  
  if (category === 'hotels' || category === 'all') {
    queryTypes += `node["tourism"="hotel"](around:${radius},${lat},${lon});\n`;
    queryTypes += `way["tourism"="hotel"](around:${radius},${lat},${lon});\n`;
  }
  
  if (category === 'resorts' || category === 'all') {
    queryTypes += `node["tourism"="resort"](around:${radius},${lat},${lon});\n`;
    queryTypes += `way["tourism"="resort"](around:${radius},${lat},${lon});\n`;
  }

  const query = `
    [out:json][timeout:25];
    (
      ${queryTypes}
    );
    out center;
  `;

  try {
    const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const elements = response.data.elements || [];
    
    // Process and format the raw Overpass data
    return elements
      .filter(el => el.tags && el.tags.name) // Require a name
      .map(el => {
        const isAttraction = el.tags.tourism === 'attraction' || el.tags.tourism === 'museum';
        const isHotel = el.tags.tourism === 'hotel';
        const isResort = el.tags.tourism === 'resort';
        
        // Ensure way results use their calculated center
        const elementLat = el.lat || (el.center && el.center.lat);
        const elementLon = el.lon || (el.center && el.center.lon);

        let placeCategory = 'attraction';
        if (isHotel) placeCategory = 'hotel';
        if (isResort) placeCategory = 'resort';

        return {
          id: el.id,
          name: el.tags.name,
          category: placeCategory,
          latitude: elementLat,
          longitude: elementLon,
          address: el.tags['addr:street'] 
                   ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim() 
                   : (el.tags['addr:city'] || 'Address unavailable'),
          rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Mock rating since OSM rarely has ratings
          phone: el.tags.phone || el.tags['contact:phone'] || 'N/A',
          website: el.tags.website || el.tags['contact:website'] || null,
          distance: calculateDistance(lat, lon, elementLat, elementLon),
          rawTags: el.tags
        };
      })
      .sort((a, b) => a.distance - b.distance); // Sort by closest
      
  } catch (error) {
    console.error('Error fetching places from Overpass:', error);
    throw error;
  }
}

// Haversine formula to calculate distance between two lat/lon points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return (R * c).toFixed(2); // Distance in km
}
