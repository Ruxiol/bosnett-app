import FeedPostResponse from "../../../components/app/newsFeed/interfaces/feedPostsResponse";

export default interface PostOptionsModalProps {
    isModalVisible: boolean;
    setIsModalVisible: (value: boolean) => void;
    postId: string | undefined;
    setPosts: React.Dispatch<React.SetStateAction<FeedPostResponse[]>> | undefined;
}