import FeedPostResponse from "./feedPostsResponse";

export default interface NewsFeedItemProps {
    item?: FeedPostResponse;
    index?: number;
    newsFeedPosts?: FeedPostResponse[];
    setNewsFeedPosts?: React.Dispatch<React.SetStateAction<FeedPostResponse[]>>;
    isLoading: boolean;
    userColors?: { [key: string]: string };
}