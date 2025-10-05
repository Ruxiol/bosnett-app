import { ImageSourcePropType } from "react-native";

export default interface UserActionsInterface {
    icon: ImageSourcePropType;
    text: string;
    onPress: () => void;
    onLongPress?: () => void;
}