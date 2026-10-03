# Product Requirements Document (PRD)
## Self-Drive Car Rental Website (Revv-Inspired)

**Version:** 1.0
**Date:** July 24, 2026
**Tech Stack:** React JS, Tailwind CSS, Framer Motion (animation), Firebase (Auth + Firestore + Storage + Hosting)

---

## 1. Overview

### 1.1 Purpose
Build a self-drive car rental discovery website where visitors can browse available cars, filter them by rental price/type/category, view detailed car information, and submit a rental **inquiry** (not a full payment booking) which gets sent to an Admin Dashboard for follow-up. This mirrors the core browsing/inquiry experience of Revv.co.in, simplified for an MVP.

### 1.2 Reference
Inspired by **Revv.co.in** — India's self-drive car rental platform offering hourly/daily/monthly rentals, doorstep delivery, and unlimited-km packages across categories like hatchbacks, sedans, SUVs, and premium cars.

### 1.3 Goals
- Let users browse a catalog of cars with images, specs, and rental pricing.
- Let users filter/sort cars by price, category (hatchback/sedan/SUV/premium), fuel type, transmission, and city/location.
- Let users submit an inquiry (name, phone, email, city, dates, selected car) instead of a live payment checkout.
- Give admins a way to view and manage incoming inquiries and manage the car catalog (CRUD).
- Clean, modern, animated UI that feels trustworthy and mobile-friendly.

### 1.4 Out of Scope (MVP)
- Real payment gateway integration
- Live GPS tracking / doorstep delivery logistics
- Native mobile apps
- Multi-language support

---

## 2. User Roles

| Role | Description | Access |
|---|---|---|
| **Visitor / Customer** | Browses cars, filters, views details, submits inquiry | Public, no login required (optional login for "My Inquiries") |
| **Admin** | Manages car listings, views/manages inquiries, updates status | Protected route, Firebase Auth login |

---

## 3. Core Features

### 3.1 Public Website (Customer-Facing)

#### 3.1.1 Home Page
- Hero section with search bar: **City**, **Pickup Date/Time**, **Return Date/Time**, "Search Cars" CTA
- Animated hero banner (Framer Motion fade/slide-in)
- "Why Choose Us" section (doorstep delivery, unlimited km, insurance included, 24/7 support — icons + short text)
- Featured/Top-picked cars carousel
- Categories section (Hatchback, Sedan, SUV, Premium/Luxury) — clickable cards that pre-filter listings
- Customer testimonials carousel
- Footer with contact info, social links, city list, quick links

#### 3.1.2 Car Listing Page (`/cars`)
- Grid/list of car cards showing: image, name, category tag, transmission type, fuel type, seating capacity, price per hour/day, "View Details" + "Enquire Now" buttons
- **Filter Sidebar / Drawer (mobile):**
  - Price range slider (min–max ₹/hour or ₹/day)
  - Car category (checkbox: Hatchback, Sedan, SUV, Premium)
  - Transmission (Manual / Automatic)
  - Fuel type (Petrol / Diesel / Electric / CNG)
  - City/location dropdown
  - Seating capacity
  - "Available now" toggle
- **Sort options:** Price (low→high, high→low), Popularity, Newest
- Pagination or infinite scroll
- Empty state ("No cars match your filters") with reset filters CTA
- Skeleton loaders while fetching from Firestore
- Animated filter panel open/close, animated card entrance (staggered fade/slide)

#### 3.1.3 Car Details Page (`/cars/:carId`)
- Image gallery/carousel of the car
- Car specs: brand, model, year, category, seats, transmission, fuel type, mileage, luggage capacity
- Pricing breakdown: hourly rate, daily rate, weekly/monthly rate (if applicable), security deposit, unlimited-km info
- Features list (AC, Bluetooth, Sunroof, All India Permit, etc.)
- Availability indicator
- **"Send Inquiry" form** (sticky sidebar on desktop, bottom sheet on mobile):
  - Name, Phone, Email
  - Pickup city, Pickup date & time, Return date & time
  - Pickup type (Doorstep delivery / Self pickup)
  - Optional message
  - Submit → writes to Firestore `inquiries` collection, shows success toast/animation
- Related/similar cars section at bottom

#### 3.1.4 General Inquiry / Contact Page (`/contact`)
- Simple inquiry form not tied to a specific car (for general questions)
- Company contact details, map embed (optional), social links

#### 3.1.5 About Us Page
- Company story, service cities list, trust badges (insurance, verified cars, 24/7 support)

#### 3.1.6 (Optional) Customer Account
- Firebase Auth (email/phone OTP) login
- "My Inquiries" page showing status of submitted inquiries (Pending / Contacted / Confirmed / Closed)

