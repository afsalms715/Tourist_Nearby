import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  setDoc
} from 'firebase/firestore';

/**
 * Saves a place to the user's My List.
 * We use the place ID as part of the document ID to prevent duplicates easily.
 */
export async function savePlaceToFirestore(userId, place) {
  const customId = `${userId}_${place.id}`;
  const docRef = doc(db, 'savedPlaces', customId);
  
  await setDoc(docRef, {
    userId,
    placeId: place.id,
    placeName: place.name,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    rating: place.rating,
    phone: place.phone,
    website: place.website,
    createdAt: new Date()
  });
}

/**
 * Removes a place from the user's My List.
 */
export async function removeSavedPlace(userId, placeId) {
  const customId = `${userId}_${placeId}`;
  const docRef = doc(db, 'savedPlaces', customId);
  await deleteDoc(docRef);
}

/**
 * Gets all saved places for a specific user.
 */
export async function getUserSavedPlaces(userId) {
  const q = query(
    collection(db, 'savedPlaces'),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const places = [];
  querySnapshot.forEach((doc) => {
    places.push({ ...doc.data(), documentId: doc.id });
  });
  
  // Sort by createdAt descending (newest first)
  return places.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

/**
 * Checks if a specific place is already saved by the user.
 * This is useful for toggling the Save button state.
 */
export async function isPlaceSaved(userId, placeId) {
  const customId = `${userId}_${placeId}`;
  const docRef = doc(db, 'savedPlaces', customId);
  // An alternative is directly getting the doc, but for simplicity we'll just check if it exists in the user's fetched list typically, or here.
  return docRef;
}
