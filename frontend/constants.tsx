
import { Feature, SportCategory, AthleteProfile } from './types';

export const FRAME_COUNT = 2; // 0, 1, 2 = 3 images
export const SCROLL_HEIGHT_MULTIPLIER = 5;

export const FEATURES: Feature[] = [
  {
    id: 'elo',
    title: 'Fair Skill Ratings',
    description: 'Stop playing mismatched games. Our ranking algorithm finds you opponents at your exact skill level for every sport.',
    icon: 'target'
  },
  {
    id: 'recruit',
    title: 'Verified Athlete Profile',
    description: 'Your digital sports career. Track your win rates, upload highlight reels, and get discovered by local teams/scouts.',
    icon: 'user-check'
  },
  {
    id: 'venue',
    title: 'Instant Court Booking',
    description: 'No more "where are we playing?" Secure high-quality courts instantly through our network of partner venues.',
    icon: 'map-pin'
  }
];

export const SPORTS: SportCategory[] = [
  {
    id: 'tennis',
    name: 'Tennis',
    image: '/Tennis.jpg',
    description: 'Find local courts and players at your skill level.'
  },
  {
    id: 'badminton',
    name: 'Badminton',
    image: '/badminton.jpg', // Placeholder
    description: 'Smash it on the court with local players.'
  },
  {
    id: 'squash',
    name: 'Squash',
    image: '/squash.jpg', // Placeholder
    description: 'High-intensity rallies in your area.'
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    image: '/table-tennis.jpg', // Placeholder
    description: 'Fast-paced ping pong action.'
  },
  {
    id: 'pickleball',
    name: 'Pickleball',
    image: '/pickleball.jpg', // Placeholder
    description: 'The fastest growing sport in the world.'
  },
  {
    id: 'padel',
    name: 'Padel',
    image: '/padel.jpg', // Placeholder
    description: 'Social and competitive padel matches.'
  },
  {
    id: 'football',
    name: 'Football',
    image: '/cristiano_ronaldo.png',
    description: 'Organize 5-a-side matches with ELO ratings.'
  },
  {
    id: 'mma',
    name: 'MMA',
    image: '/conor_mcgregor.jpeg',
    description: 'Find sparring partners and local gyms.'
  },
  {
    id: 'fitness',
    name: 'Gym & Fitness',
    image: '/Crossfit.JPG',
    description: 'Connect with training partners for maximum gains.'
  }
];

export const ATHLETES: AthleteProfile[] = [
  {
    id: '1',
    name: 'User_7721',
    sport: 'Boxing',
    rating: 2450,
    ratings: { 'boxing': 2450, 'mma': 2200 },
    image: '/avatar-1.png',
    bio: 'Heavyweight metrics: Top 5% punch velocity in region.'
  },
  {
    id: '2',
    name: 'User_9904',
    sport: 'Sprinting',
    rating: 2100,
    image: '/avatar-2.png',
    bio: 'Track split times verified. 98th percentile acceleration.'
  },
  {
    id: '3',
    name: 'User_3382',
    sport: 'Football',
    rating: 1850,
    ratings: { 'football': 1850, 'futsal': 1900 },
    image: '/avatar-3.png',
    bio: 'Midfield playmaker stats: 88% pass accuracy average.'
  }
];

export interface FeedItem {
  id: string;
  type: 'match' | 'post' | 'event';
  sport: string;
  title: string;
  description: string;
  time: string;
  author: string;
  authorImage: string;
  image?: string;
  likes: number;
  comments: number;
}

export const FEED_ITEMS: FeedItem[] = [
  {
    id: 'f1',
    type: 'match',
    sport: 'football',
    title: '5-a-side Friendly Match',
    description: 'Looking for 2 more players for a casual game this Sunday evening at Turbo Turf.',
    time: '2 hours ago',
    author: 'Rahul D.',
    authorImage: 'https://i.pravatar.cc/150?u=rahul',
    likes: 12,
    comments: 4
  },
  {
    id: 'f2',
    type: 'post',
    sport: 'tennis',
    title: 'Best courts in South Mumbai?',
    description: 'Can anyone recommend good clay courts near Colaba? Willing to travel a bit if the facility is top tier.',
    time: '4 hours ago',
    author: 'Priya S.',
    authorImage: 'https://i.pravatar.cc/150?u=priya',
    image: '/Tennis.jpg',
    likes: 45,
    comments: 23
  },
  {
    id: 'f3',
    type: 'event',
    sport: 'badminton',
    title: 'Weekend Doubles Tournament',
    description: 'Registration open for the Amateur Doubles Cup. Prizes worth ₹10k!',
    time: '1 day ago',
    author: 'Smash Club',
    authorImage: 'https://i.pravatar.cc/150?u=smash',
    image: '/badminton.jpg',
    likes: 89,
    comments: 15
  },
  {
    id: 'f4',
    type: 'match',
    sport: 'squash',
    title: 'Sparring Partner Needed (Advanced)',
    description: 'Looking for someone rated 2000+ to practice drills with on Tuesday mornings.',
    time: '5 hours ago',
    author: 'Vikram R.',
    authorImage: 'https://i.pravatar.cc/150?u=vikram',
    likes: 8,
    comments: 1
  },
  {
    id: 'f5',
    type: 'post',
    sport: 'pickleball',
    title: 'Pickleball vs Padel?',
    description: 'Just tried Pickleball for the first time and loved it! How does it compare to Padel intensity-wise?',
    time: '30 mins ago',
    author: 'Sarah J.',
    authorImage: 'https://i.pravatar.cc/150?u=sarah',
    likes: 34,
    comments: 12
  },
  {
    id: 'f6',
    type: 'match',
    sport: 'padel',
    title: 'Padel Beginners Meetup',
    description: 'Hosting a session for absolute beginners. Equipment provided. Join us!',
    time: '3 hours ago',
    author: 'Padel Pro',
    authorImage: 'https://i.pravatar.cc/150?u=padel',
    likes: 56,
    comments: 8
  }
];

