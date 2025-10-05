import { ReactElement } from "react";
import { TextInputProps } from "react-native";

export default interface inputFieldInterface extends TextInputProps {
    leftIcon?: ReactElement;
    rightIcon?: ReactElement;
    type: string;
}