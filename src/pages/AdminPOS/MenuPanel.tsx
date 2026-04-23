import React from 'react';
import { Plus, Edit2, Trash2, Printer } from 'lucide-react';

interface MenuPanelProps {
  categories: any[];
  soldOutItems: string[];
  toggleItemSoldOut: (id: string, isSoldOut: boolean) => Promise<void>;
  // Edit state
  editingItem: any;
  setEditingItem: (item: any) => void;
  editName: string;
  setEditName: (v: string) => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  editDesc: string;
  setEditDesc: (v: string) => void;
  editCategory: string;
  setEditCategory: (v: string) => void;
  savingEdit: boolean;
  setSavingEdit: (v: boolean) => void;
  pendingImageFile: File | null;
  setPendingImageFile: (f: File | null) => void;
  // Add item state
  showAddMenuItem: boolean;
  setShowAddMenuItem: (v: boolean) => void;
  addMenuCategory: string;
  setAddMenuCategory: (v: string) => void;
  newMenuItemName: string;
  setNewMenuItemName: (v: string) => void;
  newMenuItemPrice: string;
  setNewMenuItemPrice: (v: string) => void;
  newMenuItemDesc: string;
  setNewMenuItemDesc: (v: string) => void;
  // Sync state
  menuSyncing: boolean;
  setMenuSyncing: (v: boolean) => void;
  // Hardware state
  currentPrinterIp: string;
  setCurrentPrinterIp: (v: string) => void;
  printerProtocol: 'http' | 'https';
  setPrinterProtocol: (v: 'http' | 'https') => void;
  // Z-Report
  printZReport: () => Promise<void>;
  posSubmitting: boolean;
  posDarkMode: boolean;
}

