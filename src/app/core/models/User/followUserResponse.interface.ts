export interface FollowUserResponse {
    message:    string;
    statusCode: number;
    error:      boolean;
    data:       Data;
}

export interface Data {
    follow_id: number;
}
