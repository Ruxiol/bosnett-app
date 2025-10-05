import { ImagePickerOptions } from "expo-image-picker";
import ImageInterface from "../../../components/common/interfaces/imageInterface";

export default interface CreatePostModalProps {
    images: ImageInterface[];
    description: string;
    isGroup?: boolean;
    handleImagePicker: (action: string, options?: ImagePickerOptions) => Promise<void>;
    removeImage: (index: number) => void;
    uploadImages?: () => void;
    setDescription?: (value: string) => void;
}