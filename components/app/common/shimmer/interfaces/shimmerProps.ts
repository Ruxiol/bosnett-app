import { StyleProp } from "react-native";

export default interface ShimmerProps {
    isLoading: boolean | undefined;
    width: string | number;
    height: string | number;
    borderRadius: number;
    marginLeft?: number;
    marginRight?: number;
}