import { ImagePickerOptions } from "expo-image-picker";

export default interface ImagePickerButtonsModalProps {
    handleImagePicker: (action: string, options?: ImagePickerOptions) => Promise<void>;
    showButtons: boolean;
    setShowButtons: (value: boolean) => void;
}