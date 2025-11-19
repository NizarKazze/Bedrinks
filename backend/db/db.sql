CREATE DATABASE IF NOT EXISTS beverages_db;
USE beverages_db;

-- ========================
-- 1. Country
-- ========================
CREATE TABLE country (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- ========================
-- 2. Region
-- ========================
CREATE TABLE region (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country_id INT,
    CONSTRAINT fk_region_country FOREIGN KEY (country_id) REFERENCES country(id)
);

-- ========================
-- 3. Category
-- ========================
CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT NULL,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES category(id)
);

-- ========================
-- 4. Vintage
-- ========================
CREATE TABLE vintage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    year INT
);

-- ========================
-- 5. Winery
-- ========================
CREATE TABLE winery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

-- ========================
-- 6. Supplier
-- ========================
CREATE TABLE supplier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

-- ========================
-- 7. Denomination
-- ========================
CREATE TABLE denomination (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    country_id INT NOT NULL,
    region_id INT,
    CONSTRAINT fk_denom_country FOREIGN KEY (country_id) REFERENCES country(id),
    CONSTRAINT fk_denom_region FOREIGN KEY (region_id) REFERENCES region(id)
);

-- ========================
-- 8. Product
-- ========================
CREATE TABLE product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    format VARCHAR(50),
    price DECIMAL(10,2),
    iva INT DEFAULT 21,
    rating INT,
    blend VARCHAR(100),
    winery_id INT,
    denomination_id INT,
    category_id INT NOT NULL,
    vintage_id INT,
    CONSTRAINT fk_product_winery FOREIGN KEY (winery_id) REFERENCES winery(id),
    CONSTRAINT fk_product_denom FOREIGN KEY (denomination_id) REFERENCES denomination(id),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES category(id),
    CONSTRAINT fk_product_vintage FOREIGN KEY (vintage_id) REFERENCES vintage(id)
);

-- ========================
-- 9. Box (pack)
-- ========================
CREATE TABLE box (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    units INT,
    box_price DECIMAL(10,2),
    CONSTRAINT fk_box_product FOREIGN KEY (product_id) REFERENCES product(id)
);

