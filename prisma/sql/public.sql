CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'BANNED');
CREATE TYPE "Role" AS ENUM ('SUPER', 'ADMIN', 'USER');

-- 1. Public Admin
CREATE TABLE "Admin" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "permission" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "created_id" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL
);

-- 2. Tenant Info
CREATE TABLE "Tenant" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "key" TEXT NOT NULL UNIQUE,
    "schema_name" TEXT NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'PENDING',
    "created_id" INTEGER,
    CONSTRAINT "fk_tenant_created_id" FOREIGN KEY ("created_id") REFERENCES "Admin"("id") ON DELETE SET NULL
);


-- 3. Tenant user relationship
CREATE TABLE "TenantUser" (
    "id" SERIAL PRIMARY KEY,
    "tenant_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "tenant_key" TEXT NOT NULL,
CONSTRAINT "TenantUser_tenant_key_fkey" FOREIGN KEY ("tenant_key") REFERENCES "Tenant"("key") ON DELETE RESTRICT ON UPDATE CASCADE,
CONSTRAINT "TenantUser_tenant_key_email_key" UNIQUE ("tenant_key", "email")
);

-- 4. Session
CREATE TABLE "Session" (
    "id" TEXT PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "tenant_key" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX "Session_userId_idx" ON "Session"("user_id");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expires_at");
CREATE INDEX "idx_admin_created_id" ON "Admin"("created_id");

-- 5. Create tenant auto create tenant schema
CREATE OR REPLACE FUNCTION public.fn_auto_create_tenant_schema()
RETURNS TRIGGER AS $$
DECLARE
    tbl_name TEXT;
BEGIN
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', NEW.schema_name);

    FOR tbl_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'template_schema' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format(
            'CREATE TABLE %I.%I (LIKE template_schema.%I INCLUDING ALL)', 
            NEW.schema_name, tbl_name, tbl_name
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER:Create tenant auto create tenant schema
CREATE TRIGGER trg_after_tenant_insert
AFTER INSERT ON public."Tenant"
FOR EACH ROW
EXECUTE FUNCTION public.fn_auto_create_tenant_schema();