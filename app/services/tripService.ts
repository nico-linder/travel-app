import { supabase } from '../lib/supabase';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  vibes?: string[];
  start_date: string;
  end_date: string;
  current_phase: number;
  creator_id: string;
  created_at: string;
}

export const tripService = {
  async getTrip(id: string) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Trip;
  },

  async getUserTrips(userId: string) {
    const { data, error } = await supabase
      .from('trips')
      .select('*, trip_members!inner(user_id)')
      .eq('trip_members.user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Trip[];
  },

  async createTrip(tripData: { 
    name: string; 
    start_date?: string; 
    end_date?: string; 
    creator_id: string; 
    fullName?: string;
    vibes?: string[];
    current_phase?: number;
  }) {
    // 1. Create the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: tripData.name,
        start_date: tripData.start_date || null,
        end_date: tripData.end_date || null,
        current_phase: tripData.current_phase || 1,
        creator_id: tripData.creator_id,
        vibes: tripData.vibes || []
      })
      .select()
      .single();
    
    if (tripError) throw tripError;

    // 2. Add creator as admin member
    const { error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: trip.id,
        user_id: tripData.creator_id,
        role: 'admin'
      });
    
    if (memberError) throw memberError;

    return trip as Trip;
  },

  async getDestinations(tripId: string) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async vote(destinationId: string, userId: string, isLiked: boolean) {
    const { data, error } = await supabase
      .from('votes')
      .upsert({ 
        destination_id: destinationId, 
        user_id: userId, 
        is_liked: isLiked 
      }, { onConflict: 'destination_id,user_id' });
    
    if (error) throw error;
    return data;
  },

  async proposeDestination(tripId: string, destination: any, isLiked: boolean = true) {
    // 1. Check if destination already exists for this trip
    if (destination.otm_xid) {
      const { data: existing } = await supabase
        .from('destinations')
        .select('id')
        .eq('trip_id', tripId)
        .eq('otm_xid', destination.otm_xid)
        .maybeSingle();

      if (existing) {
        // Just add/update the vote
        if (destination.proposed_by) {
          await this.vote(existing.id, destination.proposed_by, isLiked);
        }
        return existing;
      }
    }

    // 2. Create new destination
    const { data, error } = await supabase
      .from('destinations')
      .insert({
        trip_id: tripId,
        ...destination
      })
      .select()
      .single();
    
    if (error) throw error;

    // 3. Automatically add the vote for the proposer
    if (destination.proposed_by) {
      await this.vote(data.id, destination.proposed_by, isLiked);
    }

    return data;
  },

  async getUserVotes(tripId: string, userId: string) {
    // Get all destinations for this trip first
    const { data: destinations, error: destError } = await supabase
      .from('destinations')
      .select('id')
      .eq('trip_id', tripId);
    
    if (destError) throw destError;
    if (!destinations || destinations.length === 0) return [];

    const destIds = destinations.map(d => d.id);

    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .in('destination_id', destIds)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async getTripVotes(tripId: string) {
    const { data: destinations, error: destError } = await supabase
      .from('destinations')
      .select('id, name')
      .eq('trip_id', tripId);
    
    if (destError) throw destError;
    if (!destinations || destinations.length === 0) return [];

    const destIds = destinations.map(d => d.id);

    const { data, error } = await supabase
      .from('votes')
      .select('*, users(display_name, avatar_url)')
      .in('destination_id', destIds);
    
    if (error) throw error;
    return data;
  },

  async getTripMembers(tripId: string) {
    const { data, error } = await supabase
      .from('trip_members')
      .select('*, users(display_name, avatar_url)')
      .eq('trip_id', tripId);
    
    if (error) throw error;
    return data;
  },

  async finalizeDestination(tripId: string, destinationId: string) {
    const { error } = await supabase
      .from('trips')
      .update({ 
        current_phase: 3, // Advance to Assembly
        final_destination_id: destinationId // This column might need to be added to SQL
      })
      .eq('id', tripId);
    
    if (error) throw error;
    return true;
  },

  subscribeToVotes(tripId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`trip_votes_${tripId}`)
      .on('postgres_changes', { 
        event: '*', 
        table: 'votes'
      }, callback)
      .subscribe();
  }
};
