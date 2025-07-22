export interface ShowPostResponse{
    message:    string;
    statusCode: number;
    error:      boolean;
    data:       Data;
}

export interface Data {
    id:                       string;
    title:                    string;
    description:              string;
    created_at:               string;
    updated_at:               string;
    positive_reactions_count: number;
    negative_reactions_count: number;
    user:                     User;
    images:                   Image[];
    comments_count:           number;
    reactions_count:          number;
    comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    lastname: string;
    image?: {
      url: string;
    };
  };
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
    ranges:              Range[];
}

export interface Range {
    id:          string;
    name:        string;
    min_range:   number;
    max_range:   number;
    description: string;
    image_url:   string;
    created_at:  string;
    updated_at:  string;
}
