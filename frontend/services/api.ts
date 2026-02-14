import { supabase } from '../lib/supabase';
import {
    FeedItem,
    MatchOpportunity,
    NearbyUser,
    MatchResult
} from '../constants';

// Simulated network delay is no longer needed for real data, 
// but we keep a small helper if we want to format dates etc.

export const api = {
    /**
     * Fetch the main activity feed (posts, match requests, events)
     */
    getFeed: async (): Promise<FeedItem[]> => {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                id,
                created_at,
                content,
                media_url,
                media_type,
                type,
                sport,
                likes_count,
                comments_count,
                user:profiles(name, username, profile_photo)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching feed:', error);
            return [];
        }

        return data.map((post: any) => ({
            id: post.id,
            type: post.type || 'post',
            sport: post.sport || 'General',
            title: post.title || 'New Post', // Fallback if title missing
            description: post.content || '',
            time: new Date(post.created_at).toLocaleDateString(),
            author: post.user?.name || 'Unknown User',
            authorImage: post.user?.profile_photo || '/avatar-placeholder.png',
            image: post.media_url,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0
        }));
    },

    /**
     * Fetch "Radar" match opportunities
     */
    getRadarMatches: async (): Promise<MatchOpportunity[]> => {
        // Assuming a 'match_requests' table exists
        const { data, error } = await supabase
            .from('match_requests')
            .select('*')
            .eq('status', 'active');

        if (error) {
            console.warn('Error fetching radar matches (table might not exist):', error);
            return [];
        }

        return data.map((req: any) => ({
            id: req.id,
            title: req.title || 'Match Request',
            location: req.location || 'Unknown',
            distance: '2.0 miles', // Mock distance for now
            requiredEloRange: req.elo_range || [1000, 1200],
            sport: req.sport || 'Tennis',
            time: req.match_time || 'TBD',
            status: req.status
        }));
    },

    /**
     * Fetch users nearby (for People Near You / Rankings)
     */
    getNearbyUsers: async (sport?: string, region?: string): Promise<NearbyUser[]> => {
        let query = supabase
            .from('profiles')
            .select('id, name, username, sports, elo, elo_ratings, profile_photo, region')
            .order('elo', { ascending: false });

        if (region) {
            // Include matching region OR users with no region set (fallback)
            // Wrap region in quotes to handle spaces (e.g., "Home Way")
            query = query.or(`region.eq."${region}",region.is.null`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }

        let filteredData = data;
        if (sport && sport !== 'All') {
            // Filter client-side
            filteredData = data.filter((p: any) =>
                p.sports?.includes(sport) ||
                p.elo_ratings?.[sport]
            );

            // SORT by the specific sport's rating (descending)
            filteredData.sort((a: any, b: any) => {
                const ratingA = a.elo_ratings?.[sport] ?? (a.elo || 800);
                const ratingB = b.elo_ratings?.[sport] ?? (b.elo || 800);
                return ratingB - ratingA;
            });
        }

        return filteredData.map((profile: any, index: number) => ({
            id: profile.id,
            name: profile.name || profile.username || 'User',
            sport: sport && sport !== 'All' ? sport : (profile.sports?.[0] || 'General'),

            distance: region ? 'Nearby' : (profile.region || 'Unknown'),
            rank: index + 1,
            image: profile.profile_photo || '/avatar-placeholder.png',
            rating: (sport && profile.elo_ratings?.[sport]) ? profile.elo_ratings[sport] : (profile.elo || 1200)
        }));
    },

    /**
     * Fetch live match results for the ticker
     */
    getMatchResults: async (): Promise<MatchResult[]> => {
        const { data, error } = await supabase
            .from('matches')
            .select(`
                id,
                winner_id,
                loser_id,
                winner_elo,
                loser_elo,
                elo_change,
                score,
                winner:profiles!winner_id(name),
                loser:profiles!loser_id(name)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error || !data) {
            console.warn('Error fetching matches:', error);
            return [];
        }

        return data.map((m: any) => ({
            id: m.id,
            winner: m.winner?.name || 'Winner',
            loser: m.loser?.name || 'Loser',
            winnerElo: m.winner_elo,
            loserElo: m.loser_elo,
            eloChange: m.elo_change,
            score: m.score
        }));
    }
};
