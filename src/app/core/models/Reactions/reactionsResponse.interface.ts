export interface ReactionsResponseI {
  message:    string;
  statusCode: number;
  error:      boolean;
  data:       Data;
}

export interface Data {
  all_reactions:      Reaction[];
  positive_reactions: Reaction[];
  negative_reactions: any[];
  counts:             Counts;
}

export interface Reaction {
  id:                string;
  type:              string;
  created_at:        string;
  updated_at:        string;
  user:              User;
  reactionable_type: string;
}

export interface User {
  id:                  string;
  name:                string;
  lastname:            string;
  username:            string;
  email:               string;
  registration_method: string;
  email_verified:      boolean;
  created_at:          string;
  updated_at:          string;
  image:               Image;
}

export interface Image {
  id:             string;
  image_Uuid:     string;
  url:            string;
  imageable_type: string;
  imageable:      null;
  created_at:     string;
  updated_at:     string;
}

export interface Counts {
  total:    number;
  positive: number;
  negative: number;
}
