import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../components/SEOHead';
import { MENU_ITEMS } from '../constants';

// Organize and map category IDs to display titles
const CATEGORY_MAP: Record<string, { title: string, subtitle?: string }> = {
  taste-of-village: { title: "Signature Taste of Village", subtitle: "Where our story began. Authentic, rich, and unforgettable." },
  milkshake: { title: "Royal Milkshakes", subtitle: "Thick, creamy, and spun with premium ingredients." },
  dessert: { title: "Sweet Indulgences", subtitle: "Traditional Meetha (Desserts) to satisfy your soul." },
  signature_desserts: { title: "Signature Desserts", subtitle: "Decadent creations crafted for the ultimate treat." },
  cake: { title: "Cakes & Loaves", subtitle: "Soft sponges and rich layers perfect with tea." },
  ice_cream: { title: "Ice Cream", subtitle: "Scoops of joy. Simply perfect." },
  chaat: { title: "Street Chaat", subtitle: "A riot of flavours: sweet, tangy, spicy, and messy." },
  street_food: { title: "Street Food", subtitle: "Authentic, bold, and unapologetically delicious." },
  lunch: { title: "Lunch & Bites", subtitle: "Satisfying wraps, sandwiches, and golden fries." },
  salad: { title: "Fresh Salads", subtitle: "Crisp, light, and wonderfully refreshing." },
  english_breakfast: { title: "English Breakfast", subtitle: "The classic morning comfort." },
  desi_breakfast: { title: "Desi Breakfast", subtitle: "Spiced, flaky, and deeply traditional." },
  sweet_breakfast: { title: "Sweet Breakfast", subtitle: "Pancakes and toast to start your day sweet." },
  breakfast_drinks: { title: "Morning Blends", subtitle: "Teas, coffees, and fresh smoothies." },
  hot_drinks: { title: "Hot Drinks", subtitle: "Warm up your soul." },
  drinks: { title: "Chilled Refreshments", subtitle: "Mocktails, mojitos, and iced drinks." }
};

interface RenderCategoryProps {
  categoryId: string;
  items: typeof MENU_ITEMS;
}

const pastelHoverColors = [
  "group-hover:text-[#F8BBD0]", // Pastel Pink
  "group-hover:text-[#BBDEFB]", // Pastel Blue
  "group-hover:text-[#FFF59D]", // Pastel Yellow
];

const MenuSection = ({ categoryId, items }: RenderCategoryProps) => {
  const categoryItems = items.filter(item => item.category === categoryId);
  if (categoryItems.length === 0) return null;

  const info = CATEGORY_MAP[categoryId] || { title: categoryId };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-20 last:mb-0"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-serif text-[#F8BBD0] mb-3 tracking-wide">{info.title}</h2>
        {info.subtitle && <p className="text-gray-400 text-sm md:text-base italic tracking-widest max-w-2xl mx-auto">{info.subtitle}</p>}
        <div className="w-24 h-[1px] bg-[#F8BBD0]/30 mx-auto mt-6"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {categoryItems.map((item, idx) => {
          const hoverColorClass = pastelHoverColors[idx % pastelHoverColors.length];
          return (
          <div key={item.id} className="relative group flex flex-col">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className={`text-lg md:text-xl font-medium text-white tracking-wide transition-colors ${hoverColorClass}`}>{item.name}</h3>
              <div className="flex-grow mx-4 border-b border-dotted border-gray-700 relative top-[-6px]"></div>
              <span className="text-[#F8BBD0] font-serif text-lg md:text-xl">£{item.price.toFixed(2)}</span>
            </div>
            {item.description && (
              <p className="text-gray-400 text-sm leading-relaxed pr-12">{item.description}</p>
            )}
            {item.popular && (
              <span className="absolute -left-6 top-1 text-[#F8BBD0] text-xs uppercase tracking-widest rotate-[-90deg] hidden md:block">Signature</span>
            )}
          </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export const CinematicMenu = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Grouping categories into massive visual blocks
  const sections = [
    { name: "The Classics", categories: ["taste-of-village", "milkshake", "chaat", "street_food"] },
    { name: "Savoury & Lunch", categories: ["lunch", "salad"] },
    { name: "Morning Rituals", categories: ["english_breakfast", "desi_breakfast", "sweet_breakfast", "breakfast_drinks"] },
    { name: "The Sweet Finale", categories: ["signature_desserts", "cake", "dessert", "ice_cream"] },
    { name: "Beverages", categories: ["drinks", "hot_drinks"] }
  ];

  return (
    <div className="min-h-screen bg-[#070707] font-sans selection:bg-[#F8BBD0] selection:text-black">
      <SEOHead 
        title="Menu | Taste of Village." 
        description="Explore the cinematic menu of Taste of Village. Indulge in premium desserts, signature taste-of-villages, authentic chaat, and artisan breakfasts."
      />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* Cinematic Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-40' : 'opacity-0'}`}
        >
          <source src={`/assets/videos/Reel 2.mov`} type="video/mp4" />
          {/* Fallback to mural if video missing */}
          <img src="/assets/hero_mural.png" alt="Taste of Village" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        </video>
        
        {/* Film Grain Overlay */}
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        
        {/* Gradient Fade to Content */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#070707] via-[#070707]/80 to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="text-[#F8BBD0] uppercase tracking-[0.3em] text-xs md:text-sm font-medium">Est. 2024</span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white tracking-widest uppercase" style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              The Menu
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <div className="h-[1px] w-12 bg-[#F8BBD0]"></div>
              <span className="text-gray-300 italic font-serif text-lg md:text-2xl">Taste of Village.</span>
              <div className="h-[1px] w-12 bg-[#F8BBD0]"></div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 text-[#F8BBD0]/70"
        >
          <span className="text-xs uppercase tracking-widest">Discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#F8BBD0]/50 to-transparent"></div>
        </motion.div>
      </div>

      {/* Main Content Areas */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20">
        
        {sections.map((section, idx) => {
          // Check if section has any items
          const hasItems = section.categories.some(catId => MENU_ITEMS.some(item => item.category === catId));
          if (!hasItems) return null;

          return (
            <div key={idx} className="mb-32">
              {/* Section Header */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center space-x-6 mb-16"
              >
                <div className="h-[1px] w-full bg-gray-800"></div>
                <h3 className="text-[#F8BBD0] text-sm md:text-base uppercase tracking-[0.4em] whitespace-nowrap px-4 font-semibold">
                  {section.name}
                </h3>
                <div className="h-[1px] w-full bg-gray-800"></div>
              </motion.div>

              {section.categories.map(categoryId => (
                <MenuSection key={categoryId} categoryId={categoryId} items={MENU_ITEMS} />
              ))}
            </div>
          )
        })}

        {/* Footer closing mark */}
        <div className="py-20 text-center flex flex-col items-center border-t border-gray-900 mt-20">
          <img src="/assets/logo_real.png" alt="Taste of Village" className="h-20 w-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-700 mb-8" />
          <p className="text-gray-500 font-serif italic text-xl">Thank you for joining our table.</p>
          <p className="text-gray-700 text-sm mt-4 tracking-widest uppercase">268 Farnham Rd, Slough</p>
        </div>

      </div>
    </div>
  );
};
