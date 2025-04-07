export interface LoginResponseI {
  message:    string;
  statusCode: number;
  error:      boolean;
  data:       Data;
}

export interface Data {
  id:                  number;
  name:                string;
  lastname:            string;
  username:            string;
  email:               string;
  email_verified_at:   null;
  registration_method: string;
  created_at:          Date;
  updated_at:          Date;
  roles:               Role[];
  token:               string;
}

export interface Role {
  id:         number;
  name:       string;
  created_at: string;
  updated_at: string;
}
