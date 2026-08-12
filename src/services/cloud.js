import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

export async function pushVehicle(uid, vehicle) {
  await setDoc(doc(db, 'users', uid, 'vehicles', vehicle.id), vehicle);
}

export async function deleteVehicleDoc(uid, vehicleId) {
  await deleteDoc(doc(db, 'users', uid, 'vehicles', vehicleId));
}

export async function pullAll(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'vehicles'));
  return snap.docs.map((d) => d.data());
}

export async function pushTombstone(uid, vehicleId) {
  await setDoc(doc(db, 'users', uid, 'tombstones', vehicleId), {
    deletedAt: Date.now(),
  });
}

export async function pullTombstones(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'tombstones'));
  return snap.docs.map((d) => d.id);
}