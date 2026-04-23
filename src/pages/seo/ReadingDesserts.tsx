import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock, Car } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const ReadingDesserts = () => {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Luxury Halal Desserts Worth the Drive from Reading",
    "image": "https://faloodaandco.co.uk/assets/hero_tile.png",
    "author": { "@type": "Organization", "name": "Falooda & Co" },
    "publisher": { "@type": "Organization", "name": "Falooda & Co" },
    "description": "Reading foodies are making the 30-minute drive to Falooda & Co on Farnham Road, Slough for luxury halal faloodas, cookie dough, and Indian street food."
  });

  return (
    <div className="bg-brand-cream min-h-screen pt-20 pb-20 font-sans">
      <SEOHead 
        title="Halal Desserts near Reading | Falooda & Co" 
        description="Craving luxury halal desserts near Reading? Falooda & Co in Slough is just 30 minutes away — serving artisan faloodas, cookie dough, and chaats until midnight."
        canonicalUrl="/reading-desserts"
        schema={schema}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-brand-electricPeach font-bold tracking-widest uppercase text-xs mb-4 block">Worth Every Mile from Reading</span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-text mb-6">Reading's Best-Kept Dessert Secret is in Slough</h1>
          <p className="text-lg text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
            Reading has plenty of restaurants, but when it comes to authentic South Asian luxury desserts, locals are making the easy 30-minute drive along the M4 to Falooda & Co on Farnham Road.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="obsidian-card p-10 rounded-[3rem] bg-brand-obsidian text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-electricPeach">Why Reading Locals Love Us</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We're not your average dessert parlour. Our Royal Heritage Falooda uses premium ingredients — from hand-crushed pistachios to fragrant Rooh Afza — crafted by artisans who live and breathe South Asian dessert culture.
            </p>
            <ul className="space-y-3 font-semibold text-brand-pinkLight">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Artisan Falooda Collection</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> San Sebastian Cheesecake</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-brand-electricPeach" /> Late Night Indian Street Food</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-pinkLight p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-brand-text">Easy M4 Access</h2>
            <p className="text-brand-text/70 leading-relaxed mb-6">
              Jump on the M4 from Reading, exit at Junction 6, and you're on Farnham Road in under 30 minutes. Plenty of free parking nearby and a luxurious dine-in atmosphere that makes the journey worthwhile.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-text font-bold">
                <Car size={20} className="text-brand-gold" /> 30 min via M4 from Reading town centre
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
          <h2 className="font-serif text-4xl mb-6">Drive from Reading. Arrive in Luxury.</h2>
          <p className="text-brand-text/70 leading-relaxed max-w-xl mx-auto mb-10">
            Whether it's a date night, family outing, or late-night craving, Falooda & Co delivers an experience that Reading dessert lovers are raving about.
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
