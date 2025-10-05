import { ReactNode } from "react";
import { SvgProps } from "react-native-svg";

export default interface IconContainerProps extends SvgProps {
    children: ReactNode;
}