export interface Song {
  id: string
  title: string
  artist: string
  genre: string | null
  image_name: string | null
  basic_level: string | null
  advanced_level: string | null
  expert_level: string | null
  master_level: string | null
  ultima_level: string | null
  basic_const: number | null
  advanced_const: number | null
  expert_const: number | null
  master_const: number | null
  ultima_const: number | null
}

export interface Profile {
  id: string
  username: string
  b30_rating: number
  created_at: string
}

export type Difficulty = 'BASIC' | 'ADVANCED' | 'EXPERT' | 'MASTER' | 'ULTIMA'
export type Lamp = 'NONE' | 'FC' | 'AJ' | 'AJC'

export interface UserScore {
  id: string
  user_id: string
  song_id: string
  difficulty: Difficulty
  score: number
  grade: string
  lamp: Lamp
  song_rating: number
  updated_at: string
}

export interface UserScoreWithSong extends UserScore {
  song: Song
}
