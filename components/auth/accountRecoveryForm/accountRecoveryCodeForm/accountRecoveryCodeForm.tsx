import { View, StyleSheet, TextInput } from "react-native";
import { memo, useRef, useState } from "react";

import TextBold from "../../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../../app/common/textComponent/textRegular/textRegular";

import { RFS, RLS, RPH, RPW } from "../../../../constants/utils/utils";

import useSliceSelector from "../../../../hooks/useSliceSelector";

import AccountRecoveryVerificationFormProps from "./interfaces/accountRecoveryVerificationFormProps";
import AuthHeader from "../../authHeader/authHeader";

const AccountRecoveryCodeForm = (props: AccountRecoveryVerificationFormProps) => {
    const { formik } = props
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", ""]);
    const messages = useSliceSelector(state => state.language.messages);

    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    const handleChange = (value: string, index: number) => {
        const updatedCode = [...verificationCode];
        updatedCode[index] = value;

        setVerificationCode(updatedCode);

        if (value.length === 1 && index < inputRefs.length - 1) {
            inputRefs[index + 1].current?.focus();
        }

        formik.setFieldValue("otp_code", updatedCode.join(""));
    };

    const handleBackspace = (index: number) => {
        const updatedCode = [...verificationCode];

        if (verificationCode[index] === "" && index > 0) {
            inputRefs[index - 1].current?.focus();
        } else {
            // Clear the current field
            updatedCode[index] = "";
            setVerificationCode(updatedCode);
            formik.setFieldValue("otp_code", updatedCode.join(""));
        }
    };

    return (
        <View style={styles.inner}>
            <View>
                <TextBold fontSize={23}>
                    {messages.verification}
                </TextBold>
                <TextRegular fontSize={15}>
                    {messages.verificationContent}
                </TextRegular>
            </View>
            <View style={styles.fieldContainer}>
                {verificationCode.map((value, index) => (
                    <TextInput
                        key={index}
                        value={value}
                        style={styles.codeInput}
                        onChangeText={(text) => handleChange(text, index)}
                        onBlur={() => formik.handleBlur("otp_code")}
                        ref={inputRefs[index]}
                        keyboardType="numeric"
                        maxLength={1}
                        onKeyPress={(e) => {
                            if (e.nativeEvent.key === "Backspace") {
                                handleBackspace(index);
                            }
                        }}
                        textAlign="center"
                    />
                ))}
            </View>
            {formik.touched.otp_code && formik.errors.otp_code && (
                <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                    {formik.errors.otp_code}
                </TextRegular>
            )}
        </View>
    )
}

export default memo(AccountRecoveryCodeForm)

const styles = StyleSheet.create({
    inner: {
        justifyContent: 'space-between',
    },
    fieldContainer: {
        paddingTop: RPH(4),
        flexDirection: 'row',
        gap: RPH(2),
        justifyContent: 'center'
    },
    fieldError: {
        marginLeft: RPW(6),
        marginTop: RPH(2),
        letterSpacing: RLS(RFS(18))
    },
    codeInput: {
        width: RPW(10),
        height: RPH(5),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#eee",
        textAlign: "center",
        fontSize: RFS(18),
        backgroundColor: '#fff'
    },
})