import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save, X,
  AlertTriangle, Loader2, Check, Image as ImageIcon,
  PlusCircle, GripVertical, ToggleLeft, ToggleRight
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Variant  { id?: string; name: string; price_override: number; is_default: boolean; }
interface ModOption { id?: string; name: string; price_delta: number; is_default: boolean; is_available: boolean; }
interface ModGroup  { id?: string; name: string; description: string; is_required: boolean; max_selections: number; options: ModOption[]; }

const UK_ALLERGENS = [
  { key: 'cereals_gluten', label: 'Gluten',      emoji: '🌾' },
  { key: 'milk',           label: 'Milk',         emoji: '🥛' },
  { key: 'eggs',           label: 'Eggs',         emoji: '🥚' },
  { key: 'nuts',           label: 'Tree Nuts',    emoji: '🌰' },
  { key: 'peanuts',        label: 'Peanuts',      emoji: '🥜' },
  { key: 'soya',           label: 'Soya',         emoji: '🫘' },
  { key: 'fish',           label: 'Fish',         emoji: '🐟' },
  { key: 'crustaceans',    label: 'Crustaceans',  emoji: '🦐' },
  { key: 'molluscs',       label: 'Molluscs',     emoji: '🐚' },
  { key: 'mustard',        label: 'Mustard',      emoji: '🌭' },
  { key: 'sesame',         label: 'Sesame',       emoji: '🌱' },
  { key: 'celery',         label: 'Celery',       emoji: '🥬' },
  { key: 'lupin',          label: 'Lupin',        emoji: '🌼' },
  { key: 'sulphur_dioxide',label: 'Sulphites',    emoji: '⚗️' },
];

const CATEGORIES = [
  'Taste of Village','Dessert','Signature Dessert','Cookie Dough','Ice Cream',
  'Grill','Lunch','Drinks','English Breakfast','Sweet Breakfast',
  'Desi Breakfast','Breakfast Drinks','Salad','Cake',
];

const API = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

interface Props { posDarkMode: boolean; }

