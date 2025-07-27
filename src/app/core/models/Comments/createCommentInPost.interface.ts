export interface CreateCommentInPostReponseI {
  message:    string;
  statusCode: number;
  error:      boolean;
  data:       Data;
}

export interface Data {
  id:                       string;
  comment:                  string;
  created_at:               string;
  updated_at:               string;
  user:                     User;
  positive_reactions_count: number;
  negative_reactions_count: number;
  images:                   any[];
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