export const MenuPanel: React.FC<MenuPanelProps> = (props) => {
  const {
    categories, soldOutItems, toggleItemSoldOut,
    editingItem, setEditingItem, editName, setEditName, editPrice, setEditPrice,
    editDesc, setEditDesc, editCategory, setEditCategory, savingEdit, setSavingEdit,
    pendingImageFile, setPendingImageFile,
    showAddMenuItem, setShowAddMenuItem, addMenuCategory, setAddMenuCategory,
    newMenuItemName, setNewMenuItemName, newMenuItemPrice, setNewMenuItemPrice,
    newMenuItemDesc, setNewMenuItemDesc,
    menuSyncing, setMenuSyncing,
    currentPrinterIp, setCurrentPrinterIp, printerProtocol, setPrinterProtocol,
    printZReport, posSubmitting, posDarkMode
  } = props;

  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditDesc(item.description || '');
    setEditCategory(item.category || '');
    setPendingImageFile(null);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      let finalImageUrl = editingItem.image;
      if (pendingImageFile) {
        const { uploadMenuImage } = await import('../../services/menuService');
        finalImageUrl = await uploadMenuImage(editingItem.id, pendingImageFile);
      }
      const { updateMenuItem } = await import('../../services/menuService');
      await updateMenuItem(editingItem.id, {
        name: editName.trim(),
        price: parseFloat(editPrice),
        description: editDesc.trim(),
        category: editCategory as any,
        ...(pendingImageFile && { image: finalImageUrl })
      });
      if (pendingImageFile && editingItem.image && editingItem.image.startsWith('blob:')) {
        URL.revokeObjectURL(editingItem.image);
      }
      setEditingItem(null);
      setPendingImageFile(null);
      window.location.reload();
    } catch (e) {
      alert('❌ Save failed: ' + (e as Error).message);
    }
    setSavingEdit(false);
  };

  const handleDeactivate = async (itemId: string, itemName: string) => {
    if (!confirm(`Remove "${itemName}" from the menu? It can be restored later.`)) return;
    try {
      const { deactivateMenuItem } = await import('../../services/menuService');
      await deactivateMenuItem(itemId);
      window.location.reload();
    } catch (e) {
      alert('❌ Failed: ' + (e as Error).message);
    }
  };

  const handleAddItem = async () => {
    if (!newMenuItemName.trim() || !newMenuItemPrice) return;
    try {
      const { addMenuItem } = await import('../../services/menuService');
      await addMenuItem({
        id: `custom_${Date.now()}`,
        name: newMenuItemName.trim(),
        price: parseFloat(newMenuItemPrice),
        description: newMenuItemDesc.trim(),
        category: addMenuCategory as any,
        image: '/assets/placeholder.png',
        popular: false,
      });
      setNewMenuItemName(''); setNewMenuItemPrice(''); setNewMenuItemDesc('');
      setShowAddMenuItem(false);
      window.location.reload();
    } catch (e) {
      alert('❌ Failed to add item: ' + (e as Error).message);
    }
  };

  const categoryLabels: Record<string, string> = {
    curry: '🍨 Taste of Villages', milkshake: '🥤 Milkshakes', chaat: '🥘 Chaats',
    wrap: '🌯 Wraps', fries: '🍟 Fries', hot_drink: '☕ Hot Drinks',
    beverage: '🧃 Juices', wellness_shot: '💊 Wellness', cake: '🎂 Cakes',
    traditional_meetha: '🍮 Meetha', signature_dessert: '🍰 Desserts',
    cookie_dough: '🍪 Cookie Dough', english_breakfast: '🍳 English Breakfast',
    sweet_breakfast: '🥞 Sweet Breakfast', desi_breakfast: '🫓 Desi Breakfast',
    breakfast_drinks: '☕ Breakfast Drinks',
    // New categories (v1.3)
    hot_drinks: '☕ Hot Drinks', milkshakes: '🥤 Milkshakes',
    fresh_juice: '🍊 Fresh Pressed', juice_blends: '🌈 Mix & Glow',
    wellness_shots: '💪 Wellness Shots', cold_beverages: '🧊 Cold Beverages',
    dessert: '🍰 Desserts', lunch: '🍔 Lunch', salad: '🥗 Salads',
    ice_cream: '🍦 Ice Cream', signature_desserts: '✨ Signature Desserts',
  };

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="font-display text-4xl font-bold">Menu Management</h2>
          <p className={`text-sm mt-1 ${posDarkMode ? 'text-white/60' : 'text-pine/60'}`}>Click any item to edit. Changes go live instantly.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              setMenuSyncing(true);
              try {
                const { seedMenuToFirestore } = await import('../../scripts/seedMenu');
                const result = await seedMenuToFirestore();
                alert(`✅ ${result.seeded} new items synced, ${result.skipped} already existed.`);
                if (result.seeded > 0) window.location.reload();
              } catch (e) { alert('❌ ' + (e as Error).message); }
              setMenuSyncing(false);
            }}
            disabled={menuSyncing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-40 border ${
              posDarkMode 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-pine/5 border-pine/10 text-pine hover:bg-pine/10'
            }`}
          >
            {menuSyncing ? '⏳ Syncing...' : '☁️ Sync Defaults'}
          </button>
          <button
            onClick={async () => {
              setMenuSyncing(true);
              try {
                const { updateMenuImages } = await import('../../scripts/seedMenu');
                const result = await updateMenuImages();
                alert(`✅ ${result.updated} images fixed, ${result.skipped} already correct.`);
                if (result.updated > 0) window.location.reload();
              } catch (e) { alert('❌ ' + (e as Error).message); }
              setMenuSyncing(false);
            }}
            disabled={menuSyncing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-40 border ${
              posDarkMode 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-pine/5 border-pine/10 text-pine hover:bg-pine/10'
            }`}
          >
            {menuSyncing ? '⏳ Syncing...' : '🖼️ Fix Images'}
          </button>
          <button
            onClick={async () => {
              setMenuSyncing(true);
              try {
                const { BUILDER_CONFIG } = await import('../../constants');
                await fetch('/api/v1/settings/builder_config', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(BUILDER_CONFIG),
                });
                alert('✅ Builder config synced to live database!');
              } catch (e) { alert('❌ ' + (e as Error).message); }
              setMenuSyncing(false);
            }}
            disabled={menuSyncing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-40 border ${
              posDarkMode 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-pine/5 border-pine/10 text-pine hover:bg-pine/10'
            }`}
          >
            {menuSyncing ? '⏳ Syncing...' : '🔧 Sync Builder Config'}
          </button>
          <button
            onClick={() => { setAddMenuCategory('curry'); setShowAddMenuItem(true); }}
            className="px-5 py-2.5 bg-terracotta text-pine rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Hardware Settings Block */}
      <div className={`p-6 rounded-[2rem] mb-10 border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-pine/5 border-pine/10'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold">Hardware Settings</h3>
            <p className={`text-sm mt-1 ${posDarkMode ? 'text-white/50' : 'text-pine/50'}`}>Configure your local Epson TM-m30II Kitchen Printer IP Address for this tablet.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest ${posDarkMode ? 'text-white/50' : 'text-pine/50'}`}>Printer IP</span>
            <select
              value={printerProtocol}
              onChange={e => {
                const val = e.target.value as 'http' | 'https';
                setPrinterProtocol(val);
                localStorage.setItem('epsonProtocol', val);
              }}
              className={`px-3 py-2.5 rounded-xl font-bold text-sm outline-none transition-all border ${
                posDarkMode 
                  ? 'bg-black/20 border-white/10 text-white focus:border-terracotta focus:bg-black/40' 
                  : 'bg-white border-pine/10 text-pine focus:border-pine focus:bg-white'
              }`}
            >
              <option value="http">http://</option>
              <option value="https">https://</option>
            </select>
            <input 
              type="text" 
              value={currentPrinterIp} 
              onChange={e => {
                const val = e.target.value;
                setCurrentPrinterIp(val);
                localStorage.setItem('epsonIp', val);
              }} 
              placeholder="192.168.1.136"
              className={`px-4 py-2.5 rounded-xl font-mono text-sm w-40 outline-none transition-all border ${
                posDarkMode 
                  ? 'bg-black/20 border-white/10 text-white focus:border-terracotta focus:bg-black/40' 
                  : 'bg-white border-pine/10 text-pine focus:border-pine focus:bg-white'
              }`}
            />
            <button
              onClick={async () => {
                const ip = currentPrinterIp;
                const protocol = printerProtocol;
                const url = `${protocol}://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=5000`;
                const testXml = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"><text align="center" smooth="true" width="2" height="2">TASTE OF VILLAGE&#10;</text><text align="center">--- PRINTER TEST ---&#10;&#10;</text><text align="left">Status: CONNECTED&#10;</text><text align="left">IP: ${ip}&#10;</text><text align="left">Protocol: ${protocol.toUpperCase()}&#10;</text><text align="left">Time: ${new Date().toLocaleString()}&#10;&#10;</text><text align="center">If you can read this,&#10;your printer is working!&#10;&#10;</text><feed unit="24"/><cut type="feed"/></epos-print></s:Body></s:Envelope>`;
                try {
                  const c = new AbortController();
                  const t = setTimeout(() => c.abort(), 3000);
                  await fetch(url, { method:'POST', headers:{'Content-Type':'text/plain; charset=utf-8'}, body: testXml, signal: c.signal });
                  clearTimeout(t);
                  alert(`✅ Test print sent to ${protocol}://${ip}!`);
                } catch (err: any) { alert(`❌ Error reaching printer: ${err.name} - ${err.message}\nCheck Developer Tools (F12) Console for details.`); }
              }}
              className="px-5 py-2.5 bg-terracotta text-pine rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
            >
              <Printer size={14} /> Test
            </button>
            <button
              onClick={printZReport}
              disabled={posSubmitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-40 border ${
                posDarkMode 
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                  : 'bg-pine/5 border-pine/10 text-pine hover:bg-pine/10'
              }`}
            >
              {posSubmitting ? '⏳ Printing...' : '📊 Z-Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      {categories.map(cat => (
        <div key={cat.id} className="mb-8">
          <h3 className="font-display text-2xl font-bold mb-4 tracking-tight">{categoryLabels[cat.id] || cat.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.products.map((item: any) => (
              <div key={item.id} className={`${posDarkMode ? 'pine-card' : 'bg-white shadow-xl border border-pine/5 text-pine'} p-5 rounded-[2rem] flex items-center gap-4 group hover:scale-[1.01] transition-all cursor-pointer`} onClick={() => openEdit(item)}>
                <img src={item.image} alt="" onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/placeholder.png'; }} className={`w-16 h-16 rounded-2xl object-cover shadow-md border ${posDarkMode ? 'border-white/10' : 'border-pine/5'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${item.is86d ? 'line-through opacity-50' : ''}`}>{item.name}</p>
                  <p className="text-terracotta font-black text-sm">£{item.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); toggleItemSoldOut(item.id, soldOutItems.includes(item.id)); }}
                    className={`p-2 rounded-xl text-xs font-black ${
                      soldOutItems.includes(item.id) 
                        ? 'bg-red-500/20 text-red-400' 
                        : (posDarkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-pine/5 text-pine/40 hover:bg-pine/10')
                    }`}
                    title={soldOutItems.includes(item.id) ? 'Mark Available' : 'Mark Sold Out'}
                  >
                    {soldOutItems.includes(item.id) ? '86\'D' : '86'}
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDeactivate(item.id, item.name); }}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setEditingItem(null)}>
          <div className={`${posDarkMode ? 'glass-pine text-white border-white/10' : 'bg-white text-pine border-pine/10'} p-10 rounded-[3rem] border max-w-lg w-full mx-4 animate-liquid space-y-6`} onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-2xl font-bold">Edit Item</h3>
            <div className={`relative w-full h-48 rounded-2xl overflow-hidden border mb-2 group cursor-pointer ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-pine/5 border-pine/10'}`}
              onClick={() => document.getElementById('editImageInput')?.click()}
            >
              <img src={pendingImageFile ? URL.createObjectURL(pendingImageFile) : editingItem.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Edit2 size={24} className="text-white" />
              </div>
              <input id="editImageInput" type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) setPendingImageFile(e.target.files[0]); }}
              />
            </div>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none transition-colors border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`} placeholder="Name" />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`} placeholder="Price" />
              <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`}>
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none resize-none border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`} placeholder="Description" />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditingItem(null)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${posDarkMode ? 'glass-pine' : 'bg-pine/5 text-pine'}`}>Cancel</button>
              <button disabled={savingEdit} onClick={saveEdit} className="flex-1 py-3 bg-terracotta text-pine rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 hover:scale-[1.02] transition-all">
                {savingEdit ? '⏳ Saving...' : '✅ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddMenuItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setShowAddMenuItem(false)}>
          <div className={`${posDarkMode ? 'glass-pine text-white border-white/10' : 'bg-white text-pine border-pine/10'} p-10 rounded-[3rem] border max-w-lg w-full mx-4 animate-liquid space-y-6`} onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-2xl font-bold">Add Menu Item</h3>
            <div>
              <label className="text-[10px] font-black text-creamMuted uppercase tracking-widest mb-2 block">Category</label>
              <select value={addMenuCategory} onChange={e => setAddMenuCategory(e.target.value)} className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none transition-colors border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`}>
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-creamMuted uppercase tracking-widest mb-2 block">Item Name</label>
              <input type="text" value={newMenuItemName} onChange={e => setNewMenuItemName(e.target.value)} placeholder="e.g. Malai Kulfi" className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none transition-colors border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-creamMuted uppercase tracking-widest mb-2 block">Price (£)</label>
                <input type="number" step="0.01" value={newMenuItemPrice} onChange={e => setNewMenuItemPrice(e.target.value)} placeholder="5.99" className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`} />
              </div>
              <div>
                <label className="text-[10px] font-black text-creamMuted uppercase tracking-widest mb-2 block">Description</label>
                <input type="text" value={newMenuItemDesc} onChange={e => setNewMenuItemDesc(e.target.value)} placeholder="Short description" className={`w-full px-4 py-3 rounded-xl text-sm focus:border-terracotta outline-none border ${posDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-pine/10 text-pine'}`} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAddMenuItem(false)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${posDarkMode ? 'glass-pine' : 'bg-pine/5 text-pine'}`}>Cancel</button>
              <button disabled={!newMenuItemName.trim() || !newMenuItemPrice} onClick={handleAddItem} className="flex-1 py-3 bg-terracotta text-pine rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 hover:scale-[1.02] transition-all">
                ➕ Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
