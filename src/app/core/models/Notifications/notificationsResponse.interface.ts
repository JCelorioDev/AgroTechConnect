export interface NotificationResponse {
    message:    string;
    statusCode: number;
    error:      boolean;
    data:       Data;
}

export interface Data {
    notifications: Notification[];
    meta:          Meta;
}

export interface Meta {
    pagination:          Pagination;
    notifications_count: NotificationsCount;
}

export interface NotificationsCount {
    total:  number;
    unread: number;
    read:   number;
}

export interface Pagination {
    total:        number;
    count:        number;
    per_page:     number;
    current_page: number;
    total_pages:  number;
    links:        Links;
}

export interface Links {
    first: string;
    last:  string;
    prev:  null;
    next:  null;
}

export interface Notification {
    id:         string;
    type:       string;
    message:    string;
    sender:     Sender;
    is_read:    boolean;
    created_at: string;
    updated_at: string;
    read_at:    null | string;
}

export interface Sender {
    id:     string;
    name:   string;
    avatar: string;
}
