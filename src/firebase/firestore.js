// Multi-Tenant Firestore Helpers
// All data is scoped under: tenants/{tenantId}/{collection}/{docId}

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// ─── Tenant Scoping ────────────────────────────────────────────────────────────
/**
 * Returns the Firestore collection reference scoped to a tenant.
 * Path: tenants/{tenantId}/{collectionName}
 */
export function tenantCollection(tenantId, collectionName) {
  return collection(db, 'tenants', tenantId, collectionName);
}

/**
 * Returns a document reference scoped to a tenant.
 * Path: tenants/{tenantId}/{collectionName}/{docId}
 */
export function tenantDoc(tenantId, collectionName, docId) {
  return doc(db, 'tenants', tenantId, collectionName, docId);
}

// ─── Cars ──────────────────────────────────────────────────────────────────────
export async function getCars(tenantId) {
  const ref = query(tenantCollection(tenantId, 'cars'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCar(tenantId, carId) {
  const ref = tenantDoc(tenantId, 'cars', carId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addCar(tenantId, carData, adminUid = null) {
  const ref = tenantCollection(tenantId, 'cars');
  return addDoc(ref, {
    tenantId,
    createdBy: adminUid || 'admin',
    ...carData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCar(tenantId, carId, updates, adminUid = null) {
  const ref = tenantDoc(tenantId, 'cars', carId);
  return updateDoc(ref, {
    ...updates,
    tenantId,
    updatedBy: adminUid || 'admin',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCar(tenantId, carId) {
  return deleteDoc(tenantDoc(tenantId, 'cars', carId));
}

export function subscribeToCars(tenantId, callback) {
  const ref = query(tenantCollection(tenantId, 'cars'), orderBy('createdAt', 'desc'));
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ─── Bookings ──────────────────────────────────────────────────────────────────
export async function getBookings(tenantId) {
  const ref = query(tenantCollection(tenantId, 'bookings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getBooking(tenantId, bookingId) {
  const snap = await getDoc(tenantDoc(tenantId, 'bookings', bookingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addBooking(tenantId, bookingData, userId = null) {
  const ref = tenantCollection(tenantId, 'bookings');
  const activeUserId = userId || bookingData.userId || 'guest';
  const docRef = await addDoc(ref, {
    tenantId,
    userId: activeUserId,
    createdBy: activeUserId,
    ...bookingData,
    status: bookingData.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Upsert customer record
  if (bookingData.customerEmail || bookingData.email) {
    await upsertCustomer(tenantId, {
      name: bookingData.customerName || bookingData.name,
      email: bookingData.customerEmail || bookingData.email,
      phone: bookingData.customerPhone || bookingData.phone || '',
    }, activeUserId);
  }

  return docRef;
}

export async function updateBookingStatus(tenantId, bookingId, status, adminUid = null) {
  return updateDoc(tenantDoc(tenantId, 'bookings', bookingId), {
    tenantId,
    status,
    updatedBy: adminUid || 'admin',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBooking(tenantId, bookingId) {
  return deleteDoc(tenantDoc(tenantId, 'bookings', bookingId));
}

export function subscribeToBookings(tenantId, callback) {
  const ref = query(tenantCollection(tenantId, 'bookings'), orderBy('createdAt', 'desc'));
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToRecentBookings(tenantId, callback, n = 5) {
  const ref = query(
    tenantCollection(tenantId, 'bookings'),
    orderBy('createdAt', 'desc'),
    limit(n)
  );
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ─── Customers ─────────────────────────────────────────────────────────────────
export async function getCustomers(tenantId) {
  const ref = query(tenantCollection(tenantId, 'customers'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function upsertCustomer(tenantId, { name, email, phone }, userId = null) {
  // Check if customer with this email already exists
  const ref = query(
    tenantCollection(tenantId, 'customers'),
    where('email', '==', email),
    limit(1)
  );
  const snap = await getDocs(ref);

  if (!snap.empty) {
    // Update last seen
    await updateDoc(snap.docs[0].ref, {
      tenantId,
      name,
      phone: phone || snap.docs[0].data().phone,
      userId: userId || snap.docs[0].data().userId || 'guest',
      lastBooking: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return snap.docs[0].id;
  } else {
    const docRef = await addDoc(tenantCollection(tenantId, 'customers'), {
      tenantId,
      userId: userId || 'guest',
      name,
      email,
      phone: phone || '',
      lastBooking: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }
}

// ─── Inquiries ─────────────────────────────────────────────────────────────────
export async function addInquiry(tenantId, inquiryData, userId = null) {
  const activeUserId = userId || inquiryData.userId || 'guest';
  return addDoc(tenantCollection(tenantId, 'inquiries'), {
    tenantId,
    userId: activeUserId,
    createdBy: activeUserId,
    ...inquiryData,
    status: inquiryData.status || 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToInquiries(tenantId, callback) {
  const ref = query(tenantCollection(tenantId, 'inquiries'), orderBy('createdAt', 'desc'));
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function updateInquiryStatus(tenantId, inquiryId, status, adminUid = null) {
  return updateDoc(tenantDoc(tenantId, 'inquiries', inquiryId), {
    tenantId,
    status,
    updatedBy: adminUid || 'admin',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInquiry(tenantId, inquiryId) {
  return deleteDoc(tenantDoc(tenantId, 'inquiries', inquiryId));
}

// ─── Customer CRM Management ──────────────────────────────────────────────────

export function subscribeToCustomers(tenantId, callback) {
  const ref = query(tenantCollection(tenantId, 'customers'), orderBy('createdAt', 'desc'));
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, err => {
    console.error('Error in customers subscription:', err);
  });
}

export async function addCustomer(tenantId, customerData, adminUid = null) {
  const ref = tenantCollection(tenantId, 'customers');
  return addDoc(ref, {
    tenantId,
    ...customerData,
    createdBy: adminUid || 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCustomer(tenantId, customerId, updates, adminUid = null) {
  return updateDoc(tenantDoc(tenantId, 'customers', customerId), {
    ...updates,
    updatedBy: adminUid || 'admin',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCustomer(tenantId, customerId) {
  return deleteDoc(tenantDoc(tenantId, 'customers', customerId));
}

// ─── Customer Reviews ───────────────────────────────────────────────────────────
export async function getReviews(tenantId) {
  try {
    const ref = query(tenantCollection(tenantId, 'reviews'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(ref);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
}

export async function addReview(tenantId, reviewData, adminUid = null) {
  const ref = tenantCollection(tenantId, 'reviews');
  return addDoc(ref, {
    tenantId,
    ...reviewData,
    createdBy: adminUid || 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReview(tenantId, reviewId) {
  return deleteDoc(tenantDoc(tenantId, 'reviews', reviewId));
}

export function subscribeToReviews(tenantId, callback) {
  const ref = query(tenantCollection(tenantId, 'reviews'), orderBy('createdAt', 'desc'));
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, err => {
    console.error('Error in reviews subscription:', err);
  });
}

// ─── Expenses Management ───────────────────────────────────────────────────────
export function subscribeToExpenses(tenantId, callback) {
  const ref = query(tenantCollection(tenantId, 'expenses'), orderBy('createdAt', 'desc'));
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, err => {
    console.error('Error in expenses subscription:', err);
    callback([]);
  });
}

export async function addExpense(tenantId, expenseData, adminUid = null) {
  const ref = tenantCollection(tenantId, 'expenses');
  return addDoc(ref, {
    tenantId,
    ...expenseData,
    amount: Number(expenseData.amount || 0),
    createdBy: adminUid || 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateExpense(tenantId, expenseId, updates, adminUid = null) {
  return updateDoc(tenantDoc(tenantId, 'expenses', expenseId), {
    ...updates,
    amount: Number(updates.amount || 0),
    updatedBy: adminUid || 'admin',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpense(tenantId, expenseId) {
  return deleteDoc(tenantDoc(tenantId, 'expenses', expenseId));
}

// ─── Inventory Management ──────────────────────────────────────────────────────
export function subscribeToInventory(tenantId, callback) {
  const ref = query(tenantCollection(tenantId, 'inventory'), orderBy('createdAt', 'desc'));
  return onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, err => {
    console.error('Error in inventory subscription:', err);
    callback([]);
  });
}

export async function addInventoryItem(tenantId, itemData, adminUid = null) {
  const ref = tenantCollection(tenantId, 'inventory');
  return addDoc(ref, {
    tenantId,
    ...itemData,
    quantity: Number(itemData.quantity || 0),
    reorderLevel: Number(itemData.reorderLevel || 5),
    costPerUnit: Number(itemData.costPerUnit || 0),
    createdBy: adminUid || 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateInventoryItem(tenantId, itemId, updates, adminUid = null) {
  return updateDoc(tenantDoc(tenantId, 'inventory', itemId), {
    ...updates,
    quantity: Number(updates.quantity || 0),
    reorderLevel: Number(updates.reorderLevel || 5),
    costPerUnit: Number(updates.costPerUnit || 0),
    updatedBy: adminUid || 'admin',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInventoryItem(tenantId, itemId) {
  return deleteDoc(tenantDoc(tenantId, 'inventory', itemId));
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
export async function getDashboardStats(tenantId) {
  const [cars, bookings, customers, inquiries, expenses] = await Promise.all([
    getDocs(tenantCollection(tenantId, 'cars')),
    getDocs(tenantCollection(tenantId, 'bookings')),
    getDocs(tenantCollection(tenantId, 'customers')),
    getDocs(tenantCollection(tenantId, 'inquiries')),
    getDocs(tenantCollection(tenantId, 'expenses')),
  ]);

  const bookingDocs = bookings.docs.map(d => d.data());
  const confirmedBookings = bookingDocs.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const expenseDocs = expenses.docs.map(d => d.data());
  const totalExpenses = expenseDocs.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return {
    totalCars: cars.size,
    totalBookings: bookings.size,
    totalCustomers: customers.size,
    totalInquiries: inquiries.size,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    pendingBookings: bookingDocs.filter(b => b.status === 'pending').length,
    newInquiries: inquiries.docs.filter(d => d.data().status === 'new').length,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
// ─── Admin Roles & Authentication Scoping ────────────────────────────────────
export async function getAdminUser(tenantId, uid) {
  try {
    const snap = await getDoc(tenantDoc(tenantId, 'admins', uid));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    // Fallback global check
    const globalSnap = await getDoc(doc(db, 'admins', uid));
    if (globalSnap.exists()) {
      return { id: globalSnap.id, ...globalSnap.data() };
    }
    return null;
  } catch (err) {
    console.error('Error fetching admin user:', err);
    return null;
  }
}

export async function registerAdminUser(tenantId, uid, { email, name, role = 'admin' }) {
  try {
    const adminData = {
      uid,
      email,
      name: name || email.split('@')[0],
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(tenantDoc(tenantId, 'admins', uid), adminData, { merge: true });
    // Also save in global admins for cross-tenant support
    await setDoc(doc(db, 'admins', uid), adminData, { merge: true });
    return adminData;
  } catch (err) {
    console.error('Error registering admin user:', err);
    throw err;
  }
}

// ─── Tenant Settings & Dynamic Footer Configuration ───────────────────────────
export const DEFAULT_TENANT_SETTINGS = {
  businessName: "Jay Kedar Car Rental",
  tagline: 'Premium self-drive car rentals with 300 km daily limit, doorstep delivery & verified fleet.',
  phone: '+91 8485877633',
  email: 'abhiparekar58@gmail.com',
  address: 'Pune, Maharashtra',
  whatsapp: '918485877633',
  facebook: 'https://facebook.com',
  instagram: 'https://ig.me/m/founder_abhishek',
  twitter: 'https://twitter.com',
  youtube: 'https://youtube.com',
  accentColor: '#FF6B00',
  // About Page Dynamic Settings
  aboutTitle: 'Reinventing Jay Kedar Car Rental',
  aboutSubtitle: 'Driven by 100% transparency, verified cars, 300 km daily limit, and 30-minute doorstep delivery in Pune.',
  aboutMissionHeading: 'Empowering Renters with Complete Self-Drive Freedom',
  aboutMissionText: 'We believe having a car for weekend family trips, business meetings, or hill-station drives should be simple — accessible on demand without ownership hassle.',
  aboutStoryText: 'Every vehicle in our fleet is deep-sanitized, digitally verified, and handed over with complete document verification.',
  statsRenters: '500+',
  statsFleet: '50+',
  statsDelivery: '30 Mins',
  statsRating: '4.9/5',
};

export const INITIAL_FLEET_CARS = [
  {
    name: 'Force Traveller - Lonavala Package (AC 17 Seater)',
    busModel: 'Force Traveller',
    brand: 'Force Motors',
    category: 'bus',
    seats: 17,
    acType: 'ac',
    pricePerDay: 9500,
    perKmRate: 25,
    includedKm: 'Lonavala Package',
    extraKmRate: 25,
    images: ['/force-traveller.jpg'],
    description: 'Lonavala package AC 17 seat Rs 9500. Non-AC per km Rs 25 for 20 seats. Sanitized Force Traveller, push-back comfortable seating, expert hill-route driver.',
    isActive: true,
    isPopular: true,
    rating: 4.9,
    features: ['17 & 20 Seater Options', 'AC / Non-AC', 'Push-Back Seats', 'Lonavala Sightseeing', 'Driver Allowance']
  },
  {
    name: 'Force Traveller - Mahabaleshwar Package (17 Seat AC Bus)',
    busModel: 'Force Traveller',
    brand: 'Force Motors',
    category: 'bus',
    seats: 17,
    acType: 'ac',
    pricePerDay: 11000,
    perKmRate: 29,
    includedKm: 'Mahabaleshwar Package',
    extraKmRate: 29,
    images: ['/force-traveller.jpg'],
    description: 'Mahabaleshwar package includes 17 seat AC Force Traveller bus Rs 11,000. 20 Seater option available @ Rs 29/km. Chilled AC, sanitized interior, scenic tour specialist.',
    isActive: true,
    isPopular: true,
    rating: 5.0,
    features: ['17 Seat AC Luxury Bus', '20 Seat @ Rs 29/km', 'Panchgani & Mahabaleshwar', 'Push-Back Recliners', 'Music System']
  },
  {
    name: 'Force Traveller - Mumbai Package Non-AC (350 km)',
    busModel: 'Force Traveller',
    brand: 'Force Motors',
    category: 'bus',
    seats: 17,
    acType: 'non_ac',
    pricePerDay: 12000,
    perKmRate: 27,
    includedKm: '350 km (Purandar)',
    extraKmRate: 25,
    images: ['/force-traveller.jpg'],
    description: '17 seat Non-AC Force Traveller Mumbai package (350 km Purandar) Rs 12,000. Extra km @ Rs 25/km, per km rate Rs 27/km. 17 seater capacity with clean spacious interior.',
    isActive: true,
    isPopular: true,
    rating: 4.8,
    features: ['17 Seats (Shita)', '350 km Limit Included', 'Purandar to Mumbai', 'Extra km @ Rs 25', 'Spacious Luggage Boot']
  },
  {
    name: 'Force Traveller - Mumbai Package AC Luxury (350 km)',
    busModel: 'Force Traveller',
    brand: 'Force Motors',
    category: 'bus',
    seats: 17,
    acType: 'ac',
    pricePerDay: 15000,
    perKmRate: 28,
    includedKm: '350 km (Purandar)',
    extraKmRate: 28,
    images: ['/force-traveller.jpg'],
    description: '17 seat AC Force Traveller Mumbai package (350 km Purandar) Rs 15,000. Extra km @ Rs 28/km. Luxury chilled AC bus, stereo audio, comfortable recliners for long travel.',
    isActive: true,
    isPopular: true,
    rating: 5.0,
    features: ['17 Seater Chilled AC', '350 km Limit Included', 'Purandar / Pune to Mumbai', 'Extra km @ Rs 28', 'Push-Back Luxury Seats']
  }
];

export const INITIAL_REVIEWS = [
  {
    author: 'Rahul Deshmukh',
    rating: 5,
    comment: 'Super clean Ertiga delivered right at my door in Baner. Smooth self-drive experience for our Mahabaleshwar trip! Highly recommended.',
    car: 'Maruti Ertiga VXI',
    date: 'March 2026',
    verified: true
  },
  {
    author: 'Priya Sharma',
    rating: 5,
    comment: 'Booked Swift for 3 days. Very transparent pricing, 300 km/day was more than enough, and zero hidden charges at security return.',
    car: 'Maruti Swift VXI',
    date: 'February 2026',
    verified: true
  },
  {
    author: 'Amit Patil',
    rating: 5,
    comment: 'Best self-drive car rental in Pune! Thar was in pristine condition. Fast verification process and polite team.',
    car: 'Mahindra Thar 4x2',
    date: 'January 2026',
    verified: true
  }
];

export async function getTenantSettings(tenantId) {
  try {
    const snap = await getDoc(tenantDoc(tenantId, 'settings', 'config'));
    if (!snap.exists()) {
      return DEFAULT_TENANT_SETTINGS;
    }
    return { ...DEFAULT_TENANT_SETTINGS, ...snap.data() };
  } catch (err) {
    console.error('Error fetching tenant settings:', err);
    return DEFAULT_TENANT_SETTINGS;
  }
}

export async function updateTenantSettings(tenantId, settingsData, adminUid = null) {
  const ref = tenantDoc(tenantId, 'settings', 'config');
  return setDoc(ref, {
    tenantId,
    ...settingsData,
    updatedBy: adminUid || 'admin',
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToTenantSettings(tenantId, callback) {
  const ref = tenantDoc(tenantId, 'settings', 'config');
  return onSnapshot(ref, snap => {
    if (snap.exists()) {
      callback({ ...DEFAULT_TENANT_SETTINGS, ...snap.data() });
    } else {
      callback(DEFAULT_TENANT_SETTINGS);
    }
  }, err => {
    console.error('Error in tenant settings subscription:', err);
    callback(DEFAULT_TENANT_SETTINGS);
  });
}

export function formatTimestamp(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// ─── Automatic Multi-Tenant Initialization ─────────────────────────────────────
export async function ensureTenantInitialData(tenantId) {
  try {
    // Ensure Tenant Settings if document does not exist yet
    const settingsSnap = await getDoc(tenantDoc(tenantId, 'settings', 'config'));
    if (!settingsSnap.exists()) {
      console.log(`[Multi-Tenant Firestore] Initializing default settings for tenant: ${tenantId}`);
      await updateTenantSettings(tenantId, {
        ...DEFAULT_TENANT_SETTINGS,
        isInitialized: true,
      }, 'system-init');
    }

    // NOTE: We intentionally DO NOT auto-seed cars or reviews here.
    // If the admin deletes all cars/reviews, the collections MUST remain empty
    // and must never automatically re-seed seed data on page reload.
  } catch (err) {
    console.warn('[Multi-Tenant Firestore] Tenant initial data check:', err.message);
  }
}

/**
 * Manually seed default fleet cars if the admin explicitly requests it.
 */
export async function seedDefaultFleet(tenantId, adminUid = null) {
  for (const car of INITIAL_FLEET_CARS) {
    await addCar(tenantId, car, adminUid || 'admin-seed');
  }
}

export { serverTimestamp, Timestamp };


