export interface ShowInformationOpcResponse {
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
    created_at:          string;
    updated_at:          string;
    user_information:    UserInformation;
}

export interface UserInformation {
    id:          string;
    description: string;
    link1:       string;
    link2:       null;
    link3:       null;
    created_at:  string;
    updated_at:  string;
}
