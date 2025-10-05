export default interface PostDotMenuProps {
    activeIndex: number;
    index: number;
    onMenuPress: (index: number) => void;
    isMenuVisible: boolean;
    setIsMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
    postId: string;
}