CREATE TABLE IF NOT EXISTS wallet_customers (
 id INT PRIMARY KEY,
 name VARCHAR(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS wallets (
 customer_id INT PRIMARY KEY,
 balance_cents INT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
 FOREIGN KEY (customer_id) REFERENCES wallet_customers(id)
);
CREATE TABLE IF NOT EXISTS wallet_bookings (
 id INT PRIMARY KEY,
 customer_id INT NOT NULL,
 handyman_id INT NOT NULL,
 amount_cents INT NOT NULL CHECK (amount_cents > 0),
 status VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
 FOREIGN KEY (customer_id) REFERENCES wallets(customer_id),
 FOREIGN KEY (handyman_id) REFERENCES handymen(id)
);
CREATE TABLE IF NOT EXISTS wallet_transactions (
 id INT AUTO_INCREMENT PRIMARY KEY,
 customer_id INT NOT NULL,
 kind VARCHAR(10) NOT NULL CHECK (kind IN ('topup','payment')),
 amount_cents INT NOT NULL CHECK (amount_cents > 0),
 balance_after_cents INT NOT NULL CHECK (balance_after_cents >= 0),
 booking_id INT NULL,
 idempotency_key VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE (customer_id,idempotency_key),
 UNIQUE (booking_id),
 FOREIGN KEY (customer_id) REFERENCES wallets(customer_id),
 FOREIGN KEY (booking_id) REFERENCES wallet_bookings(id),
 INDEX (customer_id,id)
);
