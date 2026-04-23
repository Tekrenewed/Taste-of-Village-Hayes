import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const SloughStreetFood = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "The Ultimate Guide to Authentic Pakistani & Indian Street Food on Farnham Road, Slough",
    "image": "https://taste-of-villageandco.co.uk/assets/hero_tile.png",
    "author": {
      "@type": "Organization",
      "name": "Taste of Village"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Taste of Village",
      "logo": {
        "@type": "ImageObject",
        "url": "https://taste-of-villageandco.co.uk/assets/logo_real.png"
      }
    },
    "datePublished": "2026-04-08",
    "description": "Discover late-night chaat, halal desserts, and the best fusion of Pakistani and Indian street food exclusively at Taste of Village on Farnham Road, Slough."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="Pakistani & Indian Street Food Slough" 
        description="Craving late-night halal desserts or authentic Pakistani and Indian street food? Visit Taste of Village on Farnham Road, Slough for Samosa Chaat, Royal Taste of Village, and more."
        canonicalUrl="/slough-street-food"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">Farnham Road's Hidden Gem</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Authentic Pakistani & Indian Street Food in Slough</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            Experience the vibrant night scene of Farnham Road with genuine sub-continent flavours. From spicy, late-night chaat to luxurious halal desserts, we bring the streets of Lahore and Mumbai right here to Berkshire.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">Late Night Chaat & Savoury Fusion</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              When the cravings hit, nothing beats the perfect balance of sweet, spicy, and tangy. Our signature <strong>Taste of Village Special Chaat</strong> and warm <strong>Samosa Chaat</strong> are crafted using authentic Indian street food recipes and rich Pakistani spices. It's the ultimate comfort food for Slough locals looking for genuine desi flavors.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Crispy Papdi Chaat</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Spiced Aloo Tikki</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Signature Dahi Bhalla</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">Premium Halal Desserts</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              A meal isn't complete without something sweet. We pride ourselves on offering luxury halal desserts that look as good as they taste. Our <strong>Royal Heritage Taste of Village</strong> blends Rooh Afza, chilled milk, and rich kulfi, making it the finest traditional dessert in Slough.
            </p>
            <ul className="space-y-3 font-semibold text-brand-text">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Pistachio Royale Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> The Golden Monsoon (Mango)</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> San Sebastian Cheesecake</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Visit Slough's Premier Dessert Parlour</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Whether you're looking for a quick Karak Chai catch-up, late-night Pakistani street food, or a luxury dining experience with artisanal halal desserts, Taste of Village is your destination.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <MapPin className="text-brand-electricPeach" /> 268 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <Clock className="text-brand-electricPeach" /> Open until 11:00 PM
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link to="/menu" className="px-8 py-4 bg-brand-blue text-brand-text rounded-full font-bold hover:shadow-lg transition-all">
              View Full Menu
            </Link>
            <Link to="/book" className="px-8 py-4 bg-transparent border-2 border-brand-text/10 text-brand-text rounded-full font-bold hover:bg-brand-text/5 transition-all">
              Book a Table
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
