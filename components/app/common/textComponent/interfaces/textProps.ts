import { ColorValue, StyleProp, TextStyle, ViewStyle } from "react-native";

export default interface TextProps {
    fontSize: number;
    color?: ColorValue;
    children: string | string[];
    style?: StyleProp<ViewStyle | TextStyle>;
}