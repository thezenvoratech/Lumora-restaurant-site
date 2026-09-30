import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, ShoppingBag, Heart, User, Search, Star, Plus, Minus, 
  ChevronRight, MapPin, Phone, Mail, Clock, Sparkles, Utensils
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from './store/useStore'
import { menuData, categories } from './data/menu'
import { recommendDishes, recommendMeal, answerDietaryQuery } from './services/ai'
import { cn, formatPrice } from './utils/cn'
import type { Dish } from './types'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'

// ========== NAVBAR ==========
function Navbar() {
  const { cart, favorites, isAuthenticated, user, isAdmin, isCartOpen, setCartOpen, isMobileMenuOpen, setMobileMenuOpen, logout } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => { setProfileOpen(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/ai', label: 'AI Concierge' },
    { to: '/reserve', label: 'Reserve' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md py-3 border-b border-white/5' : 'bg-transparent py-5'
    )}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl md:text-3xl tracking-wide text-[#f5f0e8] hover:text-[#c9a84c] transition">
          LUMORA
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={cn(
              'text-sm tracking-wide transition hover:text-[#c9a84c]',
              location.pathname === l.to ? 'text-[#c9a84c]' : 'text-[#c9c0b0]'
            )}>{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/menu')} className="p-2 text-[#c9c0b0] hover:text-[#c9a84c] transition" aria-label="Search">
            <Search size={20} />
          </button>
          <button onClick={() => navigate('/favorites')} className="relative p-2 text-[#c9c0b0] hover:text-[#c9a84c] transition" aria-label="Favorites">
            <Heart size={20} />
            {favorites.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c9a84c] text-[#0a0a0a] text-[10px] font-bold rounded-full flex items-center justify-center">{favorites.length}</span>}
          </button>
          <button onClick={() => setCartOpen(true)} className="relative p-2 text-[#c9c0b0] hover:text-[#c9a84c] transition" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c9a84c] text-[#0a0a0a] text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="p-2 text-[#c9c0b0] hover:text-[#c9a84c] transition"
                aria-label="Profile"
                aria-expanded={profileOpen}
              >
                <User size={20} />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl p-2 z-50 shadow-xl border border-white/10">
                    <p className="px-3 py-2 text-sm text-[#c9a84c] font-medium truncate">{user?.name}</p>
                    <p className="px-3 pb-2 text-xs text-[#c9c0b0] truncate border-b border-white/5 mb-1">{user?.email}</p>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg">My Profile</Link>
                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg text-[#c9a84c]">Admin Dashboard</Link>
                    ) : (
                      <>
                        <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg">My Orders</Link>
                        <Link to="/favorites" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg">Favorites</Link>
                        <Link to="/reserve" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg">Reservations</Link>
                      </>
                    )}
                    <Link to="/change-password" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg">Change Password</Link>
                    <button
                      onClick={async () => { await logout(); setProfileOpen(false); toast.success('Logged out') }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg text-red-400 mt-1 border-t border-white/5"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex px-4 py-2 text-sm border border-[#c9a84c]/40 text-[#c9a84c] rounded-full hover:bg-[#c9a84c]/10 transition">Sign In</Link>
          )}
          <button className="lg:hidden p-2 text-[#c9c0b0]" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0a0a]/95 border-t border-white/5"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[#c9c0b0] hover:text-[#c9a84c]">{l.label}</Link>
              ))}
              <div className="border-t border-white/10 my-2" />
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[#c9c0b0] hover:text-[#c9a84c]">My Profile</Link>
                  {isAdmin ? (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[#c9a84c]">Admin Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[#c9c0b0] hover:text-[#c9a84c]">My Orders</Link>
                      <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[#c9c0b0] hover:text-[#c9a84c]">Favorites</Link>
                    </>
                  )}
                  <Link to="/change-password" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[#c9c0b0] hover:text-[#c9a84c]">Change Password</Link>
                  <button onClick={async () => { await logout(); setMobileMenuOpen(false); toast.success('Logged out') }} className="text-left py-2.5 text-red-400">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-[#c9a84c]">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ========== CART DRAWER ==========
function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeFromCart, cartTotal } = useStore()
  const navigate = useNavigate()
  const { subtotal, tax, deliveryFee, total } = cartTotal()

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setCartOpen(false)} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#141414] z-50 flex flex-col border-l border-white/5"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-display text-xl">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:text-[#c9a84c]"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#c9c0b0]">
                  <ShoppingBag size={40} className="mx-auto mb-4 opacity-40" />
                  <p>Your cart is empty</p>
                  <button onClick={() => { setCartOpen(false); navigate('/menu') }} className="mt-4 text-[#c9a84c] underline">Browse Menu</button>
                </div>
              ) : cart.map(item => (
                <div key={item.dish.id} className="flex gap-3 bg-[#1a1a1a] rounded-xl p-3">
                  <img src={item.dish.image} alt={item.dish.name} className="w-20 h-20 object-cover rounded-lg bg-[#1a1a1a]" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.dish.name}</h3>
                    <p className="text-[#c9a84c] text-sm mt-0.5">{formatPrice(item.dish.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.dish.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"><Minus size={14} /></button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.dish.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"><Plus size={14} /></button>
                      <button onClick={() => { removeFromCart(item.dish.id); toast.success('Removed') }} className="ml-auto text-xs text-red-400 hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm text-[#c9c0b0]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-[#c9c0b0]"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between text-sm text-[#c9c0b0]"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span></div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-white/5"><span>Total</span><span className="text-[#c9a84c]">{formatPrice(total)}</span></div>
                <button onClick={() => { setCartOpen(false); navigate('/checkout') }} className="w-full mt-3 py-3 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition">
                  Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ========== DISH CARD ==========
function DishCard({ dish }: { dish: Dish }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore()
  const fav = isFavorite(dish.id)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-[#c9a84c]/30 transition"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 bg-[#1a1a1a]" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }} />
        <button
          onClick={() => { toggleFavorite(dish.id); toast.success(fav ? 'Removed from favorites' : 'Added to favorites') }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition"
        >
          <Heart size={16} className={fav ? 'fill-[#c9a84c] text-[#c9a84c]' : 'text-white'} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {dish.dietary.includes('vegetarian') || dish.dietary.includes('vegan') ? (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-green-900/80 text-green-300 rounded">Veg</span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-red-900/80 text-red-300 rounded">Non-Veg</span>
          )}
          {dish.spiceLevel !== 'mild' && (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-orange-900/80 text-orange-300 rounded">{dish.spiceLevel}</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight">{dish.name}</h3>
          <span className="text-[#c9a84c] font-medium whitespace-nowrap">{formatPrice(dish.price)}</span>
        </div>
        <p className="text-sm text-[#c9c0b0] mt-1 line-clamp-2">{dish.description}</p>
        <div className="flex items-center gap-1 mt-2 text-sm text-[#c9c0b0]">
          <Star size={14} className="fill-[#c9a84c] text-[#c9a84c]" />
          <span>{dish.rating}</span>
          <span className="opacity-50">({dish.reviewCount})</span>
          <span className="ml-auto text-xs">{dish.prepTime} min</span>
        </div>
        <button
          onClick={() => { addToCart(dish); toast.success(`Added ${dish.name} to cart`) }}
          className="mt-3 w-full py-2.5 text-sm border border-[#c9a84c]/40 text-[#c9a84c] rounded-full hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition font-medium"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}

// ========== HOME PAGE ==========
function HomePage() {
  const navigate = useNavigate()
  const featured = menuData.filter(d => d.isFeatured)
  const { reviews } = useStore()

  return (
    <div className="grain">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80" alt="Restaurant" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[#c9a84c] tracking-[0.3em] text-sm uppercase mb-4">
            Modern Dining Experience
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-6">
            LUMORA
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xl md:text-2xl text-[#c9c0b0] font-display italic mb-4">
            Where Every Flavor Tells a Story.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-[#c9c0b0] max-w-xl mx-auto mb-10">
            An immersive dining experience where contemporary techniques meet timeless flavors.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/menu')} className="px-8 py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition">
              Explore Menu
            </button>
            <button onClick={() => navigate('/reserve')} className="px-8 py-3.5 border border-[#c9a84c]/50 text-[#c9a84c] rounded-full hover:bg-[#c9a84c]/10 transition">
              Reserve a Table
            </button>
          </motion.div>
        </div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#c9c0b0]/60">
          <ChevronRight size={24} className="rotate-90" />
        </motion.div>
      </section>

      {/* Signature Experiences */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl text-center mb-4">Signature Experiences</h2>
        <p className="text-center text-[#c9c0b0] mb-12 max-w-lg mx-auto">Curated moments designed to elevate every visit.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Chef's Table", desc: 'An intimate multi-course journey with our executive chef.', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80' },
            { title: 'Sunset Dining', desc: 'Golden-hour seating on the terrace with seasonal pairings.', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
            { title: 'Private Dining', desc: 'Exclusive rooms for celebrations and business gatherings.', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
            { title: 'Weekend Brunch', desc: 'Leisurely spreads every Saturday & Sunday, 11am–3pm.', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
          ].map((e, i) => (
            <motion.div key={e.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img src={e.img} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <h3 className="font-display text-2xl mb-1">{e.title}</h3>
                <p className="text-sm text-[#c9c0b0]">{e.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl mb-2">Featured Dishes</h2>
            <p className="text-[#c9c0b0]">Signatures that define the Lumora kitchen.</p>
          </div>
          <button onClick={() => navigate('/menu')} className="hidden sm:flex items-center gap-1 text-[#c9a84c] hover:underline">
            View Full Menu <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(d => <DishCard key={d.id} dish={d} />)}
        </div>
      </section>

      {/* Chef */}
      <section className="py-24 px-4 bg-[#141414]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80" alt="Chef Arjun Malhotra" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[#c9a84c] tracking-widest text-sm uppercase mb-3">Executive Chef</p>
            <h2 className="font-display text-4xl md:text-5xl mb-4">Arjun Malhotra</h2>
            <p className="text-[#c9c0b0] leading-relaxed mb-4">
              With over 18 years spanning Michelin-starred kitchens in London, Singapore and Mumbai, Chef Arjun brings a philosophy of restraint and precision. Every plate at Lumora is an exploration of memory, technique and the quiet beauty of seasonal produce.
            </p>
            <p className="text-[#c9c0b0] leading-relaxed italic font-display text-lg">
              “Flavor should whisper before it sings.”
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl text-center mb-12">Guest Stories</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, 4).map(r => (
            <div key={r.id} className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <img src={r.userAvatar} alt={r.userName} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium text-sm">{r.userName}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-[#c9a84c] text-[#c9a84c]" />)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#c9c0b0] leading-relaxed">“{r.comment}”</p>
              <p className="text-xs text-[#c9c0b0]/60 mt-3">{r.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <h2 className="font-display text-4xl md:text-6xl mb-4">Your table is waiting.</h2>
        <p className="text-[#c9c0b0] mb-8">Join us for an evening of stories told through flavor.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/reserve')} className="px-8 py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition">Reserve Now</button>
          <button onClick={() => navigate('/menu')} className="px-8 py-3.5 border border-[#c9a84c]/50 text-[#c9a84c] rounded-full hover:bg-[#c9a84c]/10 transition">Explore Menu</button>
        </div>
      </section>
    </div>
  )
}

// ========== MENU PAGE ==========
function MenuPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [dietary, setDietary] = useState<string[]>([])
  const [sort, setSort] = useState('popular')
  const { menuItems } = useStore()

  let filtered = menuItems.filter(d => d.isAvailable)
  if (cat !== 'all') filtered = filtered.filter(d => d.category.includes(cat as any))
  if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()))
  if (dietary.includes('vegetarian')) filtered = filtered.filter(d => d.dietary.includes('vegetarian') || d.dietary.includes('vegan'))
  if (dietary.includes('vegan')) filtered = filtered.filter(d => d.dietary.includes('vegan'))
  if (dietary.includes('non-vegetarian')) filtered = filtered.filter(d => d.dietary.includes('non-vegetarian'))
  if (dietary.includes('spicy')) filtered = filtered.filter(d => d.spiceLevel === 'hot' || d.spiceLevel === 'extra-hot')

  if (sort === 'popular') filtered = [...filtered].sort((a, b) => b.popularity - a.popularity)
  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating)

  const toggleDiet = (d: string) => setDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  return (
    <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-2">Menu</h1>
      <p className="text-[#c9c0b0] mb-8">Indian · Asian · Continental</p>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9c0b0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-full text-sm focus:border-[#c9a84c]/50 outline-none"
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-full text-sm outline-none">
          <option value="popular">Popular</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} className={cn(
            'px-4 py-1.5 rounded-full text-sm transition',
            cat === c.id ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#c9c0b0] hover:bg-white/5'
          )}>{c.label}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {['vegetarian', 'vegan', 'non-vegetarian', 'spicy'].map(d => (
          <button key={d} onClick={() => toggleDiet(d)} className={cn(
            'px-3 py-1 rounded-full text-xs capitalize border transition',
            dietary.includes(d) ? 'border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/10' : 'border-white/10 text-[#c9c0b0]'
          )}>{d}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#c9c0b0]">No dishes match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(d => <DishCard key={d.id} dish={d} />)}
        </div>
      )}
    </div>
  )
}

// ========== AI PAGE ==========
function AIPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ReturnType<typeof recommendDishes>>([])
  const [dietaryAns, setDietaryAns] = useState<{ answer: string; dishes: Dish[] } | null>(null)
  const [meal, setMeal] = useState<ReturnType<typeof recommendMeal> | null>(null)
  const [loading, setLoading] = useState(false)
  const { addToCart } = useStore()

  const handleRecommend = () => {
    if (!query.trim()) return
    setLoading(true)
    setTimeout(() => {
      setResults(recommendDishes(query))
      setDietaryAns(null)
      setMeal(null)
      setLoading(false)
    }, 600)
  }

  const handleDietary = () => {
    if (!query.trim()) return
    setLoading(true)
    setTimeout(() => {
      setDietaryAns(answerDietaryQuery(query))
      setResults([])
      setMeal(null)
      setLoading(false)
    }, 600)
  }

  const handleSurprise = () => {
    setLoading(true)
    setTimeout(() => {
      setMeal(recommendMeal({ vegetarian: false, spiceLevel: 'medium' }))
      setResults([])
      setDietaryAns(null)
      setLoading(false)
    }, 700)
  }

  return (
    <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-[#c9a84c] mb-3">
          <Sparkles size={20} />
          <span className="tracking-widest text-sm uppercase">LUMORA AI</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl mb-3">Tell us what you're craving.</h1>
        <p className="text-[#c9c0b0]">Our AI recommends from the actual Lumora menu — never invented dishes.</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 mb-8">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='e.g. "I want something spicy but not too heavy" or "high protein vegetarian"'
          className="w-full bg-transparent border-none outline-none resize-none text-sm min-h-[80px] placeholder:text-[#c9c0b0]/50"
        />
        <div className="flex flex-wrap gap-3 mt-4">
          <button onClick={handleRecommend} disabled={loading} className="px-5 py-2.5 bg-[#c9a84c] text-[#0a0a0a] text-sm font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
            {loading ? 'Thinking…' : 'Recommend Dishes'}
          </button>
          <button onClick={handleDietary} disabled={loading} className="px-5 py-2.5 border border-[#c9a84c]/40 text-[#c9a84c] text-sm rounded-full hover:bg-[#c9a84c]/10 transition">
            Ask Dietary Question
          </button>
          <button onClick={handleSurprise} disabled={loading} className="px-5 py-2.5 border border-white/20 text-sm rounded-full hover:bg-white/5 transition flex items-center gap-2">
            <Utensils size={16} /> Surprise Me
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Recommended for you</h2>
          {results.map(r => (
            <div key={r.dish.id} className="flex gap-4 bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <img src={r.dish.image} alt={r.dish.name} className="w-24 h-24 object-cover rounded-lg bg-[#1a1a1a]" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{r.dish.name}</h3>
                  <span className="text-[#c9a84c]">{formatPrice(r.dish.price)}</span>
                </div>
                <p className="text-sm text-[#c9c0b0] mt-1">{r.reason}</p>
                <button onClick={() => { addToCart(r.dish); toast.success('Added to cart') }} className="mt-2 text-sm text-[#c9a84c] hover:underline">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dietaryAns && (
        <div className="space-y-4">
          <p className="text-[#c9c0b0]">{dietaryAns.answer}</p>
          <p className="text-xs text-[#c9c0b0]/60">Food information is based on restaurant-provided ingredient data. Please inform our staff about allergies before ordering.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {dietaryAns.dishes.map(d => <DishCard key={d.id} dish={d} />)}
          </div>
        </div>
      )}

      {meal && (
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#c9a84c]/20">
          <h2 className="font-display text-2xl mb-2">Your Lumora Meal</h2>
          <p className="text-sm text-[#c9c0b0] mb-6">{meal.explanation}</p>
          <div className="space-y-3">
            {meal.starter && <div className="flex justify-between text-sm"><span>Starter: {meal.starter.name}</span><span>{formatPrice(meal.starter.price)}</span></div>}
            {meal.main && <div className="flex justify-between text-sm"><span>Main: {meal.main.name}</span><span>{formatPrice(meal.main.price)}</span></div>}
            {meal.dessert && <div className="flex justify-between text-sm"><span>Dessert: {meal.dessert.name}</span><span>{formatPrice(meal.dessert.price)}</span></div>}
            {meal.drink && <div className="flex justify-between text-sm"><span>Drink: {meal.drink.name}</span><span>{formatPrice(meal.drink.price)}</span></div>}
          </div>
          <div className="flex justify-between font-medium mt-4 pt-4 border-t border-white/10">
            <span>Total</span>
            <span className="text-[#c9a84c]">{formatPrice(meal.total)}</span>
          </div>
          <button
            onClick={() => {
              [meal.starter, meal.main, meal.dessert, meal.drink].filter(Boolean).forEach(d => addToCart(d!))
              toast.success('Entire meal added to cart')
            }}
            className="w-full mt-4 py-3 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition"
          >
            Add Entire Meal to Cart
          </button>
        </div>
      )}
    </div>
  )
}

// ========== RESERVE PAGE ==========
function ReservePage() {
  const { addReservation } = useStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '19:00', guests: 2, seating: 'indoor' as const, specialRequest: '' })
  const [confirmed, setConfirmed] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.date) {
      toast.error('Please fill all required fields')
      return
    }
    const selected = new Date(form.date + 'T' + form.time)
    if (selected < new Date()) {
      toast.error('Cannot reserve in the past')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const res = addReservation(form)
      setConfirmed(res.id)
      setLoading(false)
      toast.success('Reservation confirmed!')
    }, 800)
  }

  if (confirmed) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-lg mx-auto text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a1a1a] rounded-2xl p-10 border border-[#c9a84c]/30">
          <div className="w-16 h-16 rounded-full bg-[#c9a84c]/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-[#c9a84c]" size={28} />
          </div>
          <h1 className="font-display text-3xl mb-2">Your table is reserved.</h1>
          <p className="text-[#c9c0b0] mb-4">Reservation ID</p>
          <p className="text-2xl text-[#c9a84c] font-mono mb-6">{confirmed}</p>
          <p className="text-sm text-[#c9c0b0]">We look forward to welcoming you, {form.name}.</p>
          <button onClick={() => setConfirmed(null)} className="mt-8 text-sm text-[#c9a84c] hover:underline">Make another reservation</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 px-4 max-w-xl mx-auto">
      <h1 className="font-display text-4xl mb-2">Reserve a Table</h1>
      <p className="text-[#c9c0b0] mb-8">We hold tables for 15 minutes past reservation time.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'email', 'phone'].map(f => (
          <input
            key={f}
            required
            type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'}
            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
            value={(form as any)[f]}
            onChange={e => setForm({ ...form, [f]: e.target.value })}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50"
          />
        ))}
        <div className="grid grid-cols-2 gap-4">
          <input required type="date" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={e => setForm({ ...form, date: e.target.value })} className="px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none" />
          <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none">
            {['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select value={form.guests} onChange={e => setForm({ ...form, guests: +e.target.value })} className="px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
          </select>
          <select value={form.seating} onChange={e => setForm({ ...form, seating: e.target.value as any })} className="px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none">
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="window">Window</option>
            <option value="private">Private Dining</option>
          </select>
        </div>
        <textarea placeholder="Special requests (optional)" value={form.specialRequest} onChange={e => setForm({ ...form, specialRequest: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none min-h-[80px]" />
        <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
          {loading ? 'Confirming…' : 'Confirm Reservation'}
        </button>
      </form>
    </div>
  )
}

// ========== LOGIN ==========
function LoginPage() {
  const { login, signup, loginWithGoogle, requestPasswordReset } = useStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup' | 'verify' | 'forgot'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyEmailAddr, setVerifyEmailAddr] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.success) {
      toast.success('Welcome back!')
      navigate('/')
    } else if (res.needsVerification) {
      setVerifyEmailAddr(email)
      setMode('verify')
      toast.error(res.error || 'Email not verified')
    } else {
      toast.error(res.error || 'Login failed')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signup(name, email, password)
    setLoading(false)
    if (res.success && res.needsVerification) {
      setVerifyEmailAddr(email)
      setMode('verify')
      toast.success('Verification email sent! Check your inbox.')
    } else if (!res.success) {
      toast.error(res.error || 'Signup failed')
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const res = await loginWithGoogle()
    setLoading(false)
    if (res.success) {
      toast.success('Signed in with Google')
      navigate('/')
    } else if (res.error && res.error !== 'Sign-in cancelled.') {
      toast.error(res.error)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await requestPasswordReset(email)
    setLoading(false)
    if (res.success) {
      toast.success('Password reset email sent. Check your inbox.')
      setMode('login')
    } else {
      toast.error(res.error || 'Could not send reset email')
    }
  }

  return (
    <div className="pt-28 pb-20 px-4 max-w-md mx-auto">
      <h1 className="font-display text-4xl mb-2">
        {mode === 'login' && 'Welcome Back'}
        {mode === 'signup' && 'Create Account'}
        {mode === 'verify' && 'Verify Your Email'}
        {mode === 'forgot' && 'Reset Password'}
      </h1>
      <p className="text-[#c9c0b0] text-sm mb-8">
        {mode === 'login' && 'Sign in with Google or your email.'}
        {mode === 'signup' && 'Create an account — we will send a real verification email.'}
        {mode === 'verify' && `We sent a verification link to ${verifyEmailAddr || 'your email'}. Open it, then sign in.`}
        {mode === 'forgot' && 'Enter your email and we will send a password reset link.'}
      </p>

      {(mode === 'login' || mode === 'signup') && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 mb-4 flex items-center justify-center gap-3 bg-white text-[#0a0a0a] font-medium rounded-full hover:bg-gray-100 transition disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-[#c9c0b0]">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </>
      )}

      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
            {loading ? 'Please wait…' : 'Sign In'}
          </button>
          <button type="button" onClick={() => setMode('forgot')} className="w-full text-sm text-[#c9c0b0] hover:text-[#c9a84c]">Forgot password?</button>
        </form>
      )}

      {mode === 'signup' && (
        <form onSubmit={handleSignup} className="space-y-4">
          <input required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <input required type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      )}

      {mode === 'verify' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#c9a84c]/30 text-sm text-[#c9c0b0]">
            <p className="mb-2">1. Open the verification email from Firebase</p>
            <p className="mb-2">2. Click the confirmation link</p>
            <p>3. Return here and sign in</p>
          </div>
          <button onClick={() => setMode('login')} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition">
            Go to Sign In
          </button>
        </div>
      )}

      {mode === 'forgot' && (
        <form onSubmit={handleForgot} className="space-y-4">
          <input required type="email" placeholder="Registered email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-[#c9c0b0]">
        {mode === 'login' && (
          <button onClick={() => setMode('signup')} className="text-[#c9a84c] hover:underline">Don&apos;t have an account? Sign up</button>
        )}
        {(mode === 'signup' || mode === 'forgot' || mode === 'verify') && (
          <button onClick={() => setMode('login')} className="text-[#c9a84c] hover:underline">Back to Sign In</button>
        )}
      </div>
    </div>
  )
}

// ========== CHECKOUT ==========
function CheckoutPage() {
  const { cart, cartTotal, placeOrder, clearCart } = useStore()
  const navigate = useNavigate()
  const { subtotal, tax, deliveryFee, total } = cartTotal()
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', payment: 'cod' as const })
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  if (cart.length === 0 && !orderId) {
    return (
      <div className="pt-28 pb-20 text-center">
        <p className="text-[#c9c0b0]">Your cart is empty.</p>
        <button onClick={() => navigate('/menu')} className="mt-4 text-[#c9a84c] underline">Browse Menu</button>
      </div>
    )
  }

  if (orderId) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-lg mx-auto text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a1a1a] rounded-2xl p-10 border border-[#c9a84c]/30">
          <h1 className="font-display text-3xl mb-2">Order Confirmed</h1>
          <p className="text-[#c9c0b0] mb-2">Order ID</p>
          <p className="text-xl text-[#c9a84c] font-mono mb-6">{orderId}</p>
          <p className="text-sm text-[#c9c0b0]">We'll notify you as your order progresses.</p>
          <button onClick={() => navigate('/orders')} className="mt-8 px-6 py-2.5 bg-[#c9a84c] text-[#0a0a0a] rounded-full text-sm font-medium">View Orders</button>
        </motion.div>
      </div>
    )
  }

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const order = placeOrder({
        items: cart,
        subtotal, tax, deliveryFee, discount: 0, total,
        paymentMethod: form.payment,
        deliveryAddress: form.address,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
      })
      setOrderId(order.id)
      setLoading(false)
      toast.success('Order placed successfully!')
    }, 1200)
  }

  return (
    <div className="pt-28 pb-20 px-4 max-w-xl mx-auto">
      <h1 className="font-display text-4xl mb-8">Checkout</h1>
      <form onSubmit={handle} className="space-y-4">
        {['name', 'phone', 'email', 'address'].map(f => (
          <input key={f} required placeholder={f === 'address' ? 'Delivery Address' : f.charAt(0).toUpperCase() + f.slice(1)}
            value={(form as any)[f]} onChange={e => setForm({ ...form, [f]: e.target.value })}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none" />
        ))}
        <select value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value as any })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none">
          <option value="cod">Cash on Delivery</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="online">Mock Online Payment</option>
        </select>
        <div className="bg-[#1a1a1a] rounded-xl p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-[#c9c0b0]">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#c9c0b0]">Tax</span><span>{formatPrice(tax)}</span></div>
          <div className="flex justify-between"><span className="text-[#c9c0b0]">Delivery</span><span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span></div>
          <div className="flex justify-between font-medium pt-2 border-t border-white/10"><span>Total</span><span className="text-[#c9a84c]">{formatPrice(total)}</span></div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
          {loading ? 'Processing…' : 'Place Order'}
        </button>
      </form>
    </div>
  )
}

// ========== SIMPLE PAGES ==========
function AboutPage() {
  return (
    <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-6">Our Story</h1>
      <div className="space-y-6 text-[#c9c0b0] leading-relaxed">
        <p>Lumora was born from a simple belief: that every meal is a story waiting to be told. Founded in 2022 by Chef Arjun Malhotra and hospitality visionary Meera Shah, we set out to create a space where Indian soul, Asian precision and Continental elegance converge.</p>
        <p>Our kitchen works exclusively with seasonal produce, responsibly sourced seafood and heritage grains. We believe in the quiet power of technique — the long fermentation, the precise sear, the patient reduction.</p>
        <h2 className="font-display text-2xl text-[#f5f0e8] pt-4">Philosophy</h2>
        <p>Restraint over excess. Memory over trend. Hospitality as an art form.</p>
        <h2 className="font-display text-2xl text-[#f5f0e8] pt-4">Sustainability</h2>
        <p>We compost, partner with local farms within 150 km, and have eliminated single-use plastics from our operations.</p>
      </div>
    </div>
  )
}

function ContactPage() {
  const [sent, setSent] = useState(false)
  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    toast.success('Message sent successfully.')
  }
  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="font-display text-4xl mb-6">Contact</h1>
        <div className="space-y-4 text-[#c9c0b0]">
          <p className="flex items-center gap-3"><MapPin size={18} className="text-[#c9a84c]" /> 42, Lotus Boulevard, Bandra West, Mumbai 400050</p>
          <p className="flex items-center gap-3"><Phone size={18} className="text-[#c9a84c]" /> +91 22 4567 8901</p>
          <p className="flex items-center gap-3"><Mail size={18} className="text-[#c9a84c]" /> hello@lumora.dining</p>
          <p className="flex items-center gap-3"><Clock size={18} className="text-[#c9a84c]" /> Tue–Sun: 12:00–15:00 · 19:00–23:30</p>
        </div>
      </div>
      <form onSubmit={handle} className="space-y-4">
        {sent ? <p className="text-[#c9a84c]">Thank you. We'll respond within 24 hours.</p> : (
          <>
            <input required placeholder="Name" className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none" />
            <input required type="email" placeholder="Email" className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none" />
            <input required placeholder="Subject" className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none" />
            <textarea required placeholder="Message" className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none min-h-[120px]" />
            <button type="submit" className="px-8 py-3 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition">Send Message</button>
          </>
        )}
      </form>
    </div>
  )
}

function ProfilePage() {
  const { user, orders, reservations, favorites, isAuthenticated, isAdmin, logout } = useStore()
  const navigate = useNavigate()
  if (!isAuthenticated) { navigate('/login'); return null }
  return (
    <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl mb-6">My Profile</h1>
      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-medium">{user?.name}</p>
            <p className="text-[#c9c0b0] text-sm">{user?.email}</p>
            {isAdmin && <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-[#c9a84c]/20 text-[#c9a84c] rounded">Admin</span>}
          </div>
          <button onClick={async () => { await logout(); toast.success('Logged out'); navigate('/') }} className="text-sm text-red-400 hover:underline">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {isAdmin ? (
          <>
            <Link to="/admin" className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-[#c9a84c]/30 hover:border-[#c9a84c] transition">
              <p className="text-2xl font-medium text-[#c9a84c]">★</p>
              <p className="text-xs text-[#c9a84c] mt-1">Admin</p>
            </Link>
            <Link to="/change-password" className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5 hover:border-[#c9a84c]/30 transition">
              <p className="text-2xl font-medium text-[#c9a84c]">🔑</p>
              <p className="text-xs text-[#c9c0b0] mt-1">Password</p>
            </Link>
            <Link to="/menu" className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5 hover:border-[#c9a84c]/30 transition col-span-2">
              <p className="text-2xl font-medium text-[#c9a84c]">→</p>
              <p className="text-xs text-[#c9c0b0] mt-1">View Menu</p>
            </Link>
          </>
        ) : (
          <>
            <Link to="/orders" className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5 hover:border-[#c9a84c]/30 transition">
              <p className="text-2xl font-medium text-[#c9a84c]">{orders.length}</p>
              <p className="text-xs text-[#c9c0b0] mt-1">Orders</p>
            </Link>
            <Link to="/favorites" className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5 hover:border-[#c9a84c]/30 transition">
              <p className="text-2xl font-medium text-[#c9a84c]">{favorites.length}</p>
              <p className="text-xs text-[#c9c0b0] mt-1">Favorites</p>
            </Link>
            <Link to="/reserve" className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5 hover:border-[#c9a84c]/30 transition">
              <p className="text-2xl font-medium text-[#c9a84c]">{reservations.length}</p>
              <p className="text-xs text-[#c9c0b0] mt-1">Reservations</p>
            </Link>
            <Link to="/change-password" className="bg-[#1a1a1a] rounded-xl p-4 text-center border border-white/5 hover:border-[#c9a84c]/30 transition">
              <p className="text-2xl font-medium text-[#c9a84c]">🔑</p>
              <p className="text-xs text-[#c9c0b0] mt-1">Password</p>
            </Link>
          </>
        )}
      </div>

      <h2 className="font-display text-2xl mb-4">Recent Orders</h2>
      {orders.length === 0 ? <p className="text-[#c9c0b0] text-sm mb-8">No orders yet. <Link to="/menu" className="text-[#c9a84c] underline">Browse menu</Link></p> : (
        <div className="space-y-3 mb-8">
          {orders.slice(0, 5).map(o => (
            <div key={o.id} className="bg-[#1a1a1a] rounded-xl p-4 flex justify-between text-sm border border-white/5">
              <div><p className="font-mono text-[#c9a84c]">{o.id}</p><p className="text-[#c9c0b0] capitalize">{o.status}</p></div>
              <p>{formatPrice(o.total)}</p>
            </div>
          ))}
        </div>
      )}
      <h2 className="font-display text-2xl mb-4">Reservations</h2>
      {reservations.length === 0 ? <p className="text-[#c9c0b0] text-sm">No reservations yet. <Link to="/reserve" className="text-[#c9a84c] underline">Book a table</Link></p> : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="bg-[#1a1a1a] rounded-xl p-4 text-sm border border-white/5">
              <p className="font-mono text-[#c9a84c]">{r.id}</p>
              <p className="text-[#c9c0b0]">{r.date} at {r.time} · {r.guests} guests · <span className="capitalize">{r.status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FavoritesPage() {
  const { favorites, menuItems } = useStore()
  const dishes = menuItems.filter(d => favorites.includes(d.id))
  return (
    <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl mb-8">My Favorites</h1>
      {dishes.length === 0 ? <p className="text-[#c9c0b0]">No favorites yet. Heart a dish to save it.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map(d => <DishCard key={d.id} dish={d} />)}
        </div>
      )}
    </div>
  )
}

function OrdersPage() {
  const { orders, isAuthenticated } = useStore()
  const navigate = useNavigate()
  if (!isAuthenticated) { navigate('/login'); return null }
  return (
    <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl mb-8">My Orders</h1>
      {orders.length === 0 ? <p className="text-[#c9c0b0]">No orders yet.</p> : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
              <div className="flex justify-between mb-3">
                <span className="font-mono text-[#c9a84c]">{o.id}</span>
                <span className="text-sm capitalize px-2 py-0.5 bg-white/5 rounded">{o.status}</span>
              </div>
              <p className="text-sm text-[#c9c0b0] mb-2">{new Date(o.createdAt).toLocaleString()}</p>
              <ul className="text-sm space-y-1">
                {o.items.map(i => <li key={i.dish.id}>{i.quantity}× {i.dish.name}</li>)}
              </ul>
              <p className="mt-3 font-medium text-[#c9a84c]">{formatPrice(o.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminPage() {
  const { isAdmin, orders, reservations, menuItems, updateOrderStatus, updateMenuItem, deleteMenuItem } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'overview' | 'orders' | 'menu' | 'reservations'>('overview')
  if (!isAdmin) { navigate('/'); return null }
  const revenue = orders.reduce((s, o) => s + o.total, 0)

  return (
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
      <h1 className="font-display text-4xl mb-2">Admin Dashboard</h1>
      <p className="text-[#c9c0b0] text-sm mb-8">Manage orders, menu and reservations</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {(['overview', 'orders', 'menu', 'reservations'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'px-4 py-2 rounded-full text-sm capitalize transition',
            tab === t ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#c9c0b0] hover:bg-white/5'
          )}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Revenue', value: formatPrice(revenue) },
            { label: 'Reservations', value: reservations.filter(r => r.status !== 'cancelled').length },
            { label: 'Menu Items', value: menuItems.length },
          ].map(s => (
            <div key={s.label} className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
              <p className="text-sm text-[#c9c0b0]">{s.label}</p>
              <p className="text-2xl font-medium mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          <h2 className="font-display text-2xl mb-4">Orders</h2>
          {orders.length === 0 && <p className="text-[#c9c0b0]">No orders yet.</p>}
          {orders.map(o => (
            <div key={o.id} className="bg-[#1a1a1a] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm border border-white/5">
              <div>
                <span className="font-mono text-[#c9a84c]">{o.id}</span>
                <p className="text-[#c9c0b0] text-xs mt-0.5">{o.customerName} · {o.items.length} items</p>
              </div>
              <span className="font-medium">{formatPrice(o.total)}</span>
              <select value={o.status} onChange={e => { updateOrderStatus(o.id, e.target.value as any); toast.success('Status updated') }} className="px-3 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs">
                {['confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === 'menu' && (
        <div className="space-y-3">
          <h2 className="font-display text-2xl mb-4">Menu Management</h2>
          <p className="text-sm text-[#c9c0b0] mb-4">Toggle availability or update price. Changes persist locally.</p>
          {menuItems.map(d => (
            <div key={d.id} className="bg-[#1a1a1a] rounded-xl p-4 flex flex-wrap items-center gap-4 text-sm border border-white/5">
              <img src={d.image} alt={d.name} className="w-14 h-14 object-cover rounded-lg bg-[#0a0a0a]" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }} />
              <div className="flex-1 min-w-[140px]">
                <p className="font-medium">{d.name}</p>
                <p className="text-[#c9c0b0] text-xs">{d.category.join(', ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#c9c0b0] text-xs">₹</span>
                <input
                  type="number"
                  value={d.price}
                  onChange={e => updateMenuItem(d.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-20 px-2 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm outline-none"
                />
              </div>
              <button
                onClick={() => { updateMenuItem(d.id, { isAvailable: !d.isAvailable }); toast.success(d.isAvailable ? 'Marked unavailable' : 'Marked available') }}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium', d.isAvailable ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300')}
              >
                {d.isAvailable ? 'Available' : 'Unavailable'}
              </button>
              <button
                onClick={() => { if (confirm(`Delete ${d.name}?`)) { deleteMenuItem(d.id); toast.success('Dish removed') } }}
                className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/20 rounded-lg"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'reservations' && (
        <div className="space-y-3">
          <h2 className="font-display text-2xl mb-4">Reservations</h2>
          {reservations.length === 0 && <p className="text-[#c9c0b0]">No reservations yet.</p>}
          {reservations.map(r => (
            <div key={r.id} className="bg-[#1a1a1a] rounded-xl p-4 text-sm border border-white/5">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-[#c9a84c]">{r.id}</span>
                <span className={cn('px-2 py-0.5 rounded text-xs capitalize', r.status === 'confirmed' ? 'bg-green-900/40 text-green-300' : 'bg-white/10 text-[#c9c0b0]')}>{r.status}</span>
              </div>
              <p className="mt-2">{r.name} · {r.guests} guests · {r.seating}</p>
              <p className="text-[#c9c0b0] text-xs">{r.date} at {r.time} · {r.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function ChangePasswordPage() {
  const { isAuthenticated, changePassword, requestPasswordReset, user } = useStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'change' | 'forgot'>('change')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next !== confirm) { toast.error('New passwords do not match'); return }
    setLoading(true)
    const res = await changePassword(current, next)
    setLoading(false)
    if (res.success) {
      toast.success('Password changed successfully')
      setCurrent(''); setNext(''); setConfirm('')
    } else toast.error(res.error || 'Failed')
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) { toast.error('No email on account'); return }
    setLoading(true)
    const res = await requestPasswordReset(user.email)
    setLoading(false)
    if (res.success) {
      toast.success('Password reset link sent to your email')
      setMode('change')
    } else toast.error(res.error || 'Failed')
  }

  return (
    <div className="pt-28 pb-20 px-4 max-w-md mx-auto">
      <h1 className="font-display text-4xl mb-2">
        {mode === 'change' ? 'Change Password' : 'Forgot Password'}
      </h1>
      <p className="text-[#c9c0b0] text-sm mb-8">
        {mode === 'change' && 'Enter your current password and choose a new one. (Email/password accounts only — Google users manage password in Google Account settings.)'}
        {mode === 'forgot' && 'We will send a real password reset link to your registered email via Firebase.'}
      </p>

      {mode === 'change' && (
        <form onSubmit={handleChange} className="space-y-4">
          <input required type="password" placeholder="Current password" value={current} onChange={e => setCurrent(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <input required type="password" placeholder="New password (min 6 characters)" value={next} onChange={e => setNext(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <input required type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm outline-none focus:border-[#c9a84c]/50" />
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
            {loading ? 'Updating…' : 'Update Password'}
          </button>
          <button type="button" onClick={() => setMode('forgot')} className="w-full text-sm text-[#c9c0b0] hover:text-[#c9a84c]">
            Forgot current password?
          </button>
        </form>
      )}

      {mode === 'forgot' && (
        <form onSubmit={handleForgot} className="space-y-4">
          <p className="text-sm text-[#c9c0b0]">Reset link will be sent to <span className="text-[#c9a84c]">{user?.email}</span></p>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#c9a84c] text-[#0a0a0a] font-medium rounded-full hover:bg-[#e0c56e] transition disabled:opacity-50">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
          <button type="button" onClick={() => setMode('change')} className="w-full text-sm text-[#c9a84c] hover:underline">Back</button>
        </form>
      )}
    </div>
  )
}

// ========== FOOTER ==========
function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <p className="font-display text-2xl mb-2">LUMORA</p>
          <p className="text-sm text-[#c9c0b0]">Where Every Flavor Tells a Story.</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-3 text-[#c9a84c]">Explore</p>
          <div className="flex flex-col gap-2 text-sm text-[#c9c0b0]">
            <Link to="/menu" className="hover:text-[#c9a84c]">Menu</Link>
            <Link to="/reserve" className="hover:text-[#c9a84c]">Reservations</Link>
            <Link to="/ai" className="hover:text-[#c9a84c]">AI Concierge</Link>
            <Link to="/about" className="hover:text-[#c9a84c]">About</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-3 text-[#c9a84c]">Contact</p>
          <div className="text-sm text-[#c9c0b0] space-y-1">
            <p>42, Lotus Boulevard</p>
            <p>Bandra West, Mumbai</p>
            <p>+91 22 4567 8901</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-3 text-[#c9a84c]">Newsletter</p>
          <p className="text-sm text-[#c9c0b0] mb-3">Get culinary stories and offers.</p>
          <form onSubmit={e => { e.preventDefault(); toast.success('Subscribed!') }} className="flex gap-2">
            <input type="email" required placeholder="Email" className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-full text-sm outline-none" />
            <button type="submit" className="px-4 py-2 bg-[#c9a84c] text-[#0a0a0a] text-sm rounded-full font-medium">Join</button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5 text-xs text-[#c9c0b0]/60">
        <p>© 2026 Lumora. All rights reserved.</p>
        <p>Designed & crafted by Zenvora</p>
      </div>
    </footer>
  )
}

// ========== APP ==========
export default function App() {
  const initAuthListener = useStore(s => s.initAuthListener)
  useEffect(() => {
    const unsub = initAuthListener()
    return unsub
  }, [initAuthListener])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/reserve" element={<ReservePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
