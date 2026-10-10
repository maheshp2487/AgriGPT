-- AgriGPT Database Migration 002: Authentication, Farmer Profiles & RLS Isolation
-- Implements Phase 3 Entity Architecture (P3-01) for Samunnati Farmer & FPO Network

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Aligned with Supabase auth.users & custom user store)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'fpo_manager', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone_number);

-- 2. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(120),
    state VARCHAR(60) NOT NULL DEFAULT 'Tamil Nadu',
    district VARCHAR(60) NOT NULL DEFAULT 'Thanjavur',
    primary_language VARCHAR(5) NOT NULL DEFAULT 'ta' CHECK (primary_language IN ('en', 'ta', 'hi', 'te', 'kn', 'ml')),
    crops_grown TEXT[] DEFAULT ARRAY['paddy']::TEXT[],
    land_area_acres NUMERIC(6, 2) DEFAULT 2.50,
    preferred_market VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for geographic segmentation
CREATE INDEX IF NOT EXISTS idx_profiles_geo ON public.farmer_profiles(state, district);

-- 3. FPO Organizations Table (Samunnati AMLA Network)
CREATE TABLE IF NOT EXISTS public.fpo_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    registration_no VARCHAR(50) UNIQUE NOT NULL,
    state VARCHAR(60) NOT NULL,
    district VARCHAR(60) NOT NULL,
    contact_phone VARCHAR(15),
    total_farmer_members INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FPO Memberships Table
CREATE TABLE IF NOT EXISTS public.fpo_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    fpo_id UUID NOT NULL REFERENCES public.fpo_organizations(id) ON DELETE CASCADE,
    member_role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (member_role IN ('member', 'director', 'manager')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, fpo_id)
);

-- 5. Row-Level Security (RLS) Configuration
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_memberships ENABLE ROW LEVEL SECURITY;

-- Farmer can only select and modify their own profile
CREATE POLICY farmer_select_own_profile ON public.farmer_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY farmer_update_own_profile ON public.farmer_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY farmer_insert_own_profile ON public.farmer_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- FPO managers can inspect profiles of member farmers within their organization
CREATE POLICY fpo_manager_view_members ON public.farmer_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.fpo_memberships mgr_mem
            JOIN public.fpo_memberships farmer_mem ON mgr_mem.fpo_id = farmer_mem.fpo_id
            WHERE mgr_mem.user_id = auth.uid()
              AND mgr_mem.member_role IN ('manager', 'director')
              AND farmer_mem.user_id = farmer_profiles.user_id
        )
    );

COMMENT ON TABLE public.farmer_profiles IS 'Smallholder farmer agricultural profile and landholding records with strict RLS isolation';
COMMENT ON TABLE public.fpo_organizations IS 'Samunnati AMLA aggregated Farmer Producer Organizations (FPOs)';
