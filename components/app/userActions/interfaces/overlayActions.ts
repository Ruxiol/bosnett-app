import { ImageSourcePropType } from "react-native";

export default interface OverlayActionsInterface {
    text: string;
    icon: ImageSourcePropType;
    onPress: () => void;
}