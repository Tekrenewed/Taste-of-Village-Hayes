import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { SHOP_CONFIG, buildWhatsAppLink } from '../shopConfig';

export const Home = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-brand-cream relative">
      <SEOHead 
        title="Luxury Desserts & Street Food" 
        description="From Sips to Bites, We've Got You. Discover Falooda & Co's exquisite range of artisanal desserts, fresh juices, chaats, and street food on Farnham Road, Slough."
        canonicalUrl="/"
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": SHOP_CONFIG.name,
          "image": `${SHOP_CONFIG.website}/assets/hero_tile.png`,
          "url": SHOP_CONFIG.website,
          "telephone": SHOP_CONFIG.phoneNumberRaw,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "268 Farnham Road",
            "addressLocality": "Slough",
            "addressRegion": "Berkshire",
            "postalCode": "SL1 4XL",
            "addressCountry": "GB"
          },
          "servesCuisine": ["South Asian", "Desserts", "Street Food", "Pakistani", "Indian"],
          "priceRange": "££",
          "menu": `${SHOP_CONFIG.website}/menu`,
          "acceptsReservations": "True"
        })}
      />
      {/* Hero Section - Pastel Parallax UI */}
      <section className="relative min-h-[92vh] flex items-center pt-10 pb-32 overflow-hidden bg-brand-pinkLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Typography & Call to Actions */}
            <div className="space-y-8 animate-fade-up z-20">
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium text-brand-text leading-tight tracking-tight">
                {SHOP_CONFIG.name.split(' ')[0]} <br /> {SHOP_CONFIG.name.split(' ').slice(1).join(' ')}
              </h1>
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-brand-text/90 italic">
                {SHOP_CONFIG.tagline}
              </h2>
              <p className="text-lg md:text-xl text-brand-text/75 max-w-lg leading-relaxed font-sans mt-6">
                Welcome to {SHOP_CONFIG.name}. Experience authentic culinary artistry crafted with precision.
              </p>
              <div className="flex flex-wrap gap-4 pt-6">
                <Link to="/menu" className="group px-8 py-4 bg-brand-blue text-brand-text rounded-full font-sans font-semibold hover:bg-brand-blue/80 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                  Explore Our Menu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/book" className="px-8 py-4 bg-transparent border border-brand-text/20 text-brand-text rounded-full font-sans font-semibold hover:bg-brand-text/5 transition-all">
                  Book Your Table
                </Link>
              </div>
            </div>

            {/* Floating Hero Image (Arched Frame) */}
            <div className="relative animate-slide-in-right z-20 flex justify-center mt-10 md:mt-0">
              <div className="absolute inset-0 bg-brand-pink rounded-full blur-[80px] opacity-60 mix-blend-multiply pointer-events-none transform translate-y-10 scale-90"></div>
              <div className="relative rounded-t-full rounded-b-[4rem] overflow-hidden border-[6px] border-white/60 shadow-2xl w-full max-w-[400px] aspect-[4/5] animate-float" style={{ filter: 'drop-shadow(0px 30px 40px rgba(255,192,203,0.3))' }}>
                <img
                  src="/assets/hero_tile.png"
                  alt="Luxury Dessert"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulletproof SVG Curve Divider */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-10">
          <svg className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FBF9F6"></path>
          </svg>
        </div>
      </section>

      {/* Intro Feature / The Space */}
      <section className="py-24 bg-brand-cream relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-brand-text">Urban Whimsical Joy</h2>
            <p className="text-lg text-brand-text/70 font-sans leading-relaxed">
              Serving our community from {SHOP_CONFIG.address}. Step into a world of elegance, 
              where every dish is crafted with precision, passion, and the finest ingredients.
            </p>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Star size={28} className="text-brand-pink" />,
                title: "Premium Ingredients",
                desc: "We source the finest rose syrup, basil seeds, and dairy to craft our signature layers.",
                bg: "bg-[#f5f1ea]"
              },
              {
                icon: <Clock size={28} className="text-brand-blue" />,
                title: "Click & Collect",
                desc: "Skip the queue. Order ahead through our website and pick up your treats fresh.",
                bg: "bg-[#f5f1ea]"
              },
              {
                icon: <MapPin size={28} className="text-[#a2a898]" />,
                title: "Visit Our Shop",
                desc: `${SHOP_CONFIG.address}. Open ${SHOP_CONFIG.openingHours}. Book a booth or drop by.`,
                bg: "bg-[#f5f1ea]"
              }
            ].map((feature, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] ${feature.bg} hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center group`}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-2xl font-medium mb-3 text-brand-text">{feature.title}</h3>
                <p className="text-brand-text/70 leading-relaxed font-sans">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Wave to Footer */}
      <div className="w-full overflow-hidden leading-none bg-brand-cream">
        <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#4A4036"></path>
        </svg>
      </div>
      
      {/* Contact Bar at Bottom */}
      <section className="bg-brand-text pb-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-brand-cream text-sm font-sans">
          <a href={`tel:${SHOP_CONFIG.phoneNumberRaw}`} className="flex items-center gap-2 hover:text-brand-pinkLight transition-colors">
            <Phone size={16} /> {SHOP_CONFIG.phoneNumber}
          </a>
          <a href={buildWhatsAppLink('Hi! I\'d like to place an order.')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#25D366] transition-colors">
            <MessageCircle size={16} /> WhatsApp Us
          </a>
          <span className="flex items-center gap-2">
            <MapPin size={16} /> {SHOP_CONFIG.address}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={16} /> {SHOP_CONFIG.openingHours}
          </span>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href={buildWhatsAppLink('Hi! I\'d like to place an order.')}
        target="_blank"
        rel="noopener noreferrer"
        title="Order via WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] animate-bounce-gentle"
      >
        <MessageCircle size={30} className="text-white" />
      </a>
    </div>
  );
};