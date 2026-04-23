import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const HighWycombeFalooda = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Authentic Falooda & South Asian Street Food Near High Wycombe",
    "image": "https://faloodaandco.co.uk/assets/hero_tile.png",
    "author": {
      "@type": "Organization",
      "name": "Falooda & Co"
    },
    "description": "Struggling to find an authentic Falooda near High Wycombe? Take the short drive down to Falooda & Co. We serve the Royal Heritage Falooda alongside London's best slow-cooked Samosa Chaat and fresh Dahi Bhallay."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="Authentic Falooda Near High Wycombe" 
        description="Looking for the best Falooda near High Wycombe? Just a short drive away, Falooda & Co serves authentic Royal Falooda and the finest house-made chaat in the region."
        canonicalUrl="/high-wycombe-falooda"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">A Short Drive from High Wycombe</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Finally. An Authentic Falooda Experience.</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            High Wycombe locals know that finding a truly authentic Falooda or traditional Dahi Bhalla nearby is almost impossible. That's why we invite you to make the short trip to Farnham Road. We do it the traditional way.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">The Royal Heritage Falooda</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              You won't find generic syrups or corner-cutting here. Our signature Royal Heritage Falooda is crafted with luxury traditional kulfi, rich basil seeds, and authentic Rooh Afza, delivering that brilliant nostalgic taste you've been searching for.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Authentic Mughal Recipes</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Pistachio & Mango Variants</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> 100% Halal Certified</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">London's Best Chaat?</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              We say yes. We refuse to use tinned chickpeas. Our Samosa Chaat and Dahi Bhallay feature chickpeas slow-cooked for hours to perfection. Everything from the papdi to the bhallas is made fresh in-house, never store-bought, guaranteeing an unbeatable authentic crunch.
            </p>
            <ul className="space-y-3 font-semibold text-brand-text">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Slow-Cooked Chickpeas (No Tins)</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Fresh In-House Papdi & Bhalla</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-gold" /> Secret Hand-Ground Spice Blends</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Come Taste the Difference</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Don't settle for mediocre street food. Take the quick drive down to Slough and experience the most authentic Falooda and handcrafted Chaat available outside of South Asia.
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
