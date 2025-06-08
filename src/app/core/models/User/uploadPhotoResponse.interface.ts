export interface UploadPhotoResponse {
    message:    string;
    statusCode: number;
    error:      boolean;
    data:       Data;
}

export interface Data {
    avatar_url: string;
}
