import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Booking } from '../types';

const BOOKINGS_COLLECTION = 'bookings';

export async function createBooking(booking: Booking): Promise<void> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
    await setDoc(docRef, booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}

export function streamBookings(callback: (bookings: Booking[]) => void): () => void {
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('date', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const liveBookings: Booking[] = [];
    snapshot.forEach((docSnap) => {
      liveBookings.push({
        ...docSnap.data(),
        id: docSnap.id
      } as Booking);
    });
    callback(liveBookings);
  }, (error) => {
    console.error("Error streaming bookings:", error);
  });
  
  return unsubscribe;
}
