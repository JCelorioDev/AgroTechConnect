export interface ShowNotificationResponse {
  message:    string;
  statusCode: number;
  error:      boolean;
  data:       ShowNotificationResponseData;
}

export interface ShowNotificationResponseData {
  id:         string;
  type:       string;
  message:    string;
  data:       DataData;
  is_read:    boolean;
  created_at: string;
  updated_at: string;
  read_at: string | null | undefined;
}

export interface DataData {
  title:               string;
  type:                string;
  post_id:             number;
  reaction_id:         number;
  reaction_type:       string;
  post_title:          string;
  link_post:           string;
  link_sender_profile: string;
  sender_name:         string;
  sender_avatar:       string;
  sender_id:           number;
  message:             string;
}
