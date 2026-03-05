-- 1. Identity & Structure
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- e.g., 'Taste of Village', 'Azmoz', 'Falood & Co'
    website_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL, -- e.g., 'Hayes Branch', 'Slough Branch'
    address TEXT,
    printer_ip_address INET -- For direct Go -> Toast TP200 printing
);

-- 2. Menu Logic
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) -- 'Curry', 'Dessert', 'Grill', 'Chinese'
);

-- 3. Multi-Tier Pricing
CREATE TABLE IF NOT EXISTS price_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL -- 'Dine-In', 'Takeaway', 'UberEats', 'Web'
);

CREATE TABLE IF NOT EXISTS product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    store_id UUID REFERENCES stores(id), -- Optional
    price_level_id INT REFERENCES price_levels(id),
    price_amount DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(product_id, store_id, price_level_id)
);

-- 4. Modifiers & Variations (e.g., +£1.99 for Large)
CREATE TABLE IF NOT EXISTS modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    name VARCHAR(255) NOT NULL, -- e.g., 'Large Portion'
    upcharge_amount DECIMAL(10, 2) DEFAULT 0.00
);

-- 5. Order Management
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    order_source VARCHAR(50), -- 'POS', 'Web', 'UberEats', 'Deliveroo', 'JustEat'
    net_total DECIMAL(12,2) DEFAULT 0.00,
    vat_total DECIMAL(12,2) DEFAULT 0.00,
    service_charge DECIMAL(12,2) DEFAULT 0.00,
    gross_total DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'kitchen', 'completed', 'paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    price_paid DECIMAL(12,2) NOT NULL,
    is_takeaway BOOLEAN DEFAULT false,
    vat_rate DECIMAL(4,2) NOT NULL
);