export interface NearbyUser {
  id: string;
  name: string;
  sport: string;
  distance: string; // e.g., "2 miles away"
  rank: number; // For the numbered list
  image: string;
  rating?: number;
}

export const NEARBY_USERS: NearbyUser[] = [
  {
    id: 'u1',
    name: 'ALEX PEREIRA',
    sport: 'KICKBOXING',
    distance: '0.5 miles',
    rank: 1,
    image: 'https://i.pravatar.cc/150?u=alex'
  },
  {
    id: 'u2',
    name: 'ISLAM MAKHACHEV',
    sport: 'WRESTLING',
    distance: '1.2 miles',
    rank: 2,
    image: 'https://i.pravatar.cc/150?u=islam'
  },
  {
    id: 'u3',
    name: 'CHARLES OLIVEIRA',
    sport: 'BJJ',
    distance: '2.5 miles',
    rank: 3,
    image: 'https://i.pravatar.cc/150?u=charles'
  },
  {
    id: 'u4',
    name: 'ILAI TOPURIA',
    sport: 'Tennis',
    distance: '3.0 miles',
    rank: 4,
    image: 'https://i.pravatar.cc/150?u=ilia'
  },
  {
    id: 'u5',
    name: 'SEAN O\'MALLEY',
    sport: 'Badminton',
    distance: '4.1 miles',
    rank: 5,
    image: 'https://i.pravatar.cc/150?u=sean'
  }
];

export interface MatchResult {
  id: string;
  winner: string;
  loser: string;
  winnerElo: number;
  loserElo: number;
  eloChange: number;
  score: string;
}

export const MATCH_RESULTS: MatchResult[] = [
  {
    id: 'm1',
    winner: 'Arjun',
    loser: 'Rahul',
    winnerElo: 1450,
    loserElo: 1420,
    eloChange: 15,
    score: '21-18, 21-19'
  },
  {
    id: 'm2',
    winner: 'Sarah',
    loser: 'Priya',
    winnerElo: 1200,
    loserElo: 1150,
    eloChange: 12,
    score: '6-4, 6-3'
  },
  {
    id: 'm3',
    winner: 'Vikram',
    loser: 'Dev',
    winnerElo: 1600,
    loserElo: 1580,
    eloChange: 10,
    score: '11-9, 11-8, 11-7'
  }
];

export interface MatchOpportunity {
  id: string;
  title: string;
  location: string;
  distance: string;
  requiredEloRange: [number, number];
  sport: string;
  time: string;
  status?: 'active' | 'accepted' | 'expired' | 'completed';
  user_id?: string;
  accepted_by?: string;
  userClaimed?: boolean;
  userClaimedResult?: 'win' | 'loss';
}

export const MATCH_OPPORTUNITIES: MatchOpportunity[] = [
  {
    id: 'mo1',
    title: '2v2 Padel Match - HSR Layout',
    location: 'HSR Layout',
    distance: '1.2km away',
    requiredEloRange: [1100, 1300],
    sport: 'padel',
    time: '7:00 PM'
  },
  {
    id: 'mo2',
    title: 'Tennis Singles - Advanced',
    location: 'Koramangala Club',
    distance: '2.5km away',
    requiredEloRange: [1400, 1600],
    sport: 'tennis',
    time: '6:30 PM'
  },
  {
    id: 'mo3',
    title: 'Badminton Doubles',
    location: 'Smash Arena',
    distance: '0.8km away',
    requiredEloRange: [1000, 1200],
    sport: 'badminton',
    time: '8:00 PM'
  }
];
