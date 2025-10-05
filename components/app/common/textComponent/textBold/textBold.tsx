import { StyleSheet, Text } from "react-native"

import { RFS, RLH, RLS } from "../../../../../constants/utils/utils";

import TextProps from "../interfaces/textProps";

const TextBold = (props: TextProps) => {
    const black = "#000";
    const { color = black } = props

    return (
        <Text
            style={[styles.boldText,
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

export default TextBold

const styles = StyleSheet.create({
    boldText: {
        fontWeight: "700",
        fontFamily: "Lato-Bold"
    }
})