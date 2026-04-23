/* ─── POS Category Mapping ─── */
// These are used for dynamic POS display based on categorical filters

export const SIZE_VARIATIONS: Record<string, { regular: number; large: number }> = {
  'Rose Taste of Village':              { regular: 5.49, large: 6.99 },
  'Pistachio Royale Taste of Village':  { regular: 5.49, large: 6.49 },
  'The Royal Heritage':        { regular: 4.99, large: 6.49 },
  'The Golden Monsoon':        { regular: 4.99, large: 6.49 },
  'Kadak Chai':                { regular: 2.75, large: 3.75 },
};

export const ITEM_MODIFIERS: Record<string, {
  name: string,
  options: string[],
  default: string;
}[]> = {
  'Egg Shakshuka': [
    { name: 'Bread Choice', options: ['Toast', 'Paratha', 'No Bread'], default: 'Toast' }
  ],
  'Papdi Chaat': [
    { name: 'Tomato', options: ['With Tomato', 'No Tomato'], default: 'With Tomato' },
    { name: 'Onion', options: ['With Onion', 'No Onion'], default: 'With Onion' },
    { name: 'Spice', options: ['Mild', 'Spicy'], default: 'Mild' }
  ],
  'Samosa Chaat': [
    { name: 'Tomato', options: ['With Tomato', 'No Tomato'], default: 'With Tomato' },
    { name: 'Onion', options: ['With Onion', 'No Onion'], default: 'With Onion' },
    { name: 'Spice', options: ['Mild', 'Spicy'], default: 'Mild' }
  ],
  'Aloo Tikki Chaat': [
    { name: 'Tomato', options: ['With Tomato', 'No Tomato'], default: 'With Tomato' },
    { name: 'Onion', options: ['With Onion', 'No Onion'], default: 'With Onion' },
    { name: 'Spice', options: ['Mild', 'Spicy'], default: 'Mild' }
  ],
  'Dahi Bhala': [
    { name: 'Tomato', options: ['With Tomato', 'No Tomato'], default: 'With Tomato' },
    { name: 'Onion', options: ['With Onion', 'No Onion'], default: 'With Onion' },
    { name: 'Spice', options: ['Mild', 'Spicy'], default: 'Mild' }
  ],
};
