import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Shield, RefreshCw, Leaf, HelpCircle, ChevronRight } from 'lucide-react';
import { SHOP_CONFIG } from '../shopConfig';
import { SEOHead } from '../components/SEOHead';

type TabId = 'terms' | 'allergies' | 'privacy' | 'returns' | 'food' | 'faq';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'faq', label: 'Grand Opening FAQs', icon: <HelpCircle size={18} /> },
  { id: 'allergies', label: 'Allergen Guide', icon: <AlertTriangle size={18} /> },
  { id: 'food', label: 'Food & Hygiene', icon: <Leaf size={18} /> },
  { id: 'returns', label: 'Returns Policy', icon: <RefreshCw size={18} /> },
  { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={18} /> },
  { id: 'terms', label: 'Terms & Conditions', icon: <MapPin size={18} /> }, // using map pin as generic here, or FileText
];

export const Info = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('faq');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as TabId;
    if (tabParam && TABS.map(t => t.id).includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const handleTabChange = (tabId: string) => {
    navigate(`/info?tab=${tabId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is Taste of Village 100% Halal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Taste of Village is 100% strictly Halal. Every ingredient, from our Pakistani street food chaats to our luxury desserts and gelatins, is certified halal. We do not prepare non-halal items on premises."
        }
      },
      {
        "@type": "Question",
        "name": "What is the best dessert parlour in Slough for late night cravings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Taste of Village on Farnham Road, Slough, is an upscale dessert parlour known for its premium late-night offerings. The Royal Heritage Taste of Village, Karak Chai, and fresh Cookie Dough are local favorites, available until midnight."
        }
      },
      {
        "@type": "Question",
        "name": "Do you serve authentic Pakistani and Indian street food in Berkshire?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Taste of Village specializes in a fusion of Pakistani and Indian street food. Our signature Samosa Chaat and Taste of Village Special Chaat use traditional recipes from Lahore and Mumbai, served right here in Slough."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I get Karak Chai late at night in Slough?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Taste of Village on Farnham Road serves perfectly brewed, authentic Karak Chai until Midnight every single night."
        }
      },
      {
        "@type": "Question",
        "name": "Are there seating options at Taste of Village?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer premium seating at our dessert parlor on Farnham Road. You can walk in or pre-book a table using our website to guarantee your spot for late-night desserts."
        }
      },
      {
        "@type": "Question",
        "name": "Does Taste of Village make the best Samosa Chaat and Dahi Bhallay in London?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Many of our customers believe we serve the best authentic Samosa Chaat, Papri Chaat, and Dahi Bhallay near London. We strictly refuse to use tinned chickpeas; instead, we use traditional, time-consuming slow-cooking methods to prepare our ingredients. Our paapri and bhallay are freshly made in-house, never ready-made, ensuring a brilliant, nostalgic South Asian taste every time."
        }
      }
    ]
  });

  return (
    <div className="min-h-screen bg-brand-cacao py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead 
        title="Help & Legal Hub" 
        description="View Taste of Village's allergy information, terms and conditions, privacy policy, and FAQS."
        canonicalUrl={`/info?tab=${activeTab}`}
        schema={faqSchema}
      />
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-center text-brand-text mb-4 tracking-tight">
          Help & Legal Hub
        </h1>
        <p className="text-center text-brand-text/60 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
          Everything you need to know about navigating the Taste of Village experience, transparently and safely.
        </p>

        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Side Navigation */}
          <div className="md:w-1/4 flex-shrink-0">
            <div className="sticky top-32 bg-white rounded-3xl p-4 shadow-xl border border-brand-rose/30 space-y-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all ${
                    activeTab === tab.id
                    ? 'bg-brand-pink text-white shadow-md transform scale-[1.02]'
                    : 'text-brand-text/70 hover:bg-brand-rose/20 hover:text-brand-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === tab.id ? 'opacity-100 text-white' : 'opacity-0'} />
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="md:w-3/4 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-rose/20 animate-fade-in min-h-[60vh] prose prose-brand max-w-none">
            
            {activeTab === 'faq' && (
              <div className="space-y-8">
                <h2 className="font-display text-3xl font-bold text-brand-text flex items-center gap-3 border-b pb-4"><HelpCircle className="text-brand-pink"/> Grand Opening Success</h2>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-brand-text">What are your regular opening hours?</h4>
                    <p className="text-brand-text/70 leading-relaxed">We are now officially open daily! Our standard hours are 8:00 AM to Midnight (00:00) every single day, including weekends.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-brand-text">Do you have seating?</h4>
                    <p className="text-brand-text/70 leading-relaxed">Yes, we have limited luxury seating. Tables are available on a first-come, first-served basis unless explicitly booked via the "Book Table" page.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'allergies' && (
              <div className="space-y-8">
                <h2 className="font-display text-3xl font-bold text-brand-text border-b pb-4 text-red-600 flex items-center gap-3"><AlertTriangle/> Optimum Allergen Caution</h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl">
                  <p className="text-red-800 font-bold text-lg mb-2">CRITICAL NOTICE REGARDING SEVERE ALLERGIES</p>
                  <p className="text-red-700 leading-relaxed">
                    Taste of Village operates a thriving, open kitchen where cross-contamination is a fundamental risk. We use shared equipment to prepare items containing severe allergens.
                  </p>
                </div>
                
                <div className="space-y-4 text-brand-text/80 leading-relaxed">
                  <p><strong>NUTS & SEEDS:</strong> Pistachios, almonds, peanuts, and various seeds are standard ingredients scattered freely across our kitchen and used heavily in our Taste of Villages, Chaats, and Desserts. <strong>If you have a severe nut allergy, we strongly advise against dining with us to guarantee your safety.</strong></p>
                  
                  <p><strong>DAIRY:</strong> Fast-moving dairy (milk, ice cream, kulfi, yogurt) forms the bedrock of our menu. Very few items are truly dairy-free, and cross-contamination is highly likely.</p>

                  <p><strong>GLUTEN & WHEAT:</strong> Samosas, chaat papdi, and cakes contain heavy gluten. Buns and wraps are prepared on standard prep areas.</p>

                  <p className="italic bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                    While we maintain top hygiene standards, we CANNOT and DO NOT guarantee that any single item is 100% free of nuts, dairy, or gluten. You consume our products at your own risk if you suffer from anaphylaxis or severe allergic reactions.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'food' && (
              <div className="space-y-8">
                <h2 className="font-display text-3xl font-bold text-brand-text flex items-center gap-3 border-b pb-4"><Leaf className="text-brand-pistachio"/> Food & Hygiene Standards</h2>
                
                <div className="space-y-6 text-brand-text/80 leading-relaxed">
                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-3">100% Halal Guarantee</h3>
                    <p>Every single ingredient, meat product, gelatin trace, and syrup entering our premises is meticulously checked to ensure it is 100% Halal certified. We do not prepare, serve, or allow any non-halal items or alcohol into our premises. Period.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-3">Hygiene & Preparation</h3>
                    <p>Our kitchen adheres to the highest local authority guidelines for food safety. Staff wear gloves during prep handling, and our surfaces undergo intensive deep cleans every single shift cycle to prevent bacterial spread.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-3">Sourcing</h3>
                    <p>We source our dairy from local, traceable British farms, while importing our authentic spices, Rooh Afza, and specialized Taste of Village noodles from certified South Asian suppliers to preserve the true heritage taste.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-8">
                <h2 className="font-display text-3xl font-bold text-brand-text flex items-center gap-3 border-b pb-4"><RefreshCw className="text-blue-500"/> Return & Refund Policy</h2>
                
                <div className="space-y-6 text-brand-text/80 leading-relaxed">
                  <p>Due to the perishable nature of hot food and cold desserts, our return policy operates on extremely tight parameters inline with standard food delivery consumer rights.</p>

                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-3">Order Accuracy & Quality</h3>
                    <p>If you receive an incorrect item, or if the food quality falls significantly below our standards (e.g., spillage, burnt, or spoiled), you must report this to us <strong>within 1 hour</strong> of collection or delivery. Please bring the item back to the counter, or send photographic evidence if requested.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-3">Refunds</h3>
                    <p>Validated complaints will be compensated via a direct replacement or a refund. Refunds processed via Stripe or card terminal take 3-5 business days to clear into your account. We do not offer cash refunds for card payments.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-3">Change of Mind</h3>
                    <p>Because our kitchen begins preparation immediately upon receiving an order, we strictly do not offer refunds or cancellations for "change of mind" once the order ticket has printed in the kitchen.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <h2 className="font-display text-3xl font-bold text-brand-text flex items-center gap-3 border-b pb-4"><Shield className="text-gray-500"/> Privacy Policy</h2>
                
                <div className="space-y-6 text-brand-text/80 leading-relaxed">
                  <p>Taste of Village ("we", "our", "us") respects your privacy. This policy outlines how we collect, process, and protect your data.</p>

                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-2">What We Collect</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Order Data:</strong> Name, phone number, and order history strictly for fulfilling your collection/booking.</li>
                      <li><strong>Analytics:</strong> Anonymous usage data (e.g., page views) to help us improve the website.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-2">How We Use It</h3>
                    <p>Your phone number is used exclusively to contact you regarding your active order status or booking. We do NOT sell your data to third-party marketing agencies.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-2">Data Security</h3>
                    <p>All order data is encrypted and securely stored on Google Firebase servers. Only authenticated store admins have access to your order information.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-8">
                <h2 className="font-display text-3xl font-bold text-brand-text flex items-center gap-3 border-b pb-4"><MapPin className="text-brand-pink"/> Terms & Conditions</h2>
                
                <div className="space-y-6 text-brand-text/80 leading-relaxed">
                  <p>Welcome to Taste of Village. By using this website to place orders or book tables, you agree to the following terms:</p>
                  
                  <ul className="list-disc pl-5 space-y-3">
                    <li><strong>Service Availability:</strong> We reserve the right to refuse service, cancel orders, or close the store early during extremely busy periods or unforeseen circumstances.</li>
                    <li><strong>Pricing:</strong> All prices shown are inclusive of VAT where applicable. Prices are subject to change without prior notice.</li>
                    <li><strong>Order Collection:</strong> Customers must collect their orders within a reasonable timeframe. Uncollected hot food or melting desserts will be discarded after 1 hour for hygiene reasons, without refund.</li>
                    <li><strong>Booking Policies:</strong> Table bookings will be held for a maximum of 15 minutes past the reserved time before being released to walk-in customers.</li>
                  </ul>
                  
                  <p className="text-sm text-gray-400 italic pt-8 border-t mt-8 border-brand-rose/20">Last updated: April 2026. Registered Address: {SHOP_CONFIG.address}, {SHOP_CONFIG.postcode}.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
