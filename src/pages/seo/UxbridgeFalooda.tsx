import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock, Car } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const UxbridgeFalooda = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Authentic Falooda & Halal Desserts near Uxbridge",
    "image": "https://faloodaandco.co.uk/assets/hero_tile.png",
    "author": { "@type": "Organization", "name": "Falooda & Co" },
    "publisher": { "@type": "Organization", "name": "Falooda & Co" },
    "description": "Uxbridge residents are discovering Falooda & Co on Farnham Road, Slough — just 25 minutes away for luxury halal faloodas, Indian chaats, and cookie dough."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="Falooda & Halal Desserts near Uxbridge | Falooda & Co" 
        description="Looking for authentic falooda near Uxbridge? Falooda & Co in Slough is just 25 minutes away — luxury halal desserts, Indian street food, and chaats until midnight."
        canonicalUrl="/uxbridge-falooda"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">25 Minutes from Uxbridge</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Uxbridge's Favourite Falooda Destination</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            Uxbridge has chains, but nothing like Falooda & Co. A short drive along the A4020 and M40 brings you to Slough's most talked-about dessert parlour — where every falooda is hand-crafted and every chaat is made fresh.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">The Falooda Experience</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Our faloodas aren't just drinks — they're a layered dessert experience. From the signature Rose Falooda to the indulgent Pistachio Royale, each glass is assembled to order with premium kulfi, vermicelli, and aromatic syrups.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Rose Falooda</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Pistachio Royale Falooda</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Fresh Samosa & Dahi Puri Chaat</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">Quick Drive, Big Reward</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              Whether you're coming from Uxbridge town centre, Brunel University, or Hillingdon, you can be here in under 25 minutes. We're right on Farnham Road with easy access and local parking.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-text font-bold">
                <Car size={20} className="text-brand-gold" /> 25 min via A4020 / M40 from Uxbridge
              </div>
              <div className="flex items-center gap-3 text-brand-text font-bold">
                <Clock size={20} className="text-brand-gold" /> Open until midnight, 7 days a week
              </div>
              <div className="flex items-center gap-3 text-brand-text font-bold">
                <MapPin size={20} className="text-brand-gold" /> 268 Farnham Road, Slough SL1 4XL
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Visit Us from Uxbridge Today</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Join the growing number of Uxbridge locals who've made Falooda & Co their go-to spot for authentic halal desserts and Indian street food classics.
          </p>
          
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
