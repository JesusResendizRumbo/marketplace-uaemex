-- ==============================================================================
-- 🏛️ MARKETPLACE UNIVERSITARIO UAEMex - ESQUEMA DE BASE DE DATOS POSTGRESQL
-- Compatible con: Supabase / PostgreSQL 14+
-- ==============================================================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM PERSONALIZADOS
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'moderator');
CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'good', 'acceptable');
CREATE TYPE product_status AS ENUM ('available', 'reserved', 'sold', 'hidden');
CREATE TYPE lost_item_type AS ENUM ('lost', 'found');
CREATE TYPE lost_item_status AS ENUM ('open', 'claimed', 'resolved');
CREATE TYPE report_reason AS ENUM ('prohibited_item', 'scam', 'offensive', 'spam', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'action_taken');

-- 3. TABLA DE FACULTADES / PLANTELES UAEMEX
CREATE TABLE faculties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    campus_zone VARCHAR(100) NOT NULL, -- ej. 'Toluca CU', 'El Cerrillo', 'UAP Cuautitlán', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE USUARIOS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(120) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'student',
    faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
    career VARCHAR(120),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    token_expires_at TIMESTAMP WITH TIME ZONE,
    average_rating NUMERIC(3,2) DEFAULT 5.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción de dominio institucional UAEMex
    CONSTRAINT chk_uaemex_email CHECK (
        email LIKE '%@alumno.uaemex.mx' OR 
        email LIKE '%@profesor.uaemex.mx' OR 
        email LIKE '%@uaemex.mx'
    )
);

-- 5. TABLA DE CATEGORÍAS DE PRODUCTOS
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE PRODUCTOS / PUBLICACIONES
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    condition product_condition NOT NULL DEFAULT 'good',
    status product_status NOT NULL DEFAULT 'available',
    images TEXT[] NOT NULL DEFAULT '{}', -- URLs de Cloudinary
    is_exchangeable BOOLEAN DEFAULT FALSE, -- Acepta intercambio
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE OBJETOS PERDIDOS Y ENCONTRADOS ("LOST & FOUND")
CREATE TABLE lost_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location_details VARCHAR(255) NOT NULL, -- ej. "Edificio C, banca junto al laboratorio de química"
    event_date DATE NOT NULL,
    type lost_item_type NOT NULL, -- 'lost' o 'found'
    status lost_item_status NOT NULL DEFAULT 'open',
    images TEXT[] DEFAULT '{}',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA DE CONVERSACIONES DE CHAT
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_different_users CHECK (buyer_id <> seller_id)
);

-- 9. TABLA DE MENSAJES DE CHAT
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLA DE RESEÑAS Y CALIFICACIONES (REVIEWS)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_no_self_review CHECK (reviewer_id <> target_user_id),
    CONSTRAINT unq_product_review UNIQUE (product_id, reviewer_id)
);

-- 11. TABLA DE ARTÍCULOS FAVORITOS
CREATE TABLE user_favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);

-- 12. TABLA DE REPORTES / MODERACIÓN
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    description TEXT,
    status report_status NOT NULL DEFAULT 'pending',
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 13. TABLA DE ÓRDENES Y PAGOS CON TARJETA WEB (ESCROW CU ECATEPEC)
CREATE TYPE order_status AS ENUM ('payment_held_in_escrow', 'delivered_and_released', 'cancelled_refunded');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    delivery_code VARCHAR(10) NOT NULL, -- Código de 4 dígitos para entrega en CU Ecatepec
    status order_status NOT NULL DEFAULT 'payment_held_in_escrow',
    card_last_four VARCHAR(4) NOT NULL,
    card_holder VARCHAR(150) NOT NULL,
    pickup_spot VARCHAR(150) DEFAULT 'Centro Universitario UAEM Ecatepec',
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ⚡ ÍNDICES PARA ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX idx_products_status_price ON products(status, price);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_faculty ON products(faculty_id);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_lost_items_faculty_type ON lost_items(faculty_id, type, status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_users_email ON users(email);

-- ==============================================================================
-- 🔄 TRIGGERS Y FUNCIONES DE AUTOMATIZACIÓN
-- ==============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_lost_items_timestamp BEFORE UPDATE ON lost_items FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_conversations_timestamp BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Función para recalcular el promedio de estrellas del usuario tras nueva reseña
CREATE OR REPLACE FUNCTION recalculate_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        average_rating = (SELECT COALESCE(AVG(rating), 5.0) FROM reviews WHERE target_user_id = NEW.target_user_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE target_user_id = NEW.target_user_id)
    WHERE id = NEW.target_user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION recalculate_user_rating();

-- ==============================================================================
-- 📦 DATOS SEMILLA (SEED DATA INICIAL)
-- ==============================================================================
INSERT INTO faculties (name, campus_zone) VALUES
('Facultad de Ingeniería', 'Ciudad Universitaria (CU)'),
('Facultad de Medicina', 'Campus Colón'),
('Facultad de Contaduría y Administración', 'Ciudad Universitaria (CU)'),
('Facultad de Ciencias', 'El Cerrillo Piedras Blancas'),
('Facultad de Derecho', 'Ciudad Universitaria (CU)'),
('Facultad de Odontología', 'Campus Colón'),
('Facultad de Química', 'Campus Colón'),
('Facultad de Arquitectura y Diseño', 'Ciudad Universitaria (CU)'),
('Facultad de Humanidades', 'Ciudad Universitaria (CU)'),
('Facultad de Economía', 'Ciudad Universitaria (CU)'),
('UAP Cuautitlán Izcalli', 'Zona Valle de México'),
('UAP Valle de Chalco', 'Zona Valle de México'),
('UAP Ecatepec', 'Zona Valle de México'),
('UAP Texcoco', 'Zona Oriente');

INSERT INTO categories (name, slug, icon_name, description) VALUES
('Libros y Apuntes', 'libros-apuntes', 'BookOpen', 'Libros de texto, guías de estudio, manuales y copias encuadernadas'),
('Material de Laboratorio', 'material-laboratorio', 'FlaskConical', 'Batas, estuches de disección, matraces, gafas protectoras y pinzas'),
('Electrónica y Calculadoras', 'electronica-calculadoras', 'Cpu', 'Calculadoras científicas/graficadoras, arduinos, laptops y accesorios'),
('Uniformes y Vestimenta', 'uniformes-ropa', 'Shirt', 'Uniformes clínicos, filipinas, ropa deportiva y batas oficiales'),
('Instrumental Médico y Dental', 'instrumental-salud', 'Stethoscope', 'Estetoscopios, baumanómetros, tipodontos y espátulas'),
('Muebles y Alojamiento', 'muebles-cuartos', 'Home', 'Escritorios, sillas ejecutivas, cuartos para foráneos y roommates'),
('Otros Artículos', 'otros', 'Package', 'Mochilas, termos, papelería y artículos diversos');
