import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, UtensilsCrossed, Clock, MapPin, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SHOP_CONFIG } from '../shopConfig';

const HERO_IMAGES = [
  '/assets/chicken_karahi_hero.png',
  '/assets/lamb_karahi_hero.png',
  '/assets/haleem_hero.png',
  '/assets/nihari_hero.png'
];

export const TOVHome = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-pine text-cream font-sans selection:bg-terracotta selection:text-white">
      
      {/* Progressive Hero Section */}
      <section className="relative h-[100vh] w-full flex flex-col md:flex-row overflow-hidden bg-pine">
        
        {/* Left Side: Cinematic Rotation */}
        <div className="relative w-full md:w-[70%] h-[60vh] md:h-full z-10 overflow-hidden">
          {HERO_IMAGES.map((src, index) => (
            <img 
              key={src}
              src={src} 
              alt="Taste of Village Signature Dish" 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-[3000ms] ease-in-out
                ${index === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
              style={{ transformOrigin: 'center center' }}
            />
          ))}
          {/* Gradients to ensure text pops */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-pine via-pine/40 to-transparent z-10"></div>
          
          {/* Typography overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 pt-16 md:pt-20">
            <div className="w-16 h-20 bg-terracotta rounded-t-full flex items-end justify-center pb-2 mb-6 shadow-2xl animate-fade-in-up">
               <div className="text-cream text-3xl font-serif">𖡡</div>
            </div>
            
            <h1 className="font-serif text-5xl md:text-8xl font-bold tracking-tight text-cream mb-4 drop-shadow-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              TASTE <br className="hidden md:block" />
              <span className="text-3xl md:text-6xl italic font-normal text-terracotta md:ml-4">of</span> VILLAGE
            </h1>
            
            <p className="text-lg md:text-2xl text-cream/90 mb-10 font-medium tracking-wide max-w-xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Authentic Lahori & Gujranwala masterpieces, crafted over open flames.
            </p>
          </div>
        </div>

        {/* Right Side: Clay Accent Wall */}
        <div className="relative w-full md:w-[30%] h-[40vh] md:h-full bg-terracotta z-20 flex flex-col items-center justify-center p-8 md:shadow-[-30px_0_50px_rgba(0,0,0,0.6)] border-t md:border-t-0 md:border-l border-terracotta-light">
          {/* Subtle pattern or noise on the clay wall */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] mix-blend-overlay"></div>
          
          <div className="relative z-10 w-full max-w-xs flex flex-col gap-4 md:gap-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <h3 className="text-cream font-serif text-2xl md:text-3xl mb-2 md:mb-4 text-center font-bold">Experience It</h3>
            
            <button 
              onClick={() => navigate('/menu')}
              className="w-full bg-cream text-terracotta py-4 px-8 rounded-none font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-xl uppercase tracking-widest"
            >
              Our Menu
            </button>
            <button 
              onClick={() => navigate('/order')}
              className="w-full bg-transparent border-2 border-cream text-cream py-4 px-8 rounded-none font-bold text-lg hover:bg-cream hover:text-terracotta hover:scale-105 transition-all uppercase tracking-widest"
            >
              Takeaway
            </button>

            <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t border-cream/20 text-center text-cream/80">
              <div className="font-bold mb-2">766B Uxbridge Rd, Hayes</div>
              <div className="text-sm">Open Daily 12pm - 11pm</div>
            </div>
          </div>
        </div>

        {/* Global Scroll Indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-[35%] z-30 animate-bounce hidden md:block">
          <ChevronDown className="text-cream w-10 h-10 drop-shadow-md" />
        </div>
      </section>

      {/* Brand Story Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 px-6 bg-cream text-pine relative"
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-terracotta font-serif text-4xl md:text-6xl font-bold">Our Heritage</h2>
            <div className="w-16 h-1 bg-pine"></div>
            <p className="text-lg leading-relaxed text-pine/90 font-medium">
              Our journey began in 2017 as <strong>"Hayes Paan and Snacks Corner"</strong>. Driven by a relentless passion for the rich, authentic flavors of Pakistani Punjab—specifically the food capital, Lahore, and the culinary haven of Gujranwala—we evolved.
            </p>
            <p className="text-lg leading-relaxed text-pine/90 font-medium">
              In 2022, we rebranded as <strong>Taste of Village</strong> to reflect our true calling: bringing the warmth, spice, and uncompromising quality of village-style Desi cooking to London. 
            </p>
            <p className="text-lg leading-relaxed text-pine/90 font-medium italic border-l-4 border-terracotta pl-4">
              "We don't just cook food; we share our culture, our home, and our history on every plate."
            </p>
          </div>
          <div className="relative h-[500px] overflow-hidden rounded-t-full shadow-2xl border-8 border-white/10">
            <img 
              src="/assets/chicken_karahi_hero.png" 
              alt="Authentic Karahi" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
            />
          </div>
        </div>
      </motion.section>

      {/* Signature Dishes Highlight */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 bg-pine text-cream border-t border-terracotta/20"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-terracotta font-serif text-4xl md:text-5xl font-bold mb-4"
          >
            Signatures of the House
          </motion.h2>
          <p className="text-cream-dark max-w-2xl mx-auto mb-16 text-lg">
            Masterpieces of slow cooking and open-flame grilling, prepared fresh daily.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Dish 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-pine-light p-8 border border-terracotta/20 hover:border-terracotta transition-colors group"
            >
              <UtensilsCrossed className="w-10 h-10 text-terracotta mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-2xl font-bold mb-3">Authentic Karahi</h3>
              <p className="text-cream/80 text-sm leading-relaxed mb-6">
                Chicken and Lamb Karahi, cooked to order in traditional iron woks with fresh tomatoes, ginger, and our secret spice blend.
              </p>
              <button onClick={() => navigate('/menu')} className="text-terracotta font-bold uppercase tracking-wide text-sm hover:text-white transition-colors">Explore Category →</button>
            </motion.div>

            {/* Dish 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-pine-light p-8 border border-terracotta/20 hover:border-terracotta transition-colors group"
            >
              <ChefHat className="w-10 h-10 text-terracotta mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-2xl font-bold mb-3">Haleem & Nihari</h3>
              <p className="text-cream/80 text-sm leading-relaxed mb-6">
                The pride of Lahore. Slow-cooked overnight for unparalleled richness, tender meat, and deep, complex flavors.
              </p>
              <button onClick={() => navigate('/menu')} className="text-terracotta font-bold uppercase tracking-wide text-sm hover:text-white transition-colors">Explore Category →</button>
            </motion.div>

            {/* Dish 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-pine-light p-8 border border-terracotta/20 hover:border-terracotta transition-colors group"
            >
              <div className="w-10 h-10 text-terracotta mb-6 mx-auto font-serif text-3xl font-bold flex items-center justify-center group-hover:scale-110 transition-transform">𖡡</div>
              <h3 className="font-serif text-2xl font-bold mb-3">Sizzling Mix Grills</h3>
              <p className="text-cream/80 text-sm leading-relaxed mb-6">
                Succulent kebabs and tikka, marinated in robust spices and seared over open charcoal for that perfect smokey char.
              </p>
              <button onClick={() => navigate('/menu')} className="text-terracotta font-bold uppercase tracking-wide text-sm hover:text-white transition-colors">Explore Category →</button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Info Strip */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-terracotta py-12 px-6"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around items-center gap-8 text-cream">
          <div className="flex items-center gap-4">
            <Clock className="w-8 h-8" />
            <div>
              <div className="font-bold text-lg">Open 7 Days a Week</div>
              <div className="text-cream/80">12:00 PM - 11:00 PM</div>
            </div>
          </div>
          <div className="hidden md:block w-px h-12 bg-cream/30"></div>
          <div className="flex items-center gap-4">
            <MapPin className="w-8 h-8" />
            <div>
              <div className="font-bold text-lg">Visit Us</div>
              <div className="text-cream/80">{SHOP_CONFIG.address}, {SHOP_CONFIG.postcode}</div>
            </div>
          </div>
        </div>
      </motion.section>

    </div>
  );
};
