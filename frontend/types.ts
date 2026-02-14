
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SportCategory {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface AthleteProfile {
  id: string;
  name: string;
  sport: string;
  rating: number;
  ratings?: Record<string, number>; // Per-sport ratings
  image: string;
  bio: string;
}
