import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, Info, ChevronDown, ChevronUp, Leaf } from 'lucide-react';
import type { MenuItem, CartItem } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  name: string;       // 'Small' | 'Regular' | 'Large'
  price_override: number;
  is_default: boolean;
  sort_order: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price_delta: number;
  is_default: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  description: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  options: ModifierOption[];
}

export interface Allergen {
  allergen: string;
  severity: 'contains' | 'may_contain';
}

export interface FullMenuItem extends MenuItem {
  variants?: ProductVariant[];
  modifier_groups?: ModifierGroup[];
  allergens?: Allergen[];
  nutrition?: {
    calories?: number;
    protein_g?: number;
    fat_g?: number;
    carbs_g?: number;
    serving_size_g?: number;
  };
}

interface CustomisationModalProps {
  item: FullMenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

// ─── Allergen display config ─────────────────────────────────────────────────

const ALLERGEN_CONFIG: Record<string, { label: string; emoji: string; colour: string }> = {
  milk:            { label: 'Milk',         emoji: '🥛', colour: 'bg-blue-50 text-blue-800 border-blue-200' },
  eggs:            { label: 'Eggs',         emoji: '🥚', colour: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  cereals_gluten:  { label: 'Gluten',       emoji: '🌾', colour: 'bg-amber-50 text-amber-800 border-amber-200' },
  nuts:            { label: 'Tree Nuts',    emoji: '🌰', colour: 'bg-orange-50 text-orange-800 border-orange-200' },
  peanuts:         { label: 'Peanuts',      emoji: '🥜', colour: 'bg-red-50 text-red-800 border-red-200' },
  soya:            { label: 'Soya',         emoji: '🫘', colour: 'bg-green-50 text-green-800 border-green-200' },
  fish:            { label: 'Fish',         emoji: '🐟', colour: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  crustaceans:     { label: 'Crustaceans',  emoji: '🦐', colour: 'bg-pink-50 text-pink-800 border-pink-200' },
  molluscs:        { label: 'Molluscs',     emoji: '🐚', colour: 'bg-purple-50 text-purple-800 border-purple-200' },
  mustard:         { label: 'Mustard',      emoji: '🟡', colour: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  sesame:          { label: 'Sesame',       emoji: '🌱', colour: 'bg-lime-50 text-lime-800 border-lime-200' },
  celery:          { label: 'Celery',       emoji: '🥬', colour: 'bg-green-50 text-green-800 border-green-200' },
  lupin:           { label: 'Lupin',        emoji: '💛', colour: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  sulphur_dioxide: { label: 'Sulphites',    emoji: '⚗️', colour: 'bg-gray-50 text-gray-800 border-gray-200' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CustomisationModal: React.FC<CustomisationModalProps> = ({ item, onClose, onAddToCart }) => {
  // Size variant selection
  const defaultVariant = item.variants?.find(v => v.is_default) ?? item.variants?.[0] ?? null;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);

  // Modifier selections: groupId → Set of selected optionIds
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    item.modifier_groups?.forEach(g => {
      const defaults = new Set(g.options.filter(o => o.is_default).map(o => o.id));
      init[g.id] = defaults;
    });
    return init;
  });

  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showNutrition, setShowNutrition] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // ─── Price Calculation ──────────────────────────────────────────────────────

  const totalPrice = useMemo(() => {
    let base = selectedVariant ? selectedVariant.price_override : item.price;

    // Add modifier price deltas
    item.modifier_groups?.forEach(g => {
      const selected = selectedOptions[g.id] ?? new Set();
      g.options.forEach(opt => {
        if (selected.has(opt.id)) {
          base += opt.price_delta;
        }
      });
    });

    return base * quantity;
  }, [selectedVariant, selectedOptions, quantity, item]);

  // ─── Validation (required groups) ──────────────────────────────────────────

  const missingRequired = item.modifier_groups?.some(g =>
    g.is_required && (selectedOptions[g.id]?.size ?? 0) < g.min_selections
  ) ?? false;

  // ─── Option toggle ──────────────────────────────────────────────────────────

  const toggleOption = (group: ModifierGroup, optionId: string) => {
    setSelectedOptions(prev => {
      const current = new Set(prev[group.id] ?? []);

      if (group.max_selections === 1) {
        // Radio behaviour — only one at a time
        return { ...prev, [group.id]: new Set([optionId]) };
      }

      // Checkbox behaviour
      if (current.has(optionId)) {
        current.delete(optionId);
      } else if (current.size < group.max_selections) {
        current.add(optionId);
      }
      return { ...prev, [group.id]: current };
    });
  };

  // ─── Build cart item ────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (missingRequired) return;

    // Build human-readable modifiers summary for kitchen display
    const modifierSummary: string[] = [];
    item.modifier_groups?.forEach(g => {
      const selected = selectedOptions[g.id] ?? new Set();
      g.options.forEach(opt => {
        if (selected.has(opt.id)) modifierSummary.push(opt.name);
      });
    });
    if (specialInstructions.trim()) modifierSummary.push(`Note: ${specialInstructions.trim()}`);

    const unitPrice = selectedVariant ? selectedVariant.price_override : item.price;
    const modifierDelta = modifierSummary.length > 0
      ? (totalPrice / quantity - unitPrice)
      : 0;

    const cartItem: CartItem = {
      ...item,
      price: totalPrice / quantity,
      quantity,
      modifiers: modifierSummary.length > 0
        ? {
            size: selectedVariant?.name ?? '',
            options: modifierSummary.join(', '),
            instructions: specialInstructions.trim(),
          }
        : selectedVariant
          ? { size: selectedVariant.name }
          : undefined,
      _cartKey: `${item.id}_${Date.now()}`, // unique key per customisation
    };

    onAddToCart(cartItem);
    onClose();
  };

  // ─── Allergen display ───────────────────────────────────────────────────────

  const contains = item.allergens?.filter(a => a.severity === 'contains') ?? [];
  const mayContain = item.allergens?.filter(a => a.severity === 'may_contain') ?? [];
  const hasAllergens = contains.length > 0 || mayContain.length > 0;

  const hasVariants = (item.variants?.length ?? 0) > 1;
  const hasGroups = (item.modifier_groups?.length ?? 0) > 0;
  const hasNutrition = !!item.nutrition?.calories;
  const isSimple = !hasVariants && !hasGroups && !hasAllergens;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideUpModal 0.3s cubic-bezier(0.34,1.3,0.64,1) both' }}
      >
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="relative flex-shrink-0">
          <div className="h-44 sm:h-52 bg-gradient-to-br from-brand-cream to-brand-rose/20 relative overflow-hidden">
            <img
              src={item.image || '/assets/placeholder.png'}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e: any) => { e.target.src = '/assets/placeholder.png'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
          >
            <X size={18} className="text-brand-text" />
          </button>
        </div>

        {/* ─── Scrollable Body ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2">

          {/* Item title & base price */}
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold text-brand-text leading-tight">{item.name}</h2>
            {item.description && (
              <p className="text-brand-text/60 text-sm mt-1.5 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* ─── Size Variants ────────────────────────────── */}
          {hasVariants && (
            <div className="mb-6">
              <p className="text-xs font-black text-brand-text uppercase tracking-widest mb-3">
                Choose Size <span className="text-brand-pink">*</span>
              </p>
              <div className="flex gap-3">
                {item.variants!.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex-1 py-3.5 px-4 rounded-2xl border-2 text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-pink bg-brand-pink/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`font-bold text-sm ${selectedVariant?.id === v.id ? 'text-brand-pink' : 'text-brand-text'}`}>
                      {v.name}
                    </p>
                    <p className="font-black text-brand-text mt-0.5">£{v.price_override.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Modifier Groups ──────────────────────────── */}
          {hasGroups && item.modifier_groups!.map(group => (
            <div key={group.id} className="mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-xs font-black text-brand-text uppercase tracking-widest">
                  {group.name}
                  {group.is_required && <span className="text-brand-pink ml-1">*</span>}
                </p>
                <p className="text-[10px] text-brand-text/40 font-medium">
                  {group.max_selections > 1
                    ? `Pick up to ${group.max_selections}`
                    : 'Pick one'}
                </p>
              </div>
              {group.description && (
                <p className="text-xs text-brand-text/50 mb-3">{group.description}</p>
              )}
              <div className="space-y-2">
                {group.options.map(opt => {
                  const isSelected = selectedOptions[group.id]?.has(opt.id) ?? false;
                  const isRadio = group.max_selections === 1;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group, opt.id)}
                      disabled={!opt.is_available}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-brand-pink bg-brand-pink/5'
                          : 'border-gray-100 hover:border-gray-200'
                      } ${!opt.is_available ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Indicator */}
                        <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center ${
                          isRadio ? 'rounded-full' : 'rounded-md'
                        } border-2 transition-all ${
                          isSelected
                            ? 'border-brand-pink bg-brand-pink'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className={`${isRadio ? 'w-2 h-2 rounded-full' : 'w-3 h-3'} bg-white`}>
                              {!isRadio && (
                                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-brand-pink' : 'text-brand-text'}`}>
                          {opt.name}
                        </span>
                      </div>
                      {opt.price_delta !== 0 && (
                        <span className={`text-sm font-bold ${isSelected ? 'text-brand-pink' : 'text-brand-text/50'}`}>
                          {opt.price_delta > 0 ? '+' : ''}£{opt.price_delta.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ─── Allergen Information ─────────────────────── */}
          {hasAllergens && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Allergen Information</p>
              </div>

              {contains.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Contains:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {contains.map(a => {
                      const cfg = ALLERGEN_CONFIG[a.allergen];
                      if (!cfg) return null;
                      return (
                        <span key={a.allergen} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.colour}`}>
                          <span>{cfg.emoji}</span> {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {mayContain.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">May Contain:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mayContain.map(a => {
                      const cfg = ALLERGEN_CONFIG[a.allergen];
                      if (!cfg) return null;
                      return (
                        <span key={a.allergen} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-dashed ${cfg.colour}`}>
                          <span>{cfg.emoji}</span> {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-amber-700 mt-3 leading-relaxed">
                If you have a food allergy or intolerance, please speak to a member of staff before ordering.
              </p>
            </div>
          )}

          {/* ─── Nutrition ───────────────────────────────── */}
          {hasNutrition && (
            <div className="mb-6">
              <button
                onClick={() => setShowNutrition(v => !v)}
                className="flex items-center gap-2 text-xs font-bold text-brand-text/50 hover:text-brand-text transition-colors"
              >
                <Info size={14} />
                Nutritional Information
                {showNutrition ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showNutrition && (
                <div className="mt-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] text-gray-500 mb-2">Per serving {item.nutrition?.serving_size_g ? `(${item.nutrition.serving_size_g}g)` : ''}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Calories', value: item.nutrition?.calories, unit: 'kcal' },
                      { label: 'Fat',      value: item.nutrition?.fat_g,    unit: 'g' },
                      { label: 'Carbs',    value: item.nutrition?.carbs_g,  unit: 'g' },
                      { label: 'Protein',  value: item.nutrition?.protein_g,unit: 'g' },
                    ].map(n => n.value != null && (
                      <div key={n.label} className="text-center">
                        <p className="font-black text-brand-text text-sm">{n.value}{n.unit}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider">{n.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Special Instructions ─────────────────────── */}
          <div className="mb-5">
            <p className="text-xs font-black text-brand-text uppercase tracking-widest mb-2">
              Special Instructions <span className="font-normal text-brand-text/40 normal-case tracking-normal">(optional)</span>
            </p>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="e.g. No onions, extra sauce, allergy note..."
              rows={2}
              maxLength={200}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-brand-pink outline-none text-sm text-brand-text resize-none transition-colors placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* ─── Footer (sticky) ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
          {/* Quantity */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black text-brand-text uppercase tracking-widest">Quantity</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-brand-text hover:border-brand-pink transition-colors text-lg"
              >−</button>
              <span className="font-black text-brand-text text-lg w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-brand-text hover:border-brand-pink transition-colors text-lg"
              >+</button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={missingRequired}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-between px-6 disabled:opacity-40 disabled:cursor-not-allowed
              bg-brand-text text-white hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-xl"
          >
            <span>Add to Order</span>
            <span className="font-black text-lg">£{totalPrice.toFixed(2)}</span>
          </button>

          {missingRequired && (
            <p className="text-center text-xs text-brand-pink font-semibold mt-2">
              Please make all required selections above
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
};
