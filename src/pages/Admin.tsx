import React, { useState, useEffect } from 'react';
import { getMenuItems, updateMenuItem, getBuilderConfig, saveBuilderConfig } from '../services/menuService';
import { MenuItem, BuilderConfig, BuilderOption } from '../types';
import { useStore } from '../context/StoreContext';
import { ROADMAP_QUESTIONS } from '../constants';
import { IntelligentMediaPanel } from './AdminPOS/IntelligentMediaPanel';
import {
  ChefHat,
  Calendar,
  Settings,
  CheckCircle,
  AlertTriangle,
  FileText,
  Sliders,
  Plus,
  Trash2,
  Wand2
} from 'lucide-react';

export const Admin = () => {
  const { orders, bookings, updateOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'kds' | 'bookings' | 'roadmap' | 'menu' | 'builder' | 'website' | 'intelligentmedia'>('roadmap');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [builderConfig, setBuilderConfig] = useState<BuilderConfig | null>(null);

  useEffect(() => {
    if (activeTab === 'menu') {
      getMenuItems().then(setMenuItems).catch(console.error);
    }
    if (activeTab === 'builder') {
      getBuilderConfig().then(conf => {
         if (conf) setBuilderConfig(conf);
         else setBuilderConfig({ basePrice: 5.5, bases: [], noodles: [], syrups: [], scoops: [], extras: [], toppings: [] });
      }).catch(console.error);
    }
  }, [activeTab]);

  const handleMenuChange = (id: string, field: 'name' | 'price', value: string | number) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSaveMenu = async (id: string, name: string, price: number) => {
    try {
      await updateMenuItem(id, { name, price: Number(price) });
      alert("Live menu updated successfully!");
    } catch(e) {
      alert("Error saving: " + e);
    }
  };

  const handleSaveBuilderConfig = async () => {
    if(!builderConfig) return;
    try {
      await saveBuilderConfig(builderConfig);
      alert("Builder configuration fully published to the Cloud!");
    } catch(e) {
      alert("Error saving: " + e);
    }
  };

  const updateBuilderOption = (cat: keyof Omit<BuilderConfig, 'basePrice'>, id: string, field: 'name'|'price', val: string|number) => {
    setBuilderConfig(prev => prev ? {
      ...prev,
      [cat]: prev[cat].map(o => o.id === id ? { ...o, [field]: val } : o)
    } : prev);
  };

  const addBuilderOption = (cat: keyof Omit<BuilderConfig, 'basePrice'>) => {
    const newOpt = { id: `opt_${Date.now()}`, name: 'New Item', price: 0 };
    setBuilderConfig(prev => prev ? { ...prev, [cat]: [...prev[cat], newOpt] } : prev);
  };

  const removeBuilderOption = (cat: keyof Omit<BuilderConfig, 'basePrice'>, id: string) => {
    setBuilderConfig(prev => prev ? { ...prev, [cat]: prev[cat].filter(o => o.id !== id) } : prev);
  };

  const pendingOrders = orders.filter(o => o.status !== 'completed');

  const renderBuilderCategoryList = (title: string, category: keyof Omit<BuilderConfig, 'basePrice'>) => (
    <div className="mb-8 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <button onClick={() => addBuilderOption(category)} className="text-brand-pink hover:bg-brand-pink/10 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 transition-colors">
          <Plus size={16} /> Add Item
        </button>
      </div>
      <div className="p-4 space-y-3">
        {builderConfig?.[category]?.map(opt => (
           <div key={opt.id} className="flex gap-2 items-center">
             <input type="text" value={opt.name} onChange={e => updateBuilderOption(category, opt.id, 'name', e.target.value)} className="flex-1 border p-2 rounded focus:border-brand-pink outline-none" />
             <div className="w-32 flex items-center border rounded px-2 focus-within:border-brand-pink">
               <span className="text-gray-400">£</span>
               <input type="number" step="0.10" value={opt.price} onChange={e => updateBuilderOption(category, opt.id, 'price', parseFloat(e.target.value))} className="w-full p-2 outline-none" />
             </div>
             <button onClick={() => removeBuilderOption(category, opt.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded">
               <Trash2 size={20} />
             </button>
           </div>
        ))}
        {builderConfig?.[category]?.length === 0 && <p className="text-gray-400 italic text-sm py-2">No items listed. Added items will appear to customers.</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-text text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="font-display text-2xl font-bold text-brand-pink">Falooda OS</h2>
          <p className="text-xs text-brand-text/60 mt-1">v1.0.0 Local Build</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'menu' ? 'bg-brand-pink text-brand-text font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Settings size={20} />
            Live Menu Editor
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'builder' ? 'bg-brand-pink text-brand-text font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Sliders size={20} />
            Builder Config
          </button>
          <button
            onClick={() => setActiveTab('intelligentmedia')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'intelligentmedia' ? 'bg-brand-pink text-brand-text font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Wand2 size={20} />
            Intelligent Media Studio
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'roadmap' ? 'bg-brand-pink text-brand-text font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <FileText size={20} />
            Plan & Roadmap
          </button>
          <button
            onClick={() => setActiveTab('kds')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'kds' ? 'bg-brand-pink text-brand-text font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <ChefHat size={20} />
            Kitchen Display
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'bookings' ? 'bg-brand-pink text-brand-text font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Calendar size={20} />
            Reservations
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'website' ? 'bg-brand-pink text-brand-text font-bold' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <FileText size={20} />
            Web Collections
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'intelligentmedia' && (
          <IntelligentMediaPanel />
        )}
        {/* Builder Settings Tab */}
        {activeTab === 'builder' && builderConfig && (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-brand-text">Builder Settings CMS</h2>
                <p className="text-gray-500">Configure ingredient prices and options for Make-Your-Own Faloodas.</p>
              </div>
              <button onClick={handleSaveBuilderConfig} className="bg-brand-pistachio text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-pistachio/90 shadow-md">
                Publish Configuration
              </button>
            </div>
            
            <div className="mb-8 p-6 bg-white rounded-3xl border border-brand-rose/50 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Starting Base Price</h3>
                <p className="text-xs text-gray-500">The fixed cost of the Falooda before any premium additions.</p>
              </div>
              <div className="w-32 flex items-center border border-gray-300 rounded px-3 py-2 bg-gray-50">
                 <span className="text-gray-400 mr-1">£</span>
                 <input 
                   type="number" step="0.10" 
                   value={builderConfig.basePrice} 
                   onChange={e => setBuilderConfig(p => p ? {...p, basePrice: parseFloat(e.target.value)} : p)} 
                   className="w-full bg-transparent font-bold outline-none" 
                 />
              </div>
            </div>

            {renderBuilderCategoryList('Step 1: Milk Bases', 'bases')}
            {renderBuilderCategoryList('Step 2: Signature Syrups', 'syrups')}
            {renderBuilderCategoryList('Step 3: Ice Cream Scoops', 'scoops')}
            {renderBuilderCategoryList('Step 4: Luxury Toppings', 'toppings')}
          </div>
        )}

        {/* Live Menu Editor Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-3xl font-bold text-brand-text">Live Menu Editor</h2>
              <p className="text-gray-500">Changes here update the public website instantly.</p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-gray-600">ID</th>
                    <th className="p-4 font-bold text-gray-600">Name (Editable)</th>
                    <th className="p-4 font-bold text-gray-600">Price (Editable)</th>
                    <th className="p-4 font-bold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-xs font-mono text-gray-400">{item.id}</td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => handleMenuChange(item.id, 'name', e.target.value)}
                          className="border border-gray-300 rounded p-2 w-full font-bold focus:border-brand-pink outline-none"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">£</span>
                          <input 
                            type="number" 
                            step="0.10"
                            value={item.price} 
                            onChange={(e) => handleMenuChange(item.id, 'price', parseFloat(e.target.value))}
                            className="border border-gray-300 rounded p-2 w-24 font-bold focus:border-brand-pink outline-none"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleSaveMenu(item.id, item.name, item.price)}
                          className="bg-brand-text text-white px-4 py-2 rounded font-bold hover:bg-gray-800 transition-colors"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Roadmap & Planning Tab */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-rose/50">
              <h2 className="font-display text-3xl font-bold text-brand-dark mb-4">Project Roadmap & Strategy</h2>
              <p className="text-gray-600 mb-6">
                You requested a comprehensive plan. This OS is designed to run locally on your 64GB machine using Docker.
                Below are the critical questions we need to answer to move from this MVP to a live store environment.
              </p>

              <div className="grid gap-4">
                {ROADMAP_QUESTIONS.map(q => (
                  <div key={q.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="p-2 bg-brand-mint/20 text-brand-mintDark rounded-lg">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{q.category}</span>
                      <h4 className="font-bold text-gray-800 text-lg">{q.question}</h4>
                      <div className="mt-2 flex gap-2">
                        <button className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100">Mark Resolved</button>
                        <button className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100">Add Note</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KDS Tab */}
        {activeTab === 'kds' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-3xl font-bold text-brand-text">Kitchen Display System</h2>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-brand-matcha text-brand-text rounded-full text-sm font-bold">Live Orders: {pendingOrders.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border-l-4 border-brand-pink overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-lg">#{order.id.split('-')[1]}</span>
                      <span className="ml-2 text-xs uppercase font-bold bg-gray-200 px-2 py-1 rounded">{order.type}</span>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">{item.quantity || 1}x {item.name || 'Unknown Item'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50 border-t flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600"
                      >
                        Start Prep
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 bg-brand-mintDark text-white py-2 rounded-lg font-bold hover:bg-teal-600"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="font-display text-3xl font-bold text-brand-dark mb-8">Table Reservations</h2>
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-6 font-bold text-gray-600">Name</th>
                    <th className="p-6 font-bold text-gray-600">Date & Time</th>
                    <th className="p-6 font-bold text-gray-600">Guests</th>
                    <th className="p-6 font-bold text-gray-600">Status</th>
                    <th className="p-6 font-bold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="p-6 font-bold">{booking.name || booking.customerName}</td>
                      <td className="p-6">{booking.date} at {booking.time}</td>
                      <td className="p-6">{booking.guests} ppl</td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-brand-matcha text-brand-text rounded-full text-xs font-bold uppercase">
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <button className="text-brand-pink hover:underline font-bold">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Website Collections Tab */}
        {activeTab === 'website' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-brand-dark mb-2">Website Collections</h2>
                <p className="text-gray-600">Full historical log of every single order coming from the Falooda & Co website.</p>
              </div>
              <div className="bg-brand-pistachio text-white font-bold p-4 rounded-xl shadow border border-brand-pistachio/50 grid grid-cols-2 gap-8 text-center text-brand-text">
                <div>
                  <div className="text-sm uppercase opacity-70">Total Orders</div>
                  <div className="text-3xl font-black">{orders.length}</div>
                </div>
                <div>
                  <div className="text-sm uppercase opacity-70">Total Revenue</div>
                  <div className="text-3xl font-black">£{(orders || []).reduce((acc, order) => acc + (Number(order?.total) || 0), 0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-brand-rose/30">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-6 font-bold text-gray-600">Order ID</th>
                    <th className="p-6 font-bold text-gray-600">Time</th>
                    <th className="p-6 font-bold text-gray-600">Customer Details</th>
                    <th className="p-6 font-bold text-gray-600">Order Value</th>
                    <th className="p-6 font-bold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[... (orders || [])].reverse().map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-6 font-mono font-bold text-brand-text">#{order.id?.split('-')[1] || order.id?.slice(0, 5)}</td>
                      <td className="p-6 text-sm text-gray-500">{order.timestamp ? new Date(order.timestamp).toLocaleString('en-GB') : 'N/A'}</td>
                      <td className="p-6">
                        <div className="font-bold text-brand-dark">{order.customerName || 'Walk-In'}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone || ''}</div>
                      </td>
                      <td className="p-6 font-bold text-brand-dark">£{(Number(order?.total) || 0).toFixed(2)}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-brand-pistachio text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(orders || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400 font-bold">No online collections recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};