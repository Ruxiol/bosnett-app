import { StyleSheet, Text } from "react-native"

import { RFS, RLH, RLS } from "../../../../../constants/utils/utils";

import TextProps from "../interfaces/textProps";

const TextRegular = (props: TextProps) => {
    const black = "#000";
    const { color = black } = props

    return (
        <Text
            style={[styles.regularText,
            { letterSpacing: RLS(RFS(props.fontSize)) },
            props.style, {
                fontSize: RFS(props.fontSize),
                lineHeight: RLH(RFS(props.fontSize)),
                color: color
            }]}
        >
            {props.children}
        </Text>
    )
}

export default TextRegular

const styles = StyleSheet.create({
    regularText: {
        fontWeight: "400",
        fontFamily: "Lato-Regular"
    }
})