/*
  # Marketplace Database Schema

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text)
      - role (text)
      - created_at (timestamp)
    
    - products
      - id (uuid, primary key)
      - seller_id (uuid, foreign key)
      - title (text)
      - description (text)
      - price (numeric)
      - status (text)
      - created_at (timestamp)
    
    - requests
      - id (uuid, primary key)
      - buyer_id (uuid, foreign key)
      - title (text)
      - description (text)
      - budget (numeric)
      - status (text)
      - created_at (timestamp)
    
    - matches
      - id (uuid, primary key)
      - product_id (uuid, foreign key)
      - request_id (uuid, foreign key)
      - admin_id (uuid, foreign key)
      - status (text)
      - fee (numeric)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('seller', 'buyer', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Requests table
CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  budget numeric NOT NULL CHECK (budget >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  request_id uuid REFERENCES requests(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed')),
  fee numeric NOT NULL CHECK (fee >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Sellers can create products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "Sellers can update own products" ON products
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "Everyone can view active products" ON products
  FOR SELECT TO authenticated
  USING (status = 'active' OR seller_id = auth.uid());

-- Requests policies
CREATE POLICY "Buyers can create requests" ON requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'buyer')
  );

CREATE POLICY "Buyers can update own requests" ON requests
  FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'buyer')
  );

CREATE POLICY "Everyone can view active requests" ON requests
  FOR SELECT TO authenticated
  USING (status = 'active' OR buyer_id = auth.uid());

-- Matches policies
CREATE POLICY "Admin can create matches" ON matches
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update matches" ON matches
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN requests r ON r.id = matches.request_id
      WHERE p.seller_id = auth.uid() OR r.buyer_id = auth.uid()
    )
  );