import { StyleSheet, View } from "react-native";
import { memo } from "react";

import InputField from "../../../app/common/inputField/InputField";
import TextBold from "../../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../../app/common/textComponent/textRegular/textRegular";

import { RPH, RPW } from "../../../../constants/utils/utils";

import Icons from "../../../../constants/icons";

import useSliceSelector from "../../../../hooks/useSliceSelector";

import SignUpPasswordProps from "./interfaces/signUpPasswordProps";

const SignUpPassword = (props: SignUpPasswordProps) => {
    const { formik } = props
    const messages = useSliceSelector(state => state.language.messages);

    return (
        <View style={styles.inner}>
            <View>
                <TextBold fontSize={23}>
                    {messages.createPassword}
                </TextBold>
            </View>
            <View style={styles.fieldContainer}>
                <View>
                    <InputField
                        placeholder={messages.password}
                        rightIcon={Icons.eyeIcon}
                        secureTextEntry={true}
                        type="password"
                        onChangeText={formik.handleChange('password')}
                        onBlur={formik.handleBlur('password')}
                        value={formik.values.password}
                    />
                    {
                        formik.touched.password && formik.errors.password &&
                        <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                            {formik.errors.password}
                        </TextRegular>
                    }
                </View>
                <View>
                    <InputField
                        placeholder={messages.confirmPassword}
                        rightIcon={Icons.eyeIcon}
                        secureTextEntry={true}
                        type="password"
                        onChangeText={formik.handleChange('confirmPassword')}
                        onBlur={formik.handleBlur('confirmPassword')}
                        value={formik.values.confirmPassword}
                    />
                    {
                        formik.touched.confirmPassword && formik.errors.confirmPassword &&
                        <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                            {formik.errors.confirmPassword}
                        </TextRegular>
                    }
                </View>
            </View>
        </View>
    )
}

export default memo(SignUpPassword)

const styles = StyleSheet.create({
    inner: {
        justifyContent: 'space-between'
    },
    fieldError: {
        marginLeft: RPW(2),
        marginTop: RPH(.3)
    },
    fieldContainer: {
        paddingTop: RPH(4),
        gap: RPH(2)
    },
    leftIcon: {
        width: 19,
        height: 17,
        alignSelf: "center"
    },
    rightIcon: {
        width: 22,
        height: 12,
        alignSelf: "center"
    }
})
