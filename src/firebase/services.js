import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  Timestamp,
  where,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db } from './config';

/* ───────── Auth ───────── */

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        const newProfile = { name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User', email: firebaseUser.email, role: 'customer', phone: '', isActive: true, createdAt: new Date().toISOString() };
        await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
        userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      }
      const profile = userDoc.data();
      const role = firebaseUser.email === 'bigsmart2026@gmail.com' ? 'admin' : (profile.role || 'customer');
      const result = { userId: firebaseUser.uid, name: profile.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User', email: firebaseUser.email, role, phone: profile.phone || '', token: null };
      callback(result);
    } else {
      callback(null);
    }
  });
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  let userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    const newProfile = { name: user.displayName || email.split('@')[0], email, role: 'customer', phone: '', isActive: true, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    userDoc = await getDoc(doc(db, 'users', user.uid));
  }
  const profile = userDoc.data();
  const role = user.email === 'bigsmart2026@gmail.com' ? 'admin' : (profile.role || 'customer');
  const result = { userId: user.uid, name: profile.name || user.displayName || email.split('@')[0], email: user.email, role, phone: profile.phone || '', token: null };
  return result;
}

export async function registerUser(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  const profile = { name, email, role: 'customer', phone: '', isActive: true, createdAt: new Date().toISOString() };
  await setDoc(doc(db, 'users', user.uid), profile);
  return { userId: user.uid, name, email, role: 'customer', token: null };
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/* ───────── Firestore helpers ───────── */

const collections = {
  orders: 'logi_orders',
  drivers: 'logi_drivers',
  vehicles: 'logi_vehicles',
  warehouses: 'logi_warehouses',
  notifications: 'logi_notifications',
  addresses: 'logi_addresses',
  activityLogs: 'logi_activity_logs',
  inventory: 'logi_inventory',
  supportMessages: 'logi_support_messages',
};

async function getAll(collectionKey) {
  const colName = collections[collectionKey];
  if (!colName) throw new Error(`Unknown collection: ${collectionKey}`);
  const q = query(collection(db, colName), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getById(collectionKey, id) {
  const colName = collections[collectionKey];
  const snap = await getDoc(doc(db, colName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

async function addOne(collectionKey, data) {
  const colName = collections[collectionKey];
  const ref = await addDoc(collection(db, colName), {
    ...data,
    createdAt: Timestamp.now().toDate().toISOString(),
  });
  return { id: ref.id, ...data };
}

async function updateOne(collectionKey, id, updates) {
  const colName = collections[collectionKey];
  await updateDoc(doc(db, colName, id), updates);
  return getById(collectionKey, id);
}

async function removeOne(collectionKey, id) {
  const colName = collections[collectionKey];
  await deleteDoc(doc(db, colName, id));
  return true;
}

/* ───────── Domain API ───────── */

export async function fetchOrders() {
  const snap = await getDocs(collection(db, 'logi_orders'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchDrivers() {
  return getAll('drivers');
}

export async function fetchVehicles() {
  return getAll('vehicles');
}

export async function fetchUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchWarehouses() {
  return getAll('warehouses');
}

export async function fetchNotifications() {
  return getAll('notifications');
}

export async function saveOrder(order) {
  const ref = await addDoc(collection(db, 'logi_orders'), {
    ...order,
    createdAt: Timestamp.now().toDate().toISOString(),
    trackingHistory: [{ status: 'pending', timestamp: Timestamp.now().toDate().toISOString() }],
  });
  return { id: ref.id, ...order };
}

export async function updateOrder(id, updates) {
  await updateDoc(doc(db, 'logi_orders', id), updates);
  const snap = await getDoc(doc(db, 'logi_orders', id));
  return { id: snap.id, ...snap.data() };
}

export async function deleteOrder(id) {
  await deleteDoc(doc(db, 'logi_orders', id));
  return true;
}

export async function assignDriver(orderId, driverId) {
  const orderSnap = await getDoc(doc(db, 'logi_orders', orderId));
  const driverSnap = await getDoc(doc(db, 'logi_drivers', driverId));
  if (!orderSnap.exists() || !driverSnap.exists()) throw new Error('Order or Driver not found');

  const order = { id: orderSnap.id, ...orderSnap.data() };
  const history = [...(order.trackingHistory || []), { status: 'assigned', timestamp: Timestamp.now().toDate().toISOString() }];

  await updateDoc(doc(db, 'logi_orders', orderId), {
    assignedDriver: driverId,
    status: 'picked-up',
    trackingHistory: history,
  });
  await updateDoc(doc(db, 'logi_drivers', driverId), { status: 'on-delivery' });

  return { ...order, assignedDriver: driverId, status: 'picked-up', trackingHistory: history };
}

export async function addNotification(notification) {
  return addOne('notifications', { ...notification, read: false });
}

export async function addActivityLog(action) {
  const authState = auth.currentUser;
  return addOne('activityLogs', {
    user: authState?.displayName || authState?.email || 'Anonymous',
    action,
  });
}

/* ───────── Domain writes ───────── */

export async function addVehicle(data) {
  return addOne('vehicles', {
    ...data,
    status: data.status || 'active',
    fuelLevel: data.fuelLevel || 100,
    batteryLevel: data.batteryLevel || 100,
    location: data.location || null,
  });
}

export async function updateVehicle(id, updates) {
  return updateOne('vehicles', id, updates);
}

export async function deleteVehicle(id) {
  return removeOne('vehicles', id);
}

export async function addDriver(data) {
  return addOne('drivers', {
    ...data,
    status: data.status || 'available',
    rating: data.rating || 5.0,
    totalDeliveries: data.totalDeliveries || 0,
    earnings: data.earnings || 0,
  });
}

export async function updateDriver(id, updates) {
  return updateOne('drivers', id, updates);
}

export async function addWarehouse(data) {
  return addOne('warehouses', {
    ...data,
    currentStock: data.currentStock || 0,
    capacity: data.capacity || 1000,
    lat: data.lat || 6.5,
    lng: data.lng || 3.4,
  });
}

export async function updateWarehouse(id, updates) {
  return updateOne('warehouses', id, updates);
}

export async function updateUserProfile(userId, data) {
  await updateDoc(doc(db, 'users', userId), data);
  return { userId, ...data };
}

export async function addInventoryItem(data) {
  return addOne('inventory', {
    ...data,
    quantity: data.quantity || 0,
    minStock: data.minStock || 10,
  });
}

export async function updateInventoryItem(id, updates) {
  return updateOne('inventory', id, updates);
}

export async function fetchInventory() {
  return getAll('inventory');
}

export async function addSupportMessage(data) {
  return addOne('supportMessages', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export async function fetchSupportMessages() {
  return getAll('supportMessages');
}

/* ───────── Address helpers ───────── */

export async function fetchAddresses(userId) {
  const q = query(collection(db, 'logi_addresses'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveAddress(userId, address) {
  const ref = await addDoc(collection(db, 'logi_addresses'), {
    ...address,
    userId,
    createdAt: Timestamp.now().toDate().toISOString(),
  });
  return { id: ref.id, ...address };
}

export async function deleteAddress(id) {
  await deleteDoc(doc(db, 'logi_addresses', id));
  return true;
}

/* ───────── Calculation helpers ───────── */

export function calculateCost(weight, distance, vehicleType) {
  const rates = { bike: 200, van: 500, truck: 800 };
  const base = (rates[vehicleType] || 500) * weight;
  const distanceCost = distance * 50;
  return base + distanceCost;
}

export function calculateETA(distance, vehicleType, trafficBuffer = false) {
  const speeds = { bike: 40, van: 60, truck: 50 };
  let hours = distance / (speeds[vehicleType] || 50);
  if (trafficBuffer) hours *= 1.3;
  return Math.round(hours * 10) / 10;
}

export function estimateDistance(originLat, originLng, destLat, destLng) {
  const R = 6371;
  const dLat = (destLat - originLat) * Math.PI / 180;
  const dLng = (destLng - originLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(originLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function generateRoute(from, to) {
  const steps = 10;
  const route = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    route.push({ lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t });
  }
  return route;
}

/* ───────── Real-time tracking ───────── */

export function subscribeToOrder(orderId, callback) {
  const unsub = onSnapshot(doc(db, 'logi_orders', orderId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
  return unsub;
}

export function subscribeToAllOrders(callback) {
  const q = query(collection(db, 'logi_orders'), orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  return unsub;
}

export async function updateDriverLocation(userId, lat, lng) {
  await updateDoc(doc(db, 'users', userId), {
    currentLocation: { lat, lng, updatedAt: new Date().toISOString() },
  });
}

export function subscribeToDriverLocation(driverId, callback) {
  const unsub = onSnapshot(doc(db, 'logi_drivers', driverId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.location || null);
    }
  });
  return unsub;
}

export function subscribeToUserLocation(userId, callback) {
  const unsub = onSnapshot(doc(db, 'users', userId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.currentLocation || null);
    }
  });
  return unsub;
}

export function subscribeToOrdersForDriver(driverId, callback) {
  const q = query(collection(db, 'logi_orders'), where('assignedDriver', '==', driverId));
  const unsub = onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  return unsub;
}

export async function updateOrderStatus(orderId, status, location) {
  const historyEntry = { status, timestamp: Timestamp.now().toDate().toISOString() };
  const updates = { status };
  if (location) updates.currentLocation = location;
  updates.trackingHistory = arrayUnion(historyEntry);
  await updateDoc(doc(db, 'logi_orders', orderId), updates);
}

export async function updateOrderWithLocation(orderId, status, lat, lng) {
  const historyEntry = { status, timestamp: Timestamp.now().toDate().toISOString(), lat, lng };
  await updateDoc(doc(db, 'logi_orders', orderId), {
    status,
    currentLocation: { lat, lng },
    trackingHistory: arrayUnion(historyEntry),
  });
}
