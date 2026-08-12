import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const catsCollection = (uid) => collection(db, 'users', uid, 'vehicles');
const photosCollection = (uid, catId) =>
  collection(db, 'users', uid, 'vehicles', catId, 'photos');

export async function pushCat(uid, cat) {
  const { photos, ...catData } = cat; // фото едут отдельно
  await setDoc(doc(db, 'users', uid, 'vehicles', cat.id), catData);
}

export async function pushPhoto(uid, catId, photo) {
  await setDoc(
    doc(db, 'users', uid, 'vehicles', catId, 'photos', photo.id),
    photo
  );
}

export async function deletePhoto(uid, catId, photoId) {
  await deleteDoc(doc(db, 'users', uid, 'vehicles', catId, 'photos', photoId));
}

export async function deleteCatWithPhotos(uid, catId) {
  const photosSnap = await getDocs(photosCollection(uid, catId));
  for (const photoDoc of photosSnap.docs) {
    await deleteDoc(photoDoc.ref);
  }
  await deleteDoc(doc(db, 'users', uid, 'vehicles', catId));
}

export async function pullAll(uid) {
  const catsSnap = await getDocs(catsCollection(uid));
  const cats = [];
  for (const catDoc of catsSnap.docs) {
    const cat = { ...catDoc.data(), photos: [] };
    const photosSnap = await getDocs(photosCollection(uid, cat.id));
    cat.photos = photosSnap.docs.map((photoDoc) => photoDoc.data());
    cats.push(cat);
  }
  return cats;
}

export async function pushTombstone(uid, catId) {
  await setDoc(doc(db, 'users', uid, 'tombstones', catId), {
    deletedAt: Date.now(),
  });
}

export async function pullTombstones(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'tombstones'));
  return snap.docs.map((d) => d.id);
}