-- ========================
-- 10. Grape
-- ========================
CREATE TABLE grape (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- ========================
-- 11. Product-Grape
-- ========================
CREATE TABLE product_grape (
    product_id INT,
    grape_id INT,
    PRIMARY KEY (product_id, grape_id),
    CONSTRAINT fk_pg_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_pg_grape FOREIGN KEY (grape_id) REFERENCES grape(id)
);

-- ========================
-- 12. Product-Supplier
-- ========================
CREATE TABLE product_supplier (
    product_id INT NOT NULL,
    supplier_id INT NOT NULL,
    PRIMARY KEY (product_id, supplier_id),
    CONSTRAINT fk_ps_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_ps_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

-- ========================
-- 12. customer
-- ========================

CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('pending', 'approved', 'rejected', 'sent') DEFAULT 'pending',
  total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  proposal_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

CREATE TABLE proposal_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);



-- ========================
-- 13. Indexes
-- ========================
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_vintage ON product(vintage_id);
CREATE INDEX idx_denom_country ON denomination(country_id);
CREATE INDEX idx_region_country ON region(country_id);
CREATE INDEX idx_product_supplier_supplier ON product_supplier(supplier_id);


-- ===================================================
-- INSERT DATA
-- ===================================================

-- Countries
INSERT INTO country (name, description) VALUES
('España', 'País con gran tradición vinícola'),
('Francia', 'Productor destacado de vinos y licores'),
('Italia', 'Reconocido por su vino y gastronomía'),
('Escocia', 'Famosa por sus whiskies');

-- Regions
INSERT INTO region (name, description, country_id) VALUES
('La Rioja', 'Región vinícola famosa en España', 1),
('Borgoña', 'Región vinícola prestigiosa en Francia', 2),
('Toscana', 'Región italiana reconocida por el Chianti', 3),
('Highlands', 'Región montañosa escocesa, cuna de whiskies', 4);

-- Type
INSERT INTO category (name) VALUES 
('Vino'),
('Whisky'),
('Vodka'),
('Ron');

-- Subtypes of Vino
INSERT INTO category (name, parent_id) VALUES
('Tinto', 1),
('Blanco', 1),
('Rosado', 1),
('Crianza', 5),
('Reserva', 5),
('Gran Reserva', 5);

-- Subtypes of Whisky
INSERT INTO category (name, parent_id) VALUES
('Single Malt', 2),
('Blended', 2);

-- Vintage
INSERT INTO vintage (name, description, year) VALUES
('Cosecha 2018', 'Buena añada para tintos', 2018),
('Cosecha 2019', 'Año equilibrado', 2019),
('Cosecha 2020', 'Producción abundante', 2020),
('Cosecha 2021', 'Joven y afrutado', 2021);

-- Winery
INSERT INTO winery (name, description) VALUES
('Bodegas López', 'Bodega familiar con tradición centenaria'),
('Viña Sol', 'Especialista en vinos blancos'),
('Highland Distillers', 'Productor escocés de whisky Single Malt'),
('Ron del Caribe', 'Destilería artesanal del Caribe'),
('Vodka Imperial', 'Productor de vodka premium de patata');

-- Supplier
INSERT INTO supplier (name, description) VALUES
('Distribuciones Gourmet S.A.', 'Proveedor nacional de bebidas premium'),
('World Spirits Ltd.', 'Distribuidor internacional de licores'),
('Bebidas Selectas', 'Mayorista especializado en vinos españoles');

-- Denominations
INSERT INTO denomination (name, description, country_id, region_id) VALUES
('D.O.Ca. Rioja', 'Denominación de origen calificada Rioja', 1, 1),
('A.O.C. Bourgogne', 'Denominación francesa', 2, 2),
('Chianti DOCG', 'Denominación italiana', 3, 3);

-- Grapes
INSERT INTO grape (name) VALUES
('Tempranillo'),
('Garnacha'),
('Cabernet Sauvignon'),
('Chardonnay'),
('Merlot'),
('Sauvignon Blanc');

-- ===================================================
-- 15 PRODUCTS
-- ===================================================

INSERT INTO product (code, name, description, reference, format, price, iva, rating, blend,
                     winery_id, denomination_id, category_id, vintage_id)
VALUES
('VIN001', 'Rioja Crianza 2018', 'Vino tinto crianza con notas de roble y vainilla', 'R18C-750', '750ml', 11.90, 21, 89, 'Tempranillo', 1, 1, 8, 1),
('VIN002', 'Rioja Reserva 2019', 'Reserva elegante con cuerpo y buena acidez', 'R19R-750', '750ml', 14.50, 21, 91, 'Tempranillo', 1, 1, 9, 2),
('VIN003', 'Viña Sol Blanco 2020', 'Vino blanco joven, fresco y afrutado', 'VS20-750', '750ml', 8.50, 21, 85, 'Chardonnay', 2, 1, 6, 3),
('VIN004', 'Borgoña Pinot Noir 2020', 'Vino francés elegante y sedoso', 'BO20-750', '750ml', 19.90, 21, 93, 'Pinot Noir', NULL, 2, 5, 3),
('VIN005', 'Chianti Classico 2019', 'Vino italiano con notas de cereza madura', 'CH19-750', '750ml', 16.80, 21, 90, 'Sangiovese', NULL, 3, 5, 2),
('VIN006', 'Gran Reserva 2018 López', 'Vino tinto complejo y estructurado', 'GR18-750', '750ml', 22.00, 21, 94, 'Tempranillo, Garnacha', 1, 1, 10, 1),
('VIN007', 'Rosado Frizzante 2021', 'Rosado ligero con burbuja fina', 'RF21-750', '750ml', 7.50, 21, 83, 'Garnacha', 2, 1, 7, 4),
('WHI001', 'Highland Single Malt 12 años', 'Whisky escocés envejecido 12 años', 'HSM12-700', '700ml', 45.00, 21, 94, NULL, 3, NULL, 11, NULL),
('WHI002', 'Highland Single Malt 18 años', 'Whisky escocés con notas de miel y madera', 'HSM18-700', '700ml', 68.00, 21, 96, NULL, 3, NULL, 11, NULL),
('WHI003', 'Scottish Blended Gold', 'Whisky blended suave y equilibrado', 'SBG-700', '700ml', 29.90, 21, 88, NULL, 3, NULL, 12, NULL),
('RON001', 'Ron Añejo del Caribe', 'Ron oscuro envejecido 5 años en barrica', 'RC5-700', '700ml', 24.00, 21, 90, NULL, 4, NULL, 4, NULL),
('RON002', 'Ron Blanco Premium', 'Ron claro ideal para cócteles', 'RBP-700', '700ml', 19.50, 21, 84, NULL, 4, NULL, 4, NULL),
('VOD001', 'Vodka Imperial Original', 'Vodka puro destilado de patata', 'VI-700', '700ml', 21.00, 21, 88, NULL, 5, NULL, 3, NULL),
('VOD002', 'Vodka Imperial Citrus', 'Vodka infusionado con cítricos naturales', 'VIC-700', '700ml', 22.50, 21, 89, NULL, 5, NULL, 3, NULL),
('VOD003', 'Vodka Imperial Black Edition', 'Vodka premium filtrado en carbón', 'VIB-700', '700ml', 28.00, 21, 92, NULL, 5, NULL, 3, NULL);

-- Product-Grape
INSERT INTO product_grape (product_id, grape_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(6, 1),
(6, 2),
(3, 4),
(4, 5),
(5, 5),
(7, 2);

-- Product-Supplier
INSERT INTO product_supplier (product_id, supplier_id) VALUES
(1, 3),
(2, 3),
(3, 1),
(4, 2),
(5, 2),
(6, 3),
(7, 1),
(8, 2),
(9, 2),
(10, 2),
(11, 1),
(12, 1),
(13, 2),
(14, 2),
(15, 2);

-- Boxes
INSERT INTO box (product_id, units, box_price) VALUES
(1, 6, 65.00),
(2, 6, 80.00),
(3, 12, 90.00),
(6, 6, 120.00),
(8, 6, 250.00),
(9, 6, 360.00),
(11, 12, 260.00),
(13, 6, 110.00);

ALTER TABLE product
ADD COLUMN coste DECIMAL(10,2) DEFAULT 0,
ADD COLUMN estado VARCHAR(20) DEFAULT 'activo';