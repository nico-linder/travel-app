import { supabase } from '../lib/supabase';

export interface Trip {
  id: string;
  name: string;
  description?: string;
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

  async createTrip(tripData: { name: string; start_date?: string; end_date?: string; created_by: string; fullName?: string }) {
    // 1. We skip profiles sync as it's likely handled by triggers or restricted by RLS
    // and trips table doesn't have a created_by column in this schema.
    
    // 2. Create the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: tripData.name,
        start_date: tripData.start_date || null,
        end_date: tripData.end_date || null,
        current_phase: 1,
        creator_id: tripData.created_by
      })
      .select()
      .single();
    
    if (tripError) throw tripError;

    // 3. Add creator as admin member
    // In this schema, ownership is likely managed through trip_members
    const { error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: trip.id,
        user_id: tripData.created_by,
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

  async proposeDestination(tripId: string, destination: any) {
    const { data, error } = await supabase
      .from('destinations')
      .insert({
        trip_id: tripId,
        ...destination
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
