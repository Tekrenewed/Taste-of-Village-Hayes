import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const LangleySweets = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Traditional South Asian Sweets & Halal Desserts Near Langley",
    "image": "https://taste-of-villageandco.co.uk/assets/hero_tile.png",
    "author": {
      "@type": "Organization",
      "name": "Taste of Village"
    },
    "description": "Looking for South Asian sweets and family-friendly halal desserts near Langley? Visit Taste of Village for authentic taste-of-village, kulfi, and Karak Chai."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="South Asian Sweets & Desserts Near Langley" 
        description="Just down the road from Langley, Taste of Village serves authentic South Asian sweets, halal cookie dough, and premium Taste of Village for the whole family."
        canonicalUrl="/langley-sweets"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">Serving the Langley Community</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Traditional Sweets & Family Desserts</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            Located just moments from Langley, Taste of Village provides a premium, family-friendly environment focusing on authentic South Asian dessert heritage and modern halal treats.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">The Heritage Menu</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Share the authentic tastes of back home with the next generation. We specialize in traditional recipes that refuse to cut corners, offering the finest South Asian sweets and refreshing beverages in the area.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> The Royal Heritage Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Authentic Mango Lassi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Traditional Kulfi Cuts</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">Modern Halal Favorites</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              Prefer something contemporary? Our kitchen also bakes incredible hot cookie dough, frothy milkshakes, and luxurious cheesecakes. 100% Halal certified, making it the perfect safe dining spot for Langley families.
            </p>
            <ul className="space-y-3 font-semibold text-brand-text">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Hot Cookie Dough</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> San Sebastian Cheesecake</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Kinder Bueno Milkshakes</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Your Local Dessert Spot</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Whether it's a post-dinner family outing or a quick catch-up over Karak Chai, we are Langley's closest premium dessert parlour.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <MapPin className="text-brand-electricPeach" /> 268 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-brand-text font-bold">
              <Clock className="text-brand-electricPeach" /> Open Daily until Midnight
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
