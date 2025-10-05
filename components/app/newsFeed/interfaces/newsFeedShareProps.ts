export default interface NewsFeedShareProps {
    showUploadButtons: (value: boolean) => void;
    isPostCreated?: boolean;
    isLoading?: boolean;
    userColors?: { [key: string]: string };
    setUserColors?: (colors: { [key: string]: string }) => void;
}