---

### 3.2 Admin Panel (`/admin`)

#### 3.2.1 Admin Login
- Firebase Authentication (email/password), protected route via custom claims or a Firestore `admins` collection check

#### 3.2.2 Dashboard
- Summary cards: Total Cars, Total Inquiries, New Inquiries (unread), Cars by category chart

#### 3.2.3 Manage Cars (CRUD)
- Table/list of all cars with search & filter
- Add New Car form: name, brand, category, images (upload to Firebase Storage), transmission, fuel type, seats, hourly price, daily price, weekly/monthly price, deposit, features (multi-select), city availability, status (Active/Inactive)
- Edit / Delete car
- Toggle car availability

#### 3.2.4 Manage Inquiries
- Table of all inquiries: customer name, phone, email, car requested, pickup/return dates, city, status, submitted date
- Filter by status (New / Contacted / Confirmed / Closed) and date range
- Click to view full inquiry detail
- Update status (dropdown), add internal notes
- Export to CSV (optional)

#### 3.2.5 Admin Management (optional, phase 2)
- Add/remove admin users

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Lazy-load images, code-splitting per route, Firestore query pagination (limit + startAfter) |
| **Responsiveness** | Fully responsive: mobile, tablet, desktop (Tailwind breakpoints) |
| **Animation** | Framer Motion for page transitions, card entrances, filter drawer, hero, form submit success states — kept subtle, not distracting |
| **SEO** | React Helmet for meta tags per page; SSR/prerendering optional via Vite + prerender or migrate to Next.js if SEO is critical |
| **Security** | Firestore security rules restricting writes: public can only `create` in `inquiries`; only authenticated admins can write to `cars` and `admins`; read rules scoped appropriately |
| **Accessibility** | Semantic HTML, ARIA labels on filters/forms, keyboard-navigable filter drawer |
| **Analytics** | Firebase Analytics for page views, filter usage, inquiry submissions (conversion tracking) |

---

## 5. Tech Stack & Architecture

### 5.1 Frontend
- **React JS** (Vite for build tooling — faster dev experience than CRA)
- **React Router v6** for routing
- **Tailwind CSS** for styling (with a custom theme: primary brand color, spacing scale)
- **Framer Motion** for animations (page transitions, staggered lists, modals/drawers)
- **React Hook Form + Zod/Yup** for inquiry form validation
- **Zustand or React Context** for lightweight global state (filters, cart-less inquiry flow)
- **React Query (TanStack Query)** for Firestore data fetching/caching (optional but recommended)

### 5.2 Backend / Database — Firebase
- **Firebase Authentication** — Admin login (email/password); optional customer OTP login
- **Cloud Firestore** — NoSQL database (schema below)
- **Firebase Storage** — Car images
- **Firebase Hosting** — Deployment
- **Cloud Functions (optional)** — Send email/SMS notification to admin when a new inquiry is submitted (e.g., via SendGrid/Twilio trigger)

### 5.3 Suggested Firestore Data Model

**`cars` collection**
```
cars/{carId}
{
  name: string,
  brand: string,
  category: "hatchback" | "sedan" | "suv" | "premium",
  images: [string, ...],        // Storage URLs
  transmission: "manual" | "automatic",
  fuelType: "petrol" | "diesel" | "electric" | "cng",
  seats: number,
  pricePerHour: number,
  pricePerDay: number,
  pricePerMonth: number | null,
  securityDeposit: number,
  features: [string, ...],      // ["AC","Bluetooth","Sunroof",...]
  citiesAvailable: [string, ...],
  isActive: boolean,
  rating: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**`inquiries` collection**
```
inquiries/{inquiryId}
{
  carId: string | null,         // null if general inquiry
  carName: string | null,
  customerName: string,
  phone: string,
  email: string,
  city: string,
  pickupDate: timestamp,
  returnDate: timestamp,
  pickupType: "delivery" | "self-pickup",
  message: string,
  status: "new" | "contacted" | "confirmed" | "closed",
  adminNotes: string,
  createdAt: timestamp
}
```

**`admins` collection**
```
admins/{uid}
{
  email: string,
  name: string,
  role: "superadmin" | "admin",
  createdAt: timestamp
}
```

### 5.4 Sample Firestore Security Rules (starting point)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /cars/{carId} {
      allow read: if true;
      allow write: if request.auth != null &&
                    exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /inquiries/{inquiryId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null &&
                    exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // manage via Firebase console / Cloud Function only
    }
  }
}
```

---

## 6. Site Map / Page Structure

