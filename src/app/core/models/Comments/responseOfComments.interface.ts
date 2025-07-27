export interface ResponseOfCommentsI {
  message:    string;
  statusCode: number;
  error:      boolean;
  data:       Data;
}

export interface Data {
  current_page:   number;
  data:           Datum[];
  first_page_url: string;
  from:           number;
  last_page:      number;
  last_page_url:  string;
  links:          Link[];
  next_page_url:  null;
  path:           string;
  per_page:       number;
  prev_page_url:  null;
  to:             number;
  total:          number;
}

export interface Datum {
  id:                       string;
  comment:                  string;
  created_at:               string;
  updated_at:               string;
  user:                     User;
  images:                   Image[];
  reactions_count:          number;
  positive_reactions_count: number;
  negative_reactions_count: number;
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

export interface Link {
  url:    null | string;
  label:  string;
  active: boolean;
}
