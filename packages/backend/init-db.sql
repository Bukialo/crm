-- init-db.sql - Script de inicialización corregido
-- Este archivo debe estar en la raíz del proyecto backend

-- Crear usuario bukialo_user con privilegios necesarios
CREATE USER bukialo_user WITH 
    PASSWORD 'bukialo_pass'
    CREATEDB 
    LOGIN;

-- Crear base de datos bukialo_crm
CREATE DATABASE bukialo_crm 
    WITH OWNER bukialo_user
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TEMPLATE template0;

-- Conectar a la base de datos bukialo_crm
\c bukialo_crm;

-- Dar todos los permisos al usuario en la base de datos
GRANT ALL PRIVILEGES ON DATABASE bukialo_crm TO bukialo_user;

-- Dar permisos en el schema public
GRANT ALL ON SCHEMA public TO bukialo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bukialo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bukialo_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO bukialo_user;

-- Establecer permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bukialo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bukialo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO bukialo_user;

-- Hacer que bukialo_user sea el propietario del schema public
ALTER SCHEMA public OWNER TO bukialo_user;

-- Verificar que todo se creó correctamente
SELECT datname FROM pg_database WHERE datname = 'bukialo_crm';
SELECT usename FROM pg_user WHERE usename = 'bukialo_user';