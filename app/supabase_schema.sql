-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (Mirrors auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRIPS TABLE
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    phase INTEGER DEFAULT 1, -- 1 to 4
    start_date DATE,
    end_date DATE,
    invitation_code TEXT UNIQUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRIP MEMBERS (Many-to-Many)
CREATE TABLE public.trip_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    UNIQUE(trip_id, user_id)
);

-- DESTINATIONS (Specific cities/spots within a trip)
CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    place_id TEXT, -- Google Place ID or OpenTripMap XID
    image_url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    duration_days INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DESTINATION VOTES (Phase 1 & 2)
CREATE TABLE public.destination_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_liked BOOLEAN NOT NULL,
    UNIQUE(destination_id, user_id)
);

-- ACTIVITIES (Micro-level items)
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    place_id TEXT,
    image_url TEXT,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY VOTES (Phase 4)
CREATE TABLE public.activity_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_liked BOOLEAN NOT NULL,
    UNIQUE(activity_id, user_id)
);

-- SCHEDULE ITEMS (Finalized Calendar)
CREATE TABLE public.schedule_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    is_flexible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Simplified example)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_votes ENABLE ROW LEVEL SECURITY;

-- Allow members of a trip to see destinations
CREATE POLICY "Trip members can view destinations" ON public.destinations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = destinations.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );
