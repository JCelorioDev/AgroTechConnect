export interface ResponseUserI {
    message:    string;
    statusCode: number;
    error:      boolean;
    data:       Data;
}

export interface Data {
    id:                  string;
    name:                string;
    lastname:            string;
    username:            string;
    email:               string;
    registration_method: string;
    email_verified:      boolean;
    created_at:          AtedAt;
    updated_at:          AtedAt;
    roles:               Role[];
    image:               Image;
    user_information:    UserInformation;
    ranges:              Range[];
    followers:           Follower[];
    followings:          Follower[];
    reactions:           Reaction[];
    complaints:          Complaint[];
    posts:               Post[];
}

export interface Complaint {
    id:                 string;
    description:        string;
    user:               Follower;
    complaintable_type: string;
    complaintable:      Post;
    created_at:         AtedAt;
    updated_at:         AtedAt;
}

export interface Post {
    id:                       string;
    title:                    string;
    description:              string;
    created_at:               string;
    updated_at:               string;
    positive_reactions_count: number;
    negative_reactions_count: number;
    comments_count?:          number;
    reactions_count?:         number;
}

export enum AtedAt {
    The050620252042 = "05/06/2025 20:42",
    The050620252044 = "05/06/2025 20:44",
}

export interface Follower {
    id:                  string;
    name:                null | string;
    lastname:            null | string;
    username:            null | string;
    email:               null | string;
    registration_method: null | string;
    email_verified:      boolean;
    created_at:          AtedAt;
    updated_at:          AtedAt;
    image?:              Image;
}

export interface Image {
    id:             string;
    image_Uuid:     string;
    url:            string;
    imageable_type: string;
    imageable:      null;
    created_at:     AtedAt;
    updated_at:     AtedAt;
}

export interface Range {
    id:          string;
    name:        string;
    min_range:   number;
    max_range:   number;
    description: string;
    image_url:   string;
    created_at:  AtedAt;
    updated_at:  AtedAt;
}

export interface Reaction {
    id:                string;
    type:              string;
    created_at:        string;
    updated_at:        AtedAt;
    user:              Follower;
    reactionable_type: string;
}

export interface Role {
    id:         number;
    name:       string;
    created_at: AtedAt;
    updated_at: AtedAt;
}

export interface UserInformation {
    id:          string;
    description: string;
    link1:       string;
    link2:       string;
    link3:       string;
    created_at:  AtedAt;
    updated_at:  AtedAt;
}
