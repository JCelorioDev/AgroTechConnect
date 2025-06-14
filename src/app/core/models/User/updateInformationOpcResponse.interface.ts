export interface UpdateInformationOpcResponseInterface {
    message:    string;
    statusCode: number;
    error:      boolean;
    data:       Data;
}

export interface Data {
    id:          string;
    description: string;
    link1:       string;
    link2:       null;
    link3:       null;
    created_at:  string;
    updated_at:  string;
}