// ─── Component ────────────────────────────────────────────────────────────────
export const ItemBuilderPanel: React.FC<Props> = ({ posDarkMode }) => {
  const dm = posDarkMode;

  // Form state
  const [name,        setName]        = useState('');
  const [category,    setCategory]    = useState(CATEGORIES[0]);
  const [basePrice,   setBasePrice]   = useState('');
  const [description, setDescription] = useState('');
  const [popular,     setPopular]     = useState(false);
  const [variants,    setVariants]    = useState<Variant[]>([]);
  const [groups,      setGroups]      = useState<ModGroup[]>([]);
  const [allergens,   setAllergens]   = useState<Record<string, 'contains'|'may_contain'|null>>({});
  const [nutrition,   setNutrition]   = useState({ calories:'', protein_g:'', fat_g:'', carbs_g:'', salt_g:'', serving_size_g:'' });
  const [imageFile,   setImageFile]   = useState<File|null>(null);
  const [imagePreview,setImagePreview]= useState('');

  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');
  const [openSection, setOpenSection] = useState<string>('basic');
  const fileRef = useRef<HTMLInputElement>(null);

  const token = () => localStorage.getItem('pos_auth_token') || '';

  // Image preview
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const addVariant = () => setVariants(v => [...v, { name:'', price_override: Number(basePrice)||0, is_default: v.length===0 }]);
  const removeVariant = (i: number) => setVariants(v => v.filter((_,x)=>x!==i));
  const updateVariant = (i: number, field: keyof Variant, val: any) =>
    setVariants(v => v.map((x,j) => j===i ? { ...x, [field]: val } : field==='is_default' && val ? { ...x, is_default:false } : x));

  const addGroup = () => setGroups(g => [...g, { name:'', description:'', is_required:false, max_selections:1, options:[] }]);
  const removeGroup = (i: number) => setGroups(g => g.filter((_,x)=>x!==i));
  const updateGroup = (i: number, field: keyof ModGroup, val: any) =>
    setGroups(g => g.map((x,j) => j===i ? { ...x, [field]: val } : x));
  const addOption = (gi: number) =>
    setGroups(g => g.map((grp,j) => j===gi ? { ...grp, options: [...grp.options, { name:'', price_delta:0, is_default:false, is_available:true }] } : grp));
  const removeOption = (gi: number, oi: number) =>
    setGroups(g => g.map((grp,j) => j===gi ? { ...grp, options: grp.options.filter((_,x)=>x!==oi) } : grp));
  const updateOption = (gi: number, oi: number, field: keyof ModOption, val: any) =>
    setGroups(g => g.map((grp,j) => j===gi ? {
      ...grp,
      options: grp.options.map((o,k) => k===oi ? { ...o, [field]: val } : o)
    } : grp));

  const toggleAllergen = (key: string) =>
    setAllergens(a => {
      const cur = a[key];
      if (!cur)              return { ...a, [key]: 'contains' };
      if (cur==='contains')  return { ...a, [key]: 'may_contain' };
      return { ...a, [key]: null };
    });

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!name.trim() || (!basePrice && variants.length===0)) {
      setError('Name and at least one price are required.'); return;
    }
    setSaving(true); setError('');
    try {
      // 1. Create product
      const body: any = {
        name: name.trim(), category, description,
        price: variants.length ? 0 : parseFloat(basePrice)||0,
        is_active: true,
      };
      const res = await fetch(`${API}/api/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Product create failed: ${res.status}`);
      const { id: productId } = await res.json();

      // 2. Variants
      for (const v of variants) {
        await fetch(`${API}/api/v1/products/${productId}/variants`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
          body: JSON.stringify(v),
        });
      }

      // 3. Modifier groups + options
      for (const g of groups) {
        const gr = await fetch(`${API}/api/v1/products/${productId}/groups`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
          body: JSON.stringify({ name:g.name, description:g.description, is_required:g.is_required, max_selections:g.max_selections }),
        });
        if (!gr.ok) continue;
        const { id: groupId } = await gr.json();
        for (let oi=0; oi<g.options.length; oi++) {
          const opt = g.options[oi];
          await fetch(`${API}/api/v1/groups/${groupId}/options`, {
            method:'POST',
            headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
            body: JSON.stringify({ ...opt, sort_order:oi }),
          });
        }
      }

      // 4. Allergens
      const allergenPayload = Object.entries(allergens)
        .filter(([,v])=>!!v)
        .map(([allergen,severity])=>({ allergen, severity }));
      if (allergenPayload.length) {
        await fetch(`${API}/api/v1/products/${productId}/allergens`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
          body: JSON.stringify(allergenPayload),
        });
      }

      // 5. Nutrition
      const nutVals = Object.values(nutrition).filter(Boolean);
      if (nutVals.length) {
        const nutBody: any = {};
        Object.entries(nutrition).forEach(([k,v])=>{ if(v) nutBody[k]=Number(v); });
        await fetch(`${API}/api/v1/products/${productId}/nutrition`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
          body: JSON.stringify(nutBody),
        });
      }

      setSaved(true);
      // Reset form
      setTimeout(()=>{
        setName(''); setCategory(CATEGORIES[0]); setBasePrice(''); setDescription('');
        setVariants([]); setGroups([]); setAllergens({}); setNutrition({ calories:'', protein_g:'', fat_g:'', carbs_g:'', salt_g:'', serving_size_g:'' });
        setImageFile(null); setImagePreview(''); setSaved(false); setOpenSection('basic');
      }, 2000);

    } catch(e: any) {
      setError(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  // ─── Section wrapper ───────────────────────────────────────────────────────
  const Section = ({ id, title, icon, children, badge }: any) => {
    const open = openSection === id;
    return (
      <div className={`rounded-3xl overflow-hidden border ${dm ? 'border-white/10 bg-white/3' : 'border-gray-100 bg-gray-50/50'} mb-4`}>
        <button
          onClick={() => setOpenSection(open ? '' : id)}
          className={`w-full flex items-center justify-between px-6 py-5 font-bold text-sm ${dm ? 'text-white hover:bg-white/5' : 'text-cream hover:bg-gray-100/50'} transition-colors`}
        >
          <span className="flex items-center gap-3">{icon} {title}{badge && <span className="ml-2 bg-brand-pink/20 text-brand-pink text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}</span>
          {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
        {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
      </div>
    );
  };

  const input = `w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition-colors ${dm
    ? 'bg-white/5 border-white/10 text-white focus:border-terracotta placeholder:text-white/20'
    : 'bg-white border-gray-100 text-cream focus:border-brand-pink placeholder:text-gray-300'}`;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`font-display text-4xl font-bold ${dm ? '' : 'text-cream'}`}>Item Builder</h2>
          <p className={`text-sm mt-1 ${dm ? 'text-white/40' : 'text-cream/40'}`}>Add a new menu item with all customisation options</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg
            ${saved ? 'bg-green-500 text-white' : dm ? 'bg-terracotta text-pine hover:scale-105' : 'bg-cream text-white hover:scale-105'}
            disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {saving ? <Loader2 size={16} className="animate-spin"/> : saved ? <Check size={16}/> : <Save size={16}/>}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Item'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-5 py-4 mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          <AlertTriangle size={16}/> {error}
        </div>
      )}

      {/* ── Basic Info ── */}
      <Section id="basic" title="Basic Info" icon="📝" badge={name ? '✓' : undefined}>
        {/* Image */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer relative h-36 rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center transition-colors
            ${dm ? 'border-white/20 hover:border-terracotta' : 'border-gray-200 hover:border-brand-pink'}`}
        >
          {imagePreview
            ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview"/>
            : <div className="text-center"><ImageIcon size={28} className="mx-auto mb-2 opacity-30"/><p className={`text-xs font-semibold ${dm ? 'text-white/40' : 'text-gray-400'}`}>Click to upload photo</p></div>
          }
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0]||null)}/>
        </div>

        <input className={input} placeholder="Item name *" value={name} onChange={e=>setName(e.target.value)}/>

        <div className="grid grid-cols-2 gap-3">
          <select className={input} value={category} onChange={e=>setCategory(e.target.value)}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <input className={input} placeholder="Base price £ *" type="number" step="0.01" value={basePrice} onChange={e=>setBasePrice(e.target.value)}/>
        </div>

        <textarea className={`${input} resize-none`} rows={3} placeholder="Description (shown to customers)" value={description} onChange={e=>setDescription(e.target.value)}/>

        <label className={`flex items-center gap-3 cursor-pointer text-sm font-semibold ${dm?'text-white/70':'text-cream/70'}`}>
          <button onClick={()=>setPopular(p=>!p)} className={`transition-colors ${popular ? 'text-brand-pink' : dm ? 'text-white/30' : 'text-gray-300'}`}>
            {popular ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
          </button>
          Mark as popular ⭐
        </label>
      </Section>

      {/* ── Sizes / Variants ── */}
      <Section id="variants" title="Sizes / Variants" icon="📏" badge={variants.length||undefined}>
        <p className={`text-xs ${dm?'text-white/40':'text-gray-400'} mb-3`}>
          Add sizes (Small, Regular, Large) if this item comes in different sizes. Leave empty for a single-price item.
        </p>
        {variants.map((v,i) => (
          <div key={i} className="flex gap-2 items-center">
            <GripVertical size={16} className="opacity-20 flex-shrink-0"/>
            <input className={`${input} flex-1`} placeholder="Size name (e.g. Small)" value={v.name} onChange={e=>updateVariant(i,'name',e.target.value)}/>
            <input className={`${input} w-24`} type="number" step="0.01" placeholder="£0.00" value={v.price_override||''} onChange={e=>updateVariant(i,'price_override',parseFloat(e.target.value)||0)}/>
            <button
              onClick={()=>updateVariant(i,'is_default',true)}
              className={`text-[10px] font-black px-3 py-2 rounded-xl whitespace-nowrap transition-all border-2 ${v.is_default
                ? 'bg-brand-pink text-white border-brand-pink'
                : dm ? 'border-white/20 text-white/40 hover:border-brand-pink' : 'border-gray-200 text-gray-400 hover:border-brand-pink'}`}
            >
              {v.is_default ? '✓ Default' : 'Set default'}
            </button>
            <button onClick={()=>removeVariant(i)} className="p-2 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"><Trash2 size={14}/></button>
          </div>
        ))}
        <button onClick={addVariant} className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors ${dm?'border-white/20 text-white/50 hover:border-terracotta':'border-gray-200 text-gray-400 hover:border-brand-pink'}`}>
          <Plus size={14}/> Add Size
        </button>
      </Section>

      {/* ── Modifier Groups ── */}
      <Section id="modifiers" title="Modifier Groups" icon="🍽️" badge={groups.reduce((s,g)=>s+g.options.length,0)||undefined}>
        <p className={`text-xs ${dm?'text-white/40':'text-gray-400'} mb-3`}>
          Add option groups: "Sauce Choice", "Extras", "Meal Upgrade" etc. Each group has its own options.
        </p>

        {groups.map((g,gi) => (
          <div key={gi} className={`rounded-2xl border ${dm?'border-white/10 bg-white/5':'border-gray-100 bg-white'} p-4 space-y-3`}>
            {/* Group header */}
            <div className="flex gap-2 items-center">
              <input className={`${input} flex-1`} placeholder="Group name (e.g. Choose your sauce)" value={g.name} onChange={e=>updateGroup(gi,'name',e.target.value)}/>
              <button onClick={()=>removeGroup(gi)} className="p-2 text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={14}/></button>
            </div>
            <input className={`${input} text-xs`} placeholder="Helper text for customer (optional)" value={g.description} onChange={e=>updateGroup(gi,'description',e.target.value)}/>

            <div className="flex gap-3 flex-wrap">
              <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${dm?'text-white/60':'text-cream/60'}`}>
                <input type="checkbox" checked={g.is_required} onChange={e=>updateGroup(gi,'is_required',e.target.checked)} className="accent-pink-500"/>
                Required
              </label>
              <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${dm?'text-white/60':'text-cream/60'}`}>
                Max:
                <select
                  value={g.max_selections}
                  onChange={e=>updateGroup(gi,'max_selections',parseInt(e.target.value))}
                  className={`px-2 py-1 rounded-lg border text-xs ${dm?'bg-white/10 border-white/20 text-white':'bg-gray-50 border-gray-200'}`}
                >
                  {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} {n===1?'(radio)':'(checkboxes)'}</option>)}
                </select>
              </label>
            </div>

            {/* Options */}
            <div className="space-y-2 pl-2 border-l-2 border-brand-pink/20">
              {g.options.map((opt,oi) => (
                <div key={oi} className="flex gap-2 items-center">
                  <input className={`${input} flex-1`} placeholder="Option name (e.g. No Mayo)" value={opt.name} onChange={e=>updateOption(gi,oi,'name',e.target.value)}/>
                  <div className="relative flex-shrink-0">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${dm?'text-white/40':'text-gray-400'}`}>£</span>
                    <input
                      className={`${input} w-20 pl-7`} type="number" step="0.01" placeholder="0.00"
                      value={opt.price_delta||''}
                      onChange={e=>updateOption(gi,oi,'price_delta',parseFloat(e.target.value)||0)}
                    />
                  </div>
                  <button
                    onClick={()=>updateOption(gi,oi,'is_default',!opt.is_default)}
                    title="Pre-ticked for customer"
                    className={`text-[10px] font-black px-2 py-2 rounded-lg transition-all border ${opt.is_default?'bg-brand-pink text-white border-brand-pink':dm?'border-white/20 text-white/30':'border-gray-200 text-gray-400'}`}
                  >★</button>
                  <button onClick={()=>removeOption(gi,oi)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                </div>
              ))}
              <button onClick={()=>addOption(gi)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-dashed transition-colors ${dm?'border-white/20 text-white/40 hover:border-terracotta':'border-gray-200 text-gray-400 hover:border-brand-pink'}`}>
                <PlusCircle size={12}/> Add option
              </button>
            </div>
          </div>
        ))}

        <button onClick={addGroup} className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors ${dm?'border-white/20 text-white/50 hover:border-terracotta':'border-gray-200 text-gray-400 hover:border-brand-pink'}`}>
          <Plus size={14}/> Add Modifier Group
        </button>
      </Section>

      {/* ── Allergens ── */}
      <Section id="allergens" title="Allergens (UK Law)" icon="⚠️" badge={Object.values(allergens).filter(Boolean).length||undefined}>
        <p className={`text-xs ${dm?'text-white/40':'text-gray-400'} mb-4`}>
          Click once = <strong>Contains</strong> (solid badge). Click twice = <strong>May Contain</strong> (dashed badge). Click three times = remove.
        </p>
        <div className="flex flex-wrap gap-2">
          {UK_ALLERGENS.map(a => {
            const state = allergens[a.key];
            return (
              <button
                key={a.key}
                onClick={() => toggleAllergen(a.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                  state === 'contains'    ? 'bg-amber-100 text-amber-800 border-amber-400 scale-105' :
                  state === 'may_contain' ? 'bg-amber-50 text-amber-600 border-amber-300 border-dashed scale-105' :
                  dm ? 'border-white/15 text-white/40 hover:border-white/40' : 'border-gray-200 text-gray-400 hover:border-amber-300'
                }`}
              >
                <span>{a.emoji}</span> {a.label}
                {state === 'contains'    && <span className="ml-1 text-amber-600 font-black">•</span>}
                {state === 'may_contain' && <span className="ml-1 text-amber-400 font-black">○</span>}
              </button>
            );
          })}
        </div>
        <div className={`flex gap-6 text-[10px] mt-3 ${dm?'text-white/40':'text-gray-400'}`}>
          <span>● = Contains</span>
          <span>○ = May contain</span>
          <span>No mark = Not present</span>
        </div>
      </Section>

      {/* ── Nutrition ── */}
      <Section id="nutrition" title="Nutrition (Optional)" icon="🔬">
        <p className={`text-xs ${dm?'text-white/40':'text-gray-400'} mb-3`}>Per serving. Leave blank if unknown — you can add this later.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key:'serving_size_g', label:'Serving (g)', unit:'g' },
            { key:'calories',       label:'Calories',    unit:'kcal' },
            { key:'fat_g',          label:'Fat',         unit:'g' },
            { key:'carbs_g',        label:'Carbs',       unit:'g' },
            { key:'protein_g',      label:'Protein',     unit:'g' },
            { key:'salt_g',         label:'Salt',        unit:'g' },
          ].map(f => (
            <div key={f.key}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dm?'text-white/40':'text-gray-400'}`}>{f.label}</p>
              <div className="relative">
                <input
                  className={`${input} pr-8`} type="number" step="0.1" placeholder="—"
                  value={(nutrition as any)[f.key]}
                  onChange={e => setNutrition(n => ({ ...n, [f.key]: e.target.value }))}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${dm?'text-white/30':'text-gray-300'}`}>{f.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Bottom save */}
      <div className="py-6">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.01] disabled:opacity-60
            ${saved ? 'bg-green-500 text-white' : dm ? 'bg-terracotta text-pine' : 'bg-cream text-white'}`}
        >
          {saving ? '⏳ Saving to database…' : saved ? '✅ Item Saved!' : '💾 Save New Item to Menu'}
        </button>
        {error && <p className="text-red-500 text-xs text-center mt-3 font-semibold">{error}</p>}
      </div>
    </div>
  );
};
