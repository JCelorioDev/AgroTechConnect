export interface PostInterfaceI {
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
    next_page_url:  string;
    path:           string;
    per_page:       number;
    prev_page_url:  null;
    to:             number;
    total:          number;
}

export interface Datum {
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
    The060720252055 = "06/07/2025 20:55",
}

export enum ImageableType {
    AppModelsV1Post = "App\\Models\\V1\\Post",
    AppModelsV1User = "App\\Models\\V1\\User",
}

export interface User {
    id:                  string;
    name:                string;
    lastname:            string;
    username:            string;
    email:               string;
    registration_method: RegistrationMethod;
    email_verified:      boolean;
    created_at:          UserCreatedAt;
    updated_at:          UserCreatedAt;
    image:               Image;
    ranges:              Range[];
}

export enum UserCreatedAt {
    The060720252050 = "06/07/2025 20:50",
    The060720252051 = "06/07/2025 20:51",
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
    Experto = "Experto",
    Iniciado = "Iniciado",
    Novato = "Novato",
}

export enum RegistrationMethod {
    Google = "google",
    Local = "local",
}

export interface Link {
    url:    null | string;
    label:  string;
    active: boolean;
}
