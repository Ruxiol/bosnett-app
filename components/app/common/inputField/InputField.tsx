import { useState } from "react";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native"

import { RPW, RPH, RFS } from "../../../../constants/utils/utils";

import inputFieldInterface from "./interfaces/inputFieldInterface";

const InputField = (props: inputFieldInterface) => {
    const [secureText, setSecureText] = useState<Boolean>(true);

    const handleSecureText = () => {
        setSecureText(!secureText);
    }

    return (
        <View style={styles.inputContainer}>
            {props.leftIcon && <View style={styles.iconContainerLeft}>{props.leftIcon}</View>}
            <TextInput
                style={[styles.input, { paddingLeft: props.leftIcon ? RPW(9.5) : RPW(3.5) }]}
                onChangeText={props.onChangeText}
                placeholder={props.placeholder}
                secureTextEntry={secureText && props.secureTextEntry}
                keyboardType={
                    props.type === "email" ? "email-address" :
                        props.type === "password" ? "default" :
                            props.type === "number" ? "number-pad" :
                                props.type === "numeric" ? "number-pad" :
                                    props.type === "text" ? "default" :
                                        "default"
                }
                autoCapitalize="none"
            />
            {
                props.rightIcon &&
                <View style={styles.iconContainerRight}>
                    <TouchableOpacity onPress={handleSecureText}>
                        {props.rightIcon}
                    </TouchableOpacity>
                </View>
            }
        </View>
    )
}


export default InputField

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative"
    },
    iconContainerLeft: {
        position: "absolute",
        left: RPW(3),
        top: RPH(2)
    },
    iconContainerRight: {
        position: "absolute",
        right: RPW(3),
    },
    input: {
        borderRadius: 16,
        backgroundColor: "#fff",
        paddingVertical: RPH(1.4),
        flex: 1,
        color: "#000",
        fontFamily: "Lato-Regular",
        fontWeight: "400",
        fontSize: RFS(18),
        borderWidth: 1,
        borderColor: '#C4C4C4'
    }
})