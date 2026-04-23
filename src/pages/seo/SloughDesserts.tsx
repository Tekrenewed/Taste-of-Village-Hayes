import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const SloughDesserts = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "The Best Late Night Halal Desserts in Slough",
    "image": "https://faloodaandco.co.uk/assets/hero_tile.png",
    "author": {
      "@type": "Organization",
      "name": "Falooda & Co"
    },
    "description": "Discover Slough's premier destination for luxury halal desserts. From Pistachio Royal Falooda to hot Cookie Dough, we are open late on Farnham Road."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="Best Halal Desserts in Slough" 
        description="Looking for the best desserts in Slough? Falooda & Co on Farnham Road serves luxury halal desserts, hot cookie dough, and our signature Falooda until midnight."
        canonicalUrl="/slough-desserts"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">The Jewel of Farnham Road</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Slough's Best Late Night Halal Desserts</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            Right in the heart of Slough, Falooda & Co is redefining the local dessert scene. From intensely rich Pistachio Falooda to freshly baked hot cookie dough, we serve pure luxury.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">Signature Halal Desserts</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Every item on our menu is 100% Halal and crafted with uncompromising quality. We've sourced the finest ingredients to bring upscale dessert parlor vibes straight to Slough.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Signature Hot Cookie Dough</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Authentic San Sebastian Cheesecake</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Premium Milkshakes</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">The Famous Falooda</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              Our namesake dessert is what put us on the map. The Royal Heritage Falooda is the ultimate late-night street food treat, perfectly balancing Rooh Afza, basil seeds, and rich traditional Kulfi.
            </p>
            <ul className="space-y-3 font-semibold text-brand-text">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> The Royal Heritage Falooda</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Pistachio Royale Falooda</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> The Salted Sunset</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Dine In or Order for Collection</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Enjoy a luxurious dine-in experience or easily book a table online. We're open late, making us the perfect post-dinner destination in Slough.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <MapPin className="text-brand-electricPeach" /> 268 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <Clock className="text-brand-electricPeach" /> Open every day until Midnight
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
