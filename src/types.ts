export interface Trip {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  polarsteps_url: string | null;
  polarsteps_embed_url: string | null;
  created_at: string;
  created_by: string;
}

export interface Photo {
  id: string;
  trip_id: string;
  storage_path: string;
  thumb_path: string | null;
  title: string;
  day: string;
  description: string | null;
  is360: boolean;
  created_by: string;
  created_at: string;
  signedUrl?: string;
  signedThumbUrl?: string;
}

export interface Comment {
  id: string;
  photo_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    username: string;
  } | null;
}
