import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const WindsorDesserts = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Premium Halal Desserts Just Minutes from Windsor",
    "image": "https://taste-of-villageandco.co.uk/assets/hero_tile.png",
    "author": {
      "@type": "Organization",
      "name": "Taste of Village"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Taste of Village"
    },
    "description": "Looking for luxury halal desserts near Windsor? Taste of Village is just a 10-minute drive down the A332, offering late-night desserts, cookie dough, and Indian street food."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="Halal Desserts near Windsor" 
        description="Craving late-night halal desserts near Windsor? Take a short 10-minute drive to Taste of Village for luxury cookie dough, milkshakes, and Indian street food."
        canonicalUrl="/windsor-desserts"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">Just 10 Minutes from Windsor Castle</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Windsor's Premier Choice for Late-Night Halal Desserts</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            Windsor is beautiful, but when the late-night cravings hit, the options can be limited. Just a short drive away on the vibrant Farnham Road, Taste of Village offers the ultimate luxury dessert experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">Late Night Luxury</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Skip the noisy chains and treat yourself to a premium dine-in experience. We serve freshly baked cookie dough, artisan milkshakes, and the famous San Sebastian cheesecake — all 100% Halal and available until midnight.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Freshly Baked Cookie Dough</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Luxury Milkshakes</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> San Sebastian Cheesecake</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">A Taste of the East</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              Looking for something more exotic than standard ice cream? Our renowned Royal Heritage Taste of Village is the perfect blend of sweet basil seeds, Rooh Afza, and rich Kulfi, bridging the gap between traditional South Asian sweets and modern luxury.
            </p>
            <ul className="space-y-3 font-semibold text-brand-text">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Pistachio Royale Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Traditional Kulfi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Late Night Karak Chai</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Make the Short Trip from Windsor Today</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Hop onto the A332 and join us for the ultimate dessert experience. Plenty of parking nearby and a luxurious dine-in atmosphere waiting for you.
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
