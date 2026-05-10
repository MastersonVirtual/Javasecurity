import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';

export function listenCollection(path, callback) {
  const ref = query(collection(db, path), orderBy('createdAt', 'asc'));
  return onSnapshot(ref, (snapshot) => callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
}

export function createRealtimeMessage(message) {
  return addDoc(collection(db, 'messages'), { ...message, createdAt: serverTimestamp() });
}
