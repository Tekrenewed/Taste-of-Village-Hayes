import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, LayoutDashboard, Phone, MessageCircle, X, UserCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { SHOP_CONFIG, buildWhatsAppLink } from '../shopConfig';

export const Navbar = () => {
  const { cart, isAdmin, toggleAdmin } = useStore();
  const { user, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [authTab, setAuthTab] = React.useState<'login' | 'signup'>('login');
  const [isBumping, setIsBumping] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart Bump Micro-interaction
  React.useEffect(() => {
    if (cartCount === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);
  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path ? 'text-brand-pink font-bold' : 'text-brand-text/70 hover:text-brand-pink';

  const handleAdminClick = () => {
    if (isAdmin) {
      toggleAdmin(); // Log out instantly
    } else {
      navigate('/staff');
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-pinkLight shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Finalized Designer Identity (Option 1) */}
          <Link to="/" className="flex items-center group" onDoubleClick={handleAdminClick} title="Double-click for Staff Access">
            <img
              src="/assets/logo_real.png"
              alt="Taste of Village"
              className="h-[42px] w-auto object-contain mix-blend-multiply"
             onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 font-sans font-medium text-[15px] tracking-wide uppercase">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/menu" className={isActive('/menu')}>Menu</Link>
            <Link to="/franchise" className={isActive('/franchise')}>Franchise</Link>
            <Link to="/rewards" className={isActive('/rewards')}>Rewards</Link>
            <Link to="/track" className={isActive('/track')}>Track Order</Link>
            <Link to="/book" className={isActive('/book')}>Book Table</Link>
            <a href={`tel:${SHOP_CONFIG.phoneNumberRaw}`} className="text-brand-text/70 hover:text-brand-pink transition-colors flex items-center gap-1.5" title="Call us">
              <Phone size={16} /> {SHOP_CONFIG.phoneNumber}
            </a>
            <a href={buildWhatsAppLink('Hi! I\'d like to place an order.')} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:text-[#20BD5A] transition-colors flex items-center gap-1.5 font-bold" title="WhatsApp us">
              <MessageCircle size={18} /> WhatsApp
            </a>
            {/* Account button */}
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-brand-text/70 hover:text-brand-pink transition-colors">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border-2 border-brand-pink/30"  onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }} />
                  ) : (
                    <UserCircle2 size={22} />
                  )}
                  <span className="text-xs">{user?.displayName?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                  <Link to="/dashboard" className="block px-4 py-2.5 text-sm font-bold text-brand-text hover:bg-brand-pink/5 hover:text-brand-pink">My Dashboard</Link>
                  <Link to="/rewards" className="block px-4 py-2.5 text-sm font-bold text-brand-text hover:bg-brand-pink/5 hover:text-brand-pink">🎁 Rewards</Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-50">Sign Out</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAuthTab('login'); setShowAuth(true); }} className="text-brand-text/70 hover:text-brand-pink transition-colors">
                <UserCircle2 size={22} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/menu" className="relative p-2 text-brand-text hover:text-brand-pink transition-colors">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className={`absolute top-0 right-0 bg-brand-pink text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-all duration-300 transform origin-center ${isBumping ? 'scale-[1.6] shadow-lg shadow-brand-pink/50' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-brand-text hover:text-brand-pink transition-colors"
            >
              {isOpen ? <MenuIcon size={24} className="rotate-90" /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Menu Overlay Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}></div>
          
          {/* Sliding Drawer */}
          <div className="relative w-[85%] max-w-sm bg-brand-cream h-full shadow-2xl flex flex-col transform transition-transform animate-slide-in-right">
             <div className="p-6 border-b border-brand-pinkLight flex justify-between items-center bg-white/50">
               <h2 className="font-serif font-bold text-2xl text-brand-text">Menu</h2>
               <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-brand-pinkLight rounded-full transition-colors text-brand-text">
                 <X size={24} />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 flex flex-col font-sans">
                <Link to="/" className={`text-xl font-bold flex items-center gap-3 ${isActive('/')}`}>Home</Link>
                <Link to="/menu" className={`text-xl font-bold flex items-center gap-3 ${isActive('/menu')}`}>Our Menu</Link>
                <Link to="/build-your-own" className={`text-xl font-bold flex items-center gap-3 ${isActive('/build-your-own')}`}>🍨 Build Taste of Village</Link>
                <Link to="/build-your-own-chaat" className={`text-xl font-bold flex items-center gap-3 ${isActive('/build-your-own-chaat')}`}>🥟 Build Chaat</Link>
                <Link to="/franchise" className={`text-xl font-bold flex items-center gap-3 ${isActive('/franchise')}`}>🏢 Franchise</Link>
                <Link to="/rewards" className={`text-xl font-bold flex items-center gap-3 ${isActive('/rewards')}`}>🎁 Rewards</Link>
                {isLoggedIn ? (
                  <Link to="/dashboard" className={`text-xl font-bold flex items-center gap-3 ${isActive('/dashboard')}`}>👤 My Account</Link>
                ) : (
                  <button onClick={() => { setAuthTab('signup'); setShowAuth(true); setIsOpen(false); }} className="text-xl font-bold flex items-center gap-3 text-brand-pink">👤 Sign Up / Login</button>
                )}
                <Link to="/track" className={`text-xl font-bold flex items-center gap-3 ${isActive('/track')}`}>🚚 Track Order</Link>
                <Link to="/book" className={`text-xl font-bold flex items-center gap-3 ${isActive('/book')}`}>📅 Book A Table</Link>
                
                <div className="w-full h-px bg-brand-pinkLight/60 my-4"></div>
                
                <a href={`tel:${SHOP_CONFIG.phoneNumberRaw}`} className="text-lg text-brand-text/80 flex items-center gap-3 font-bold hover:text-brand-text">
                  <Phone size={20} className="text-brand-pink"/> Call Shop
                </a>
                <a href={buildWhatsAppLink('Hi! I have a question.')} target="_blank" rel="noopener noreferrer" className="text-lg text-[#25D366] font-bold flex items-center gap-3 hover:text-[#20BD5A]">
                  <MessageCircle size={20} /> WhatsApp Us
                </a>
                
                <div className="w-full h-px bg-brand-pinkLight/60 my-4"></div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Help & Info</h4>
                  <Link to="/info?tab=faq" className="block text-brand-text/70 font-bold hover:text-brand-pink">Opening FAQs</Link>
                  <Link to="/info?tab=allergies" className="block text-brand-text/70 font-medium hover:text-brand-pink flex items-center gap-2">⚠️ Allergen Guide</Link>
                  <Link to="/info?tab=terms" className="block text-brand-text/70 font-medium hover:text-brand-pink">Terms & Conditions</Link>
                  <Link to="/info?tab=returns" className="block text-brand-text/70 font-medium hover:text-brand-pink">Refund Policy</Link>
                </div>
                
                <div className="mt-8 flex-1 flex flex-col justify-end">
                  {isAdmin && (
                    <button
                      onClick={handleAdminClick}
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all bg-brand-text text-white w-full justify-center shadow-lg"
                    >
                      <LayoutDashboard size={18} />
                      Lock Admin
                    </button>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-brand-text text-white text-xs py-1 text-center font-mono">
          OPERATING SYSTEM MODE: ADMIN ACCESS GRANTED
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </>
  );
};