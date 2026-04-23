import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const MaidenheadStreetFood = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Authentic Indian Street Food Near Maidenhead",
    "image": "https://taste-of-villageandco.co.uk/assets/hero_tile.png",
    "author": {
      "@type": "Organization",
      "name": "Taste of Village"
    },
    "description": "Looking for the best Indian street food near Maidenhead? Taste of Village serves authentic late-night chaat, samosas, and Karak Chai just down the M4."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="Indian Street Food & Chaat Near Maidenhead" 
        description="Craving late-night Indian street food near Maidenhead? Take a quick drive to Taste of Village in Slough for authentic Samosa Chaat, Gol Gappe, and Karak Chai."
        canonicalUrl="/maidenhead-street-food"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">A Quick Drive from Maidenhead</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Authentic Indian Street Food & Late Night Chaat</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            Maidenhead locals know that for truly authentic, late-night sub-continent flavors, a quick trip down the M4 to Farnham Road is worth every minute.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">The Real Taste of Mumbai</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              When you're craving that perfect mix of crunchy, sweet, and spicy, our Indian street food menu delivers. We specialize in late-night chaat that brings the vibrant streets of Mumbai to your table.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Samosa Chaat</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Aloo Tikki Chaat</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Dahi Bhalla</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">Karak Chai & Desserts</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              Pair your savory street food with the finest Karak Chai in Berkshire, brewed fresh every evening. Or finish off with our signature Halal desserts, including the Royal Heritage Taste of Village.
            </p>
            <ul className="space-y-3 font-semibold text-brand-text">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Authentic Karak Chai</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> The Royal Heritage Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Fresh Hot Cookie Dough</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Visit Us from Maidenhead</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Skip the local takeaways and experience premium dine-in street food. We're open late to satisfy all your savory and sweet cravings.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <MapPin className="text-brand-electricPeach" /> 268 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <Clock className="text-brand-electricPeach" /> Open until Midnight
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