```
/                         Home
/cars                     Car listing + filters
/cars/:carId              Car details + inquiry form
/contact                  General inquiry / contact
/about                    About us
/login                    Customer login (optional)
/my-inquiries             Customer's inquiry status (optional, auth required)

/admin/login              Admin login
/admin                    Admin dashboard
/admin/cars               Manage cars (list)
/admin/cars/new           Add car
/admin/cars/:carId/edit   Edit car
/admin/inquiries          Manage inquiries
/admin/inquiries/:id      Inquiry detail
```

---

## 7. Component Breakdown (Frontend)

```
src/
├── components/
│   ├── layout/          Navbar, Footer, AdminSidebar
│   ├── home/             HeroSearch, WhyChooseUs, CategoryCards, TestimonialSlider, FeaturedCarsCarousel
│   ├── cars/              CarCard, CarGrid, FilterSidebar, PriceRangeSlider, SortDropdown, CarSkeleton
│   ├── carDetails/     ImageGallery, SpecsTable, PricingCard, InquiryForm
│   ├── common/          Button, Input, Modal, Toast, Loader, EmptyState
│   └── admin/             CarTable, CarForm, InquiryTable, InquiryDetailDrawer, DashboardCards
├── pages/                 (route-level pages listed in sitemap)
├── hooks/                 useCars, useCarFilters, useInquiries, useAuth
├── context/                FilterContext / AuthContext
├── firebase/               firebaseConfig.js, carsService.js, inquiriesService.js, authService.js
├── utils/                   formatCurrency.js, dateHelpers.js, validators.js
└── App.jsx / main.jsx
```

---

## 8. Key User Flows

### 8.1 Browse & Filter → Inquire (primary flow)
1. User lands on Home → clicks "Cars" or a category card
2. Listing page loads cars from Firestore
3. User adjusts price range slider / category checkboxes → list updates (client-side filter on fetched data, or Firestore query re-fetch for large datasets)
4. User clicks a car → Car Details page
5. User fills inquiry form → submits → document created in `inquiries` with `status: "new"`
6. Success animation/toast shown; optional Cloud Function emails/SMS the admin

### 8.2 Admin Manages Inquiry
1. Admin logs in → Dashboard shows "New Inquiries" count
2. Admin opens Inquiries table → filters by "new"
3. Opens an inquiry → contacts customer externally → updates status to "contacted" → later "confirmed"/"closed"

### 8.3 Admin Manages Cars
1. Admin opens "Manage Cars" → clicks "Add Car"
2. Fills form, uploads images (Firebase Storage) → saves → new car appears live on public site instantly

---

## 9. Filter Logic Detail (Price Filter — your specific requirement)

- Default range: min = lowest `pricePerHour` in dataset, max = highest
- UI: dual-handle slider (e.g., using `rc-slider` or custom Tailwind + Framer Motion slider) showing "₹{min} – ₹{max} / hour"
- Toggle to switch filter basis between **per hour** and **per day** pricing
- Filtering approach:
  - **Small catalog (<500 cars):** fetch all active cars once, filter/sort client-side for instant, animated UI updates
  - **Larger catalog:** use Firestore compound queries (`where pricePerHour >= min`, `where pricePerHour <= max`) combined with category filters using composite indexes
- Filters combine with AND logic (price AND category AND transmission AND fuel AND city)
- URL query params reflect active filters (shareable/bookmarkable filtered links), e.g. `/cars?category=suv&minPrice=500&maxPrice=1500`

---

## 10. Design/UI Guidelines

- Clean, modern automotive feel — bold hero imagery, generous white space
- Primary brand color + neutral grays (Tailwind custom theme)
- Card-based layouts with soft shadows and rounded corners
- Micro-interactions: button hover scale, card lift-on-hover, animated skeleton loaders, smooth route transitions (Framer Motion `AnimatePresence`)
- Mobile-first: filter sidebar becomes a bottom sheet/drawer on mobile
- Consistent iconography (Lucide/Heroicons)

---

## 11. Milestones (Suggested Build Order)

| Phase | Deliverable |
|---|---|
| 1 | Project setup (Vite + React + Tailwind + Firebase config), routing skeleton |
| 2 | Firestore schema + seed sample car data; Home page UI |
| 3 | Car Listing page with filters, sort, animations |
| 4 | Car Details page + Inquiry form (writes to Firestore) |
| 5 | Admin auth + Admin Dashboard shell |
| 6 | Admin: Manage Cars (CRUD + image upload) |
| 7 | Admin: Manage Inquiries (status updates) |
| 8 | Polish: animations, responsiveness, SEO, security rules, deploy to Firebase Hosting |

---

## 12. Success Metrics
- Number of inquiries submitted per week
- Filter engagement rate (% of visitors who use filters)
- Car detail page → inquiry conversion rate
- Admin response time to new inquiries

---

*End of PRD*
