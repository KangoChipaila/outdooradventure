-- =============================================================================
-- Green Rock Outdoor Gear — PostgreSQL schema
-- Database: green_rock_outdoor_gear
-- Run: psql -d green_rock_outdoor_gear -f schema.sql
-- =============================================================================

-- Enable pgcrypto for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- member_tiers  (lookup table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_tiers (
  name TEXT PRIMARY KEY  -- e.g. 'Base Camp Member', 'Summit Member'
);

INSERT INTO member_tiers (name) VALUES
  ('Base Camp Member'),
  ('Trail Member'),
  ('Summit Member'),
  ('Expedition Member')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                   SERIAL PRIMARY KEY,
  first_name           TEXT        NOT NULL,
  last_name            TEXT        NOT NULL,
  email                TEXT        NOT NULL UNIQUE,
  phone                TEXT,
  password_hash        TEXT        NOT NULL,
  member_tier          TEXT        NOT NULL DEFAULT 'Base Camp Member'
                         REFERENCES member_tiers(name) ON UPDATE CASCADE,
  is_admin             BOOLEAN     NOT NULL DEFAULT FALSE,
  -- Notification preferences (inlined — simple enough to not warrant a separate table)
  notif_order_updates  BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_deals          BOOLEAN     NOT NULL DEFAULT TRUE,
  notif_new_arrivals   BOOLEAN     NOT NULL DEFAULT FALSE,
  notif_newsletter     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- addresses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT        NOT NULL DEFAULT 'Home',
  line1      TEXT        NOT NULL,
  line2      TEXT,
  city       TEXT        NOT NULL,
  country    TEXT        NOT NULL,
  is_default BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS uidx_addresses_user_default
  ON addresses(user_id) WHERE is_default = TRUE;

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         TEXT          NOT NULL,
  brand        TEXT          NOT NULL,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  rating       NUMERIC(3,2)  NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count INTEGER       NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  description  TEXT          NOT NULL DEFAULT '',
  sizes        TEXT[]        NOT NULL DEFAULT '{}',
  colors       TEXT[]        NOT NULL DEFAULT '{}',
  img          TEXT          NOT NULL DEFAULT '',
  gallery      TEXT[]        NOT NULL DEFAULT '{}',
  category     TEXT          NOT NULL,
  stock        INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed products from existing frontend data
INSERT INTO products (id, name, brand, price, rating, review_count, description, sizes, colors, img, gallery, category, stock)
VALUES
  (1,  'Trail Running Shoe',   'Salomon',       2499.99, 4.7, 214, 'Lightweight trail running shoe engineered for technical terrain. Features a Contagrip® outsole for maximum grip, a protective toe cap, and a cushioned midsole that absorbs trail shock mile after mile.',
       ARRAY['UK 7','UK 8','UK 9','UK 10','UK 11','UK 12'], ARRAY['Olive','Black','Grey'],
       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
       ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80','https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80'],
       'Shoes', 42),
  (2,  'Polarised Sunglasses', 'Julbo',         1249.50, 4.5,  87, 'High-performance polarised sunglasses with UV400 protection. Wraparound frame design reduces wind glare. Ideal for hiking, cycling, and water sports.',
       ARRAY['One Size'], ARRAY['Teal / Black','Smoke / Grey','Orange / Black'],
       'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
       ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80','https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80','https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80'],
       'Accessories', 28),
  (3,  'Hardshell Jacket',     'Arc''teryx',    4199.00, 4.9, 341, '3-layer GORE-TEX® Pro hardshell offering waterproof, windproof, and breathable protection. Helmet-compatible hood, pit-zip vents, and reinforced shoulders for alpine demands.',
       ARRAY['XS','S','M','L','XL'], ARRAY['Black / Lime','Navy','Granite'],
       'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
       ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80','https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=600&q=80','https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80'],
       'Clothing', 15),
  (4,  'Trekking Poles',       'Black Diamond', 1899.00, 4.6, 128, 'Collapsible aluminium trekking poles with FlickLock® Pro adjustment, cork grips, and interchangeable baskets. Folds down to 38 cm for easy pack storage.',
       ARRAY['One Size'], ARRAY['Silver','Carbon Black'],
       'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
       ARRAY['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80','https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80','https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80'],
       'Hiking', 60),
  (5,  'TC Pro Climbing Shoe', 'La Sportiva',   4588.99, 4.6, 109, 'The TC Pro is a high-performance climbing shoe designed for crack climbing and all-day wear on big walls. Lace-up closure, Vibram® XS Edge sole, and a stiff last for maximum precision on small holds.',
       ARRAY['5/38','6/39.5','7/41','8/42','9/43','10/44.5','11/46','12/47','13/48'], ARRAY['Olive / Black'],
       'https://images.unsplash.com/photo-1508629175061-7e894b5e5c22?w=600&q=80',
       ARRAY['https://images.unsplash.com/photo-1508629175061-7e894b5e5c22?w=600&q=80','https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80'],
       'Shoes', 20),
  (6,  'Sleeping Bag',         'Rab',           3299.00, 4.4,  66, 'Down sleeping bag rated to -10°C. Hydrophobic 800 fill power down, YKK zip, and contoured hood. Packs to grapefruit size.',
       ARRAY['Regular','Long'], ARRAY['Ebony','Ink Blue'],
       '', ARRAY[]::TEXT[], 'Camping', 30),
  (7,  'Headlamp',             'Petzl',          699.00, 4.8, 203, 'Compact 450-lumen reactive headlamp with REACTIVE LIGHTING® technology that automatically adjusts brightness to your needs.',
       ARRAY['One Size'], ARRAY['Black','Red'],
       '', ARRAY[]::TEXT[], 'Lighting', 75),
  (8,  'Hydration Pack',       'Osprey',        2149.00, 4.7, 155, '10 L hydration pack with 2.5 L reservoir, integrated rain cover, and ventilated back panel. Ideal for half-day trail runs.',
       ARRAY['One Size'], ARRAY['Starry Night Blue','Lime'],
       '', ARRAY[]::TEXT[], 'Bags', 18),
  (9,  'Carabiner Set',        'Mammut',         549.00, 4.9, 412, 'Set of 4 UIAA-certified screwgate carabiners. Keylock nose, 25 kN gate-closed strength.',
       ARRAY['One Size'], ARRAY['Silver'],
       '', ARRAY[]::TEXT[], 'Climbing', 90),
  (10, 'Camp Stove',           'MSR',           1399.00, 4.5,  88, 'Ultralight canister stove weighing just 73 g. Folds to pocket size, boils 1 L in 3.5 minutes. Includes fold-out pot supports.',
       ARRAY['One Size'], ARRAY['Silver / Red'],
       '', ARRAY[]::TEXT[], 'Camping', 35)
ON CONFLICT (id) DO NOTHING;

-- Keep the sequence in sync after manual inserts
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id         TEXT          PRIMARY KEY, -- e.g. 'ORD-00142'
  user_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT          NOT NULL DEFAULT 'Processing'
               CHECK (status IN ('Processing','Shipped','Delivered','Cancelled')),
  total      NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- order_items
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL        PRIMARY KEY,
  order_id     TEXT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT          NOT NULL,
  quantity     INTEGER       NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- -----------------------------------------------------------------------------
-- saved_items
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_items (
  id         SERIAL      PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- -----------------------------------------------------------------------------
-- activity_preferences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_preferences (
  id       SERIAL  PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity TEXT    NOT NULL,
  UNIQUE(user_id, activity)
);
