import IProfileData from "../../../../interfaces/IProfileData";
import FeedPOstMediaInterface from "./feedPostMediaInterface";
import ReactionsInterface from "./reactionsInterface";

export default interface FeedPostResponse {
    _id: string;
    userdetail: IProfileData,
    title: string;
    description: string;
    media: FeedPOstMediaInterface[];
    date_posted: string;
    postType: string;
    commentsCount: number;
    reactions: ReactionsInterface[];
    showOverlay?: boolean;
} 