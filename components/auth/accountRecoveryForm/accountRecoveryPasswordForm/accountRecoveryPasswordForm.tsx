import { View, StyleSheet } from "react-native";
import { memo } from "react";

import InputField from "../../../app/common/inputField/InputField";
import TextBold from "../../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../../app/common/textComponent/textRegular/textRegular";

import { RPH, RPW } from "../../../../constants/utils/utils";
import Icons from "../../../../constants/icons";

import useSliceSelector from "../../../../hooks/useSliceSelector";

import AccountRecoveryPasswordFormProps from "./interfaces/accountRecoveryPasswordFormProps";

const AccountRecoveryPasswordForm = (props: AccountRecoveryPasswordFormProps) => {
    const { formik } = props;
    const messages = useSliceSelector(state => state.language.messages);

    return (
        <View style={styles.inner}>
            <View>
                <TextBold fontSize={23}>
                    {messages.passwordFormHeading}
                </TextBold>
                <TextRegular fontSize={15}>
                    {messages.passwordFormContent}
                </TextRegular>
            </View>
            <View style={styles.fieldContainer}>
                <InputField
                    type="password"
                    rightIcon={Icons.eyeIcon}
                    secureTextEntry={true}
                    placeholder={messages.password}
                    value={formik.values.password}
                    onChangeText={formik.handleChange("password")}
                    onBlur={formik.handleBlur("password")}
                />
                {formik.touched.password && formik.errors.password && (
                    <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                        {formik.errors.password}
                    </TextRegular>
                )}
                <InputField
                    type="password"
                    rightIcon={Icons.eyeIcon}
                    secureTextEntry={true}
                    placeholder={messages.confirmPassword}
                    value={formik.values.confirmPassword}
                    onChangeText={formik.handleChange("confirmPassword")}
                    onBlur={formik.handleBlur("confirmPassword")}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                        {formik.errors.confirmPassword}
                    </TextRegular>
                )}
            </View>
        </View>
    )
}

export default memo(AccountRecoveryPasswordForm)

const styles = StyleSheet.create({
    inner: {
        justifyContent: 'space-between',
    },
    fieldContainer: {
        paddingTop: RPH(4),
        gap: RPH(2)
    },
    fieldError: {
        marginLeft: RPW(2),
    }
})