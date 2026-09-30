import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, User, Reservation, Order, Review, Dish } from '../types';
import { menuData } from '../data/menu';
import {
  isFirebaseConfigured,
  firebaseGoogleSignIn,
  firebaseEmailSignUp,
  firebaseEmailSignIn,
  firebaseSendPasswordReset,
  firebaseChangePassword,
  firebaseResendVerification,
  firebaseSignOut,
  onFirebaseAuthChange,
  mapFirebaseUser,
} from '../lib/firebase';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  initAuthListener: () => () => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;

  cart: CartItem[];
  addToCart: (dish: Dish, quantity?: number, instructions?: string) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => { subtotal: number; tax: number; deliveryFee: number; total: number };

  favorites: string[];
  toggleFavorite: (dishId: string) => void;
  isFavorite: (dishId: string) => boolean;

  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Reservation;
  cancelReservation: (id: string) => void;

  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Order;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  menuItems: Dish[];
  updateMenuItem: (id: string, data: Partial<Dish>) => void;
  addMenuItem: (dish: Dish) => void;
  deleteMenuItem: (id: string) => void;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      authReady: !isFirebaseConfigured,

      initAuthListener: () => {
        if (!isFirebaseConfigured) {
          set({ authReady: true })
          return () => {}
        }
        return onFirebaseAuthChange((fu) => {
          if (fu) {
            const mapped = mapFirebaseUser(fu)
            set({
              user: mapped,
              isAuthenticated: true,
              isAdmin: mapped.role === 'admin',
              favorites: get().favorites.length ? get().favorites : mapped.favorites,
              authReady: true,
            })
          } else {
            set({ user: null, isAuthenticated: false, isAdmin: false, authReady: true })
          }
        })
      },

      login: async (email, password) => {
        if (!isFirebaseConfigured) {
          return { success: false, error: 'Firebase is not configured. Add your Firebase keys to the .env file.' }
        }
        try {
          const fu = await firebaseEmailSignIn(email, password)
          if (!fu.emailVerified) {
            return {
              success: false,
              needsVerification: true,
              error: 'Please verify your email. Check your inbox for the confirmation link from Firebase.',
            }
          }
          const mapped = mapFirebaseUser(fu)
          set({
            user: mapped,
            isAuthenticated: true,
            isAdmin: mapped.role === 'admin',
            favorites: mapped.favorites,
          })
          return { success: true }
        } catch (e: any) {
          const msg = e?.code === 'auth/invalid-credential' || e?.code === 'auth/wrong-password'
            ? 'Invalid email or password.'
            : e?.code === 'auth/user-not-found'
            ? 'No account found with this email.'
            : e?.message || 'Login failed'
          return { success: false, error: msg }
        }
      },

      signup: async (name, email, password) => {
        if (!isFirebaseConfigured) {
          return { success: false, error: 'Firebase is not configured. Add your Firebase keys to the .env file.' }
        }
        try {
          if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' }
          const fu = await firebaseEmailSignUp(email, password, name)
          // Signed up but must verify email — sign out until verified
          await firebaseSignOut()
          set({ user: null, isAuthenticated: false, isAdmin: false })
          return {
            success: true,
            needsVerification: true,
          }
        } catch (e: any) {
          const msg = e?.code === 'auth/email-already-in-use'
            ? 'An account with this email already exists.'
            : e?.code === 'auth/weak-password'
            ? 'Password is too weak.'
            : e?.message || 'Signup failed'
          return { success: false, error: msg }
        }
      },

      loginWithGoogle: async () => {
        if (!isFirebaseConfigured) {
          return { success: false, error: 'Firebase is not configured. Add your Firebase keys to the .env file.' }
        }
        try {
          const fu = await firebaseGoogleSignIn()
          const mapped = mapFirebaseUser(fu)
          set({
            user: mapped,
            isAuthenticated: true,
            isAdmin: mapped.role === 'admin',
            favorites: get().favorites,
          })
          return { success: true }
        } catch (e: any) {
          if (e?.code === 'auth/popup-closed-by-user') {
            return { success: false, error: 'Sign-in cancelled.' }
          }
          return { success: false, error: e?.message || 'Google sign-in failed' }
        }
      },

      requestPasswordReset: async (email) => {
        if (!isFirebaseConfigured) {
          return { success: false, error: 'Firebase is not configured.' }
        }
        try {
          await firebaseSendPasswordReset(email)
          return { success: true }
        } catch (e: any) {
          return { success: false, error: e?.message || 'Could not send reset email' }
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        if (!isFirebaseConfigured) {
          return { success: false, error: 'Firebase is not configured.' }
        }
        try {
          if (newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters.' }
          await firebaseChangePassword(currentPassword, newPassword)
          return { success: true }
        } catch (e: any) {
          const msg = e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential'
            ? 'Current password is incorrect.'
            : e?.message || 'Could not change password'
          return { success: false, error: msg }
        }
      },

      resendVerificationEmail: async () => {
        if (!isFirebaseConfigured) return { success: false, error: 'Firebase is not configured.' }
        try {
          await firebaseResendVerification()
          return { success: true }
        } catch (e: any) {
          return { success: false, error: e?.message || 'Could not resend email' }
        }
      },

      logout: async () => {
        try {
          await firebaseSignOut()
        } catch {
          /* ignore */
        }
        set({ user: null, isAuthenticated: false, isAdmin: false })
      },

      updateProfile: (data) => set((s) => ({
        user: s.user ? { ...s.user, ...data } : null,
      })),

      cart: [],
      addToCart: (dish, quantity = 1, instructions) => {
        set((s) => {
          const existing = s.cart.find((c) => c.dish.id === dish.id);
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.dish.id === dish.id
                  ? { ...c, quantity: c.quantity + quantity, specialInstructions: instructions ?? c.specialInstructions }
                  : c
              ),
            };
          }
          return { cart: [...s.cart, { dish, quantity, specialInstructions: instructions }] };
        });
      },
      removeFromCart: (dishId) => set((s) => ({ cart: s.cart.filter((c) => c.dish.id !== dishId) })),
      updateQuantity: (dishId, quantity) =>
        set((s) => ({
          cart: quantity <= 0 ? s.cart.filter((c) => c.dish.id !== dishId) : s.cart.map((c) => (c.dish.id === dishId ? { ...c, quantity } : c)),
        })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        const { cart } = get();
        const subtotal = cart.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);
        const tax = Math.round(subtotal * 0.05);
        const deliveryFee = subtotal > 0 ? (subtotal > 1000 ? 0 : 49) : 0;
        return { subtotal, tax, deliveryFee, total: subtotal + tax + deliveryFee };
      },

      favorites: [],
      toggleFavorite: (dishId) =>
        set((s) => {
          const exists = s.favorites.includes(dishId);
          const favorites = exists ? s.favorites.filter((id) => id !== dishId) : [...s.favorites, dishId];
          return { favorites, user: s.user ? { ...s.user, favorites } : null };
        }),
      isFavorite: (dishId) => get().favorites.includes(dishId),

      reservations: [],
      addReservation: (res) => {
        const reservation: Reservation = { ...res, id: generateId('LUM'), status: 'confirmed', createdAt: new Date().toISOString() };
        set((s) => ({ reservations: [reservation, ...s.reservations] }));
        return reservation;
      },
      cancelReservation: (id) =>
        set((s) => ({
          reservations: s.reservations.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)),
        })),

      orders: [],
      placeOrder: (orderData) => {
        const order: Order = {
          ...orderData,
          id: generateId('LUM-ORD'),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ orders: [order, ...s.orders], cart: [] }));
        return order;
      },
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)),
        })),

      reviews: [
        { id: 'r1', userName: 'Aanya Sharma', userAvatar: 'https://i.pravatar.cc/100?u=aanya', rating: 5, comment: 'An unforgettable evening. The Truffle Risotto was pure luxury.', date: '2026-09-15' },
        { id: 'r2', userName: 'Rohan Mehta', userAvatar: 'https://i.pravatar.cc/100?u=rohan', rating: 5, comment: 'Best Korean glazed chicken I’ve had. Sophisticated yet warm ambiance.', date: '2026-09-10' },
        { id: 'r3', userName: 'Priya Nair', userAvatar: 'https://i.pravatar.cc/100?u=priya', rating: 4, comment: 'Beautiful private dining for our anniversary. Chef’s Table is worth it.', date: '2026-09-05' },
        { id: 'r4', userName: 'Arjun Kapoor', userAvatar: 'https://i.pravatar.cc/100?u=arjun', rating: 5, comment: 'The AI recommender suggested the perfect meal. Impressed by the detail.', date: '2026-08-28' },
      ],
      addReview: (review) => {
        const newReview: Review = { ...review, id: generateId('REV'), date: new Date().toISOString().slice(0, 10) };
        set((s) => ({ reviews: [newReview, ...s.reviews] }));
      },

      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      menuItems: menuData,
      updateMenuItem: (id, data) => set((s) => ({ menuItems: s.menuItems.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
      addMenuItem: (dish) => set((s) => ({ menuItems: [...s.menuItems, dish] })),
      deleteMenuItem: (id) => set((s) => ({ menuItems: s.menuItems.filter((d) => d.id !== id) })),
    }),
    {
      name: 'lumora-storage-v2',
      partialize: (s) => ({
        // Auth is owned by Firebase; only persist app data
        cart: s.cart,
        favorites: s.favorites,
        reservations: s.reservations,
        orders: s.orders,
        reviews: s.reviews,
        menuItems: s.menuItems,
      }),
    }
  )
);
