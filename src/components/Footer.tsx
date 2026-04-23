import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Instagram, Facebook, MessageCircle, Clock } from 'lucide-react';
import { SHOP_CONFIG, buildWhatsAppLink } from '../shopConfig';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream border-t border-terracotta/20 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
               <div className="text-terracotta font-serif text-3xl font-bold">Taste of Village</div>
            </Link>
            <p className="text-pine/80 text-sm leading-relaxed mb-6 font-medium">
              Bringing the authentic Desi taste of Lahore and Gujranwala straight to Hayes. Curries, Karahis, and Grills crafted with passion.
            </p>
            <div className="flex gap-4">
              <a href={SHOP_CONFIG.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-terracotta/10 text-pine flex items-center justify-center hover:bg-terracotta hover:text-white transition-all transform hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href={SHOP_CONFIG.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-terracotta/10 text-pine flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all transform hover:scale-110">
                <Facebook size={20} />
              </a>
              <a href={buildWhatsAppLink('Hello! I have a question.')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-terracotta/10 text-pine flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all transform hover:scale-110">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links Quick */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-pine tracking-wide">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-pine/70 hover:text-terracotta transition-colors font-medium text-sm text-balance">Home</Link></li>
              <li><Link to="/menu" className="text-pine/70 hover:text-terracotta transition-colors font-medium text-sm text-balance">Our Menu</Link></li>
              <li><Link to="/order" className="text-pine/70 hover:text-terracotta transition-colors font-medium text-sm text-balance">Order Takeaway</Link></li>
              <li><Link to="/book" className="text-pine/70 hover:text-terracotta transition-colors font-medium text-sm text-balance">Book A Table</Link></li>
            </ul>
          </div>

          {/* Legal / Policy Hub */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-pine tracking-wide">Legal & Policies</h4>
            <ul className="space-y-4">
              <li><Link to="/info?tab=allergies" className="text-pine/70 hover:text-terracotta transition-colors font-bold text-sm text-balance">⚠️ Allergy Guide</Link></li>
              <li><Link to="/info?tab=terms" className="text-pine/70 hover:text-terracotta transition-colors font-medium text-sm text-balance">Terms & Conditions</Link></li>
              <li><Link to="/info?tab=privacy" className="text-pine/70 hover:text-terracotta transition-colors font-medium text-sm text-balance">Privacy Policy</Link></li>
              <li><Link to="/info?tab=faq" className="text-pine/70 hover:text-terracotta transition-colors font-medium text-sm text-balance py-1 px-3 bg-terracotta/10 rounded-md inline-block">FAQs</Link></li>
            </ul>
          </div>

          {/* Find Us */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6 text-pine tracking-wide">Find Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-terracotta flex-shrink-0 mt-0.5" />
                <span className="text-pine/80 leading-relaxed font-medium text-sm text-balance">
                  {SHOP_CONFIG.address}<br/>
                  <span className="text-xs font-bold">{SHOP_CONFIG.postcode}</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-terracotta flex-shrink-0" />
                <span className="text-pine/80 font-medium text-sm text-balance">{SHOP_CONFIG.phoneNumber}</span>
              </li>
              <li className="flex items-start gap-3 mt-6 bg-white p-4 rounded-2xl shadow-sm border border-terracotta/20">
                <Clock size={18} className="text-pine flex-shrink-0 mt-0.5" />
                <div className="text-sm font-medium text-pine/80">
                  <span className="block font-bold text-pine mb-1">Opening Hours</span>
                  <span className="text-terracotta font-bold">Mon - Sun</span><br/>
                  12:00 PM - 11:00 PM
                </div>
              </li>
              <li className="mt-4 overflow-hidden rounded-2xl shadow-sm border border-terracotta/20 relative" style={{ paddingTop: '56.25%' }}>
                <iframe 
                  src="https://www.google.com/maps?q=766B+Uxbridge+Rd,+Hayes+UB4+0RU,+UK&output=embed"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Taste of Village Location"
                ></iframe>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-terracotta/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-pine/50 text-sm font-medium">
            © {currentYear} Taste Of Village. All rights reserved.
          </p>
          <div className="flex gap-6 text-pine/50 text-sm font-medium">
            <span className="flex items-center gap-2">Built safely with <a href="https://www.marketricks.co.uk" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta underline transition-colors">Marketricks</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
