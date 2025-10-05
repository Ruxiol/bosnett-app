import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

export default interface AuthContainerInterface {
    children: ReactNode;
    style?: StyleProp<ViewStyle>
}