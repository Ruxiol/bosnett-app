export default interface UsersInterface {
    avatar_urls: {
        [key: string]: string;
    };
    can_follow: boolean;
    can_report: boolean;
    can_send_message: boolean;
    can_user_report: boolean;
    cover_is_default: boolean;
    cover_url: string;
    create_friendship: boolean;
    followers: number;
    following: number;
    id: number;
    is_following: boolean;
    last_activity: string;
    link: string;
    mention_name: string;
    name: string;
    registered_date: string;
    user_login: string;
    user_reported: boolean;
}