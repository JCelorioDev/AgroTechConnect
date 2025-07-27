export interface CommentsPublicactionResponseInterfaceTs {
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
  replies_count:            number;
  reactions_count:          number;
  positive_reactions_count: number;
  negative_reactions_count: number;
  images:                   Image[];
}

export interface Image {
  id:             string;
  image_Uuid:     string;
  url:            string;
  imageable_type: ImageableType;
  imageable:      null;
  created_at:     ImageCreatedAt;
  updated_at:     ImageCreatedAt;
}

export enum ImageCreatedAt {
  The240720252049 = "24/07/2025 20:49",
}

export enum ImageableType {
  AppModelsV1Comment = "App\\Models\\V1\\Comment",
  AppModelsV1User = "App\\Models\\V1\\User",
}

export interface User {
  id:                  string;
  name:                string;
  lastname:            string;
  username:            string;
  email:               string;
  registration_method: string;
  email_verified:      boolean;
  created_at:          UserCreatedAt;
  updated_at:          UserCreatedAt;
  image:               Image;
  ranges:              Range[];
}

export enum UserCreatedAt {
  The240720252048 = "24/07/2025 20:48",
}

export interface Range {
  id:          string;
  name:        Name;
  min_range:   number;
  max_range:   number;
  description: string;
  image_url:   string;
  created_at:  UserCreatedAt;
  updated_at:  UserCreatedAt;
}

export enum Name {
  Aprendiz = "Aprendiz",
  Iniciado = "Iniciado",
  Novato = "Novato",
}

export interface Link {
  url:    null | string;
  label:  string;
  active: boolean;
}
