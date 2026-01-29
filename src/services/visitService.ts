import { supabase } from "./supabaseClient";

/**
 * Visit Service
 * Handles tracking of unique visits and total hits
 */

export const trackVisit = async () => {
  try {
    // 1. Check if we have already tracked this session to avoid double counting
    const sessionTracked = sessionStorage.getItem('casaseg_visit_tracked');
    if (sessionTracked) return;

    // 2. Increment visit count in Supabase
    // We use an RPC call to increment the counter atomically
    // TABLE: site_stats, COLUMN: visitor_count
    const { error } = await supabase.rpc('increment_visitor_count');

    if (error) {
      console.warn('Failed to increment visitor count via RPC, attempting manual update:', error);
      
      // Fallback: Manual update if RPC isn't set up
      const { data, error: fetchError } = await supabase
        .from('site_stats')
        .select('visitor_count')
        .eq('id', 1)
        .single();

      if (!fetchError && data) {
        await supabase
          .from('site_stats')
          .update({ visitor_count: data.visitor_count + 1 })
          .eq('id', 1);
      }
    }

    sessionStorage.setItem('casaseg_visit_tracked', 'true');
  } catch (err) {
    console.error('Error tracking visit:', err);
  }
};

export const getVisitorCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('site_stats')
      .select('visitor_count')
      .eq('id', 1)
      .single();

    if (error) throw error;
    return data.visitor_count || 0;
  } catch (err) {
    console.warn('Could not fetch visitor count:', err);
    return 0;
  }
};
