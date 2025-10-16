CREATE DATABASE IF NOT EXISTS beverages_db;
USE beverages_db;

-- Countries
CREATE TABLE country (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Regions
CREATE TABLE region (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country_id INT,
    CONSTRAINT fk_region_country FOREIGN KEY (country_id) REFERENCES country(id)
);

-- Types (Vino, Whisky, Vodka, etc.)
CREATE TABLE type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Subtypes (dependent on type)
CREATE TABLE subtype (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type_id INT NOT NULL,
    CONSTRAINT fk_subtype_type FOREIGN KEY (type_id) REFERENCES type(id)
);

-- Vintage / Year
CREATE TABLE vintage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    year INT
);

-- Wineries (bodegas)
CREATE TABLE winery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

-- Suppliers
CREATE TABLE supplier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

CREATE TABLE denomination (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    country_id INT NOT NULL,
    region_id INT,
    CONSTRAINT fk_denom_country FOREIGN KEY (country_id) REFERENCES country(id),
    CONSTRAINT fk_denom_region FOREIGN KEY (region_id) REFERENCES region(id)
);

-- Products
CREATE TABLE product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    format VARCHAR(50),
    price DECIMAL(10,2),
    iva INT(2),
    rating INT,
    blend VARCHAR(100),
    winery_id INT,
    denomination_id INT,
    type_id INT NOT NULL,
    subtype_id INT NULL,
    vintage_id INT,
    CONSTRAINT fk_product_winery FOREIGN KEY (winery_id) REFERENCES winery(id),
    CONSTRAINT fk_product_denom FOREIGN KEY (denomination_id) REFERENCES denomination(id),
    CONSTRAINT fk_product_type FOREIGN KEY (type_id) REFERENCES type(id),
    CONSTRAINT fk_product_subtype FOREIGN KEY (subtype_id) REFERENCES subtype(id),
    CONSTRAINT fk_product_vintage FOREIGN KEY (vintage_id) REFERENCES vintage(id)
);

-- Box (pack) definition for product
CREATE TABLE box (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    units INT,
    box_price DECIMAL(10,2),
    CONSTRAINT fk_box_product FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Grapes and product-grape many-to-many
CREATE TABLE grape (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE product_grape (
    product_id INT,
    grape_id INT,
    PRIMARY KEY (product_id, grape_id),
    CONSTRAINT fk_pg_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_pg_grape FOREIGN KEY (grape_id) REFERENCES grape(id)
);

-- Product <-> Supplier many-to-many associative table
CREATE TABLE product_supplier (
    product_id INT NOT NULL,
    supplier_id INT NOT NULL,
    PRIMARY KEY (product_id, supplier_id),
    CONSTRAINT fk_ps_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_ps_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

-- Useful indexes (optional but recommended for performance)
CREATE INDEX idx_product_type ON product(type_id);
CREATE INDEX idx_product_vintage ON product(vintage_id);
CREATE INDEX idx_denom_country ON denomination(country_id);
CREATE INDEX idx_region_country ON region(country_id);
CREATE INDEX idx_product_supplier_supplier ON product_supplier(supplier_id);

-- ========================
-- 1. Countries
-- ========================
INSERT INTO country (name, description) VALUES
('España', 'País con gran tradición vinícola'),
('Francia', 'Productor destacado de vinos y licores'),
('Italia', 'Reconocido por su vino y gastronomía'),
('Escocia', 'Famosa por sus whiskies');

-- ========================
-- 2. Regions
-- ========================
INSERT INTO region (name, description, country_id) VALUES
('La Rioja', 'Región vinícola famosa en España', 1),
('Borgoña', 'Una de las regiones vinícolas más prestigiosas de Francia', 2),
('Toscana', 'Región italiana reconocida por el Chianti', 3),
('Highlands', 'Región montañosa de Escocia, origen de muchos whiskies', 4);

-- ========================
-- 3. Types
-- ========================
INSERT INTO type (name) VALUES
('Vino'),
('Whisky'),
('Vodka'),
('Ron');

-- ========================
-- 4. Subtypes
-- ========================
INSERT INTO subtype (name, type_id) VALUES
('Tinto', 1),
('Blanco', 1),
('Rosado', 1),
('Single Malt', 2),
('Blended', 2);

-- ========================
-- 5. Vintage (años)
-- ========================
INSERT INTO vintage (name, description, year) VALUES
('Cosecha 2018', 'Buena añada para vinos tintos', 2018),
('Cosecha 2019', 'Año equilibrado', 2019),
('Cosecha 2020', 'Producción abundante', 2020),
('Cosecha 2021', 'Año joven, afrutado', 2021);

-- ========================
-- 6. Wineries
-- ========================
INSERT INTO winery (name, description) VALUES
('Bodegas López', 'Bodega familiar con tradición centenaria'),
('Viña Sol', 'Productor especializado en vinos blancos'),
('Highland Distillers', 'Productor escocés de whisky Single Malt');

-- ========================
-- 7. Suppliers
-- ========================
INSERT INTO supplier (name, description) VALUES
('Distribuciones Gourmet S.A.', 'Proveedor nacional de bebidas premium'),
('World Spirits Ltd.', 'Distribuidor internacional de licores'),
('Bebidas Selectas', 'Mayorista especializado en vinos españoles');

-- ========================
-- 8. Denominations
-- ========================
INSERT INTO denomination (name, description, country_id, region_id) VALUES
('D.O.Ca. Rioja', 'Denominación de origen calificada Rioja', 1, 1),
('A.O.C. Bourgogne', 'Denominación controlada francesa', 2, 2),
('Chianti DOCG', 'Denominación italiana prestigiosa', 3, 3);

-- ========================
-- 9. Grapes
-- ========================
INSERT INTO grape (name) VALUES
('Tempranillo'),
('Garnacha'),
('Cabernet Sauvignon'),
('Chardonnay');

-- ========================
-- 10. Products
-- ========================
INSERT INTO product (code, name, description, reference, format, price, iva, rating, blend,
                     winery_id, denomination_id, type_id, subtype_id, vintage_id)
VALUES
('VIN001', 'Rioja Reserva 2018', 'Vino tinto reserva con cuerpo y notas de madera', 'R18-750', '750ml', 12.50, 21, 90, 'Tempranillo', 1, 1, 1, 1, 1),
('VIN002', 'Viña Sol Blanco 2020', 'Vino blanco fresco y afrutado', 'VS20-750', '750ml', 8.75, 21, 85, 'Chardonnay', 2, 1, 1, 2, 3),
('WHI001', 'Highland Single Malt 12 años', 'Whisky escocés madurado en barrica', 'HSM12-700', '700ml', 45.00, 21, 94, NULL, 3, NULL, 2, 4, NULL);

-- ========================
-- 11. Product-Grape associations
-- ========================
INSERT INTO product_grape (product_id, grape_id) VALUES
(1, 1),
(1, 2),
(2, 4);

-- ========================
-- 12. Product-Supplier associations
-- ========================
INSERT INTO product_supplier (product_id, supplier_id) VALUES
(1, 3),
(2, 1),
(3, 2);

-- ========================
-- 13. Boxes
-- ========================
INSERT INTO box (product_id, units, box_price) VALUES
(1, 6, 70.00),
(2, 12, 95.00),
(3, 6, 250.00);
