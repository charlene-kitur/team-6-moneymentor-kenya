CREATE TABLE IF NOT EXISTS handymen (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS provider_expenses (
 id INT AUTO_INCREMENT PRIMARY KEY,
 handyman_id INT NOT NULL,
 description VARCHAR(200) NOT NULL,
 category VARCHAR(40) NOT NULL,
 amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
 expense_date DATE NOT NULL,
 FOREIGN KEY (handyman_id) REFERENCES handymen(id),
 INDEX (handyman_id, expense_date)
);
CREATE TABLE IF NOT EXISTS provider_income (
 id INT AUTO_INCREMENT PRIMARY KEY,
 handyman_id INT NOT NULL,
 amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
 income_date DATE NOT NULL,
 FOREIGN KEY (handyman_id) REFERENCES handymen(id),
 INDEX (handyman_id, income_date)
);
CREATE TABLE IF NOT EXISTS provider_savings_goals (
 id INT AUTO_INCREMENT PRIMARY KEY,
 handyman_id INT NOT NULL,
 goal_amount DECIMAL(12,2) NOT NULL CHECK (goal_amount > 0),
 current_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
 FOREIGN KEY (handyman_id) REFERENCES handymen(id)
);
CREATE TABLE IF NOT EXISTS provider_investments (
 id INT AUTO_INCREMENT PRIMARY KEY,
 handyman_id INT NOT NULL,
 initial_amount DECIMAL(12,2) NOT NULL CHECK (initial_amount >= 0),
 monthly_contribution DECIMAL(12,2) NOT NULL CHECK (monthly_contribution >= 0),
 annual_rate DECIMAL(5,2) NOT NULL CHECK (annual_rate >= 0 AND annual_rate <= 100),
 years INT NOT NULL CHECK (years >= 0 AND years <= 100),
 FOREIGN KEY (handyman_id) REFERENCES handymen(id)
);
