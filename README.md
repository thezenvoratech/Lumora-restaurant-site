# LUMORA — Modern Dining & Culinary Experience

Premium restaurant website with **real Google Sign-In**, **real email verification**, reservations, ordering, AI concierge, and admin dashboard.

## Tech
React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand · Firebase Auth

## Real authentication (required setup)

This project uses **Firebase Authentication** for:

- **Continue with Google** (OAuth popup)
- **Email / password signup** with a **real verification email**
- **Forgot password** with a **real reset email**
- **Change password** (for email/password accounts)

### 1. Create a Firebase project
1. Open [Firebase Console](https://console.firebase.google.com)
2. Create a project
3. **Authentication → Sign-in method** → enable:
   - **Email/Password**
   - **Google**
4. **Project settings → Your apps → Web** → register app → copy config

### 2. Add your keys
```bash
cp .env.example .env
```
Fill in:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAILS=thezenvoratech@gmail.com
```

`VITE_ADMIN_EMAILS` = comma-separated emails that get **Admin Dashboard** access after login.

### 3. Authorized domains
Firebase Console → Authentication → Settings → **Authorized domains**  
Add `localhost` (already there) and your production domain.

### 4. Run
```bash
npm install
npm run dev
```

Open http://localhost:5173

## Admin
Users whose email is listed in `VITE_ADMIN_EMAILS` see **Admin Dashboard** (menu management, orders, reservations).

Default admin email configured: `thezenvoratech@gmail.com`  
(Sign in with that Google account or create that email/password user in Firebase.)

## Features
- Google OAuth + email verification
- Menu search / filters / cart / checkout
- Table reservations
- AI dish recommendations (local engine)
- Role-based profile menu
- Admin menu CRUD + order status

Designed & crafted by Zenvora
