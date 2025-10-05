import { ImagePickerOptions } from "expo-image-picker";

export default interface ButtonsInterface {
    label: string;
    action: (action?: string, options?: ImagePickerOptions) => Promise<void> | void;
    icon: JSX.Element;
}