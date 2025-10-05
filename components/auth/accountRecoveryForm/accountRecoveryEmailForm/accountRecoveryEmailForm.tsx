import { View, StyleSheet } from "react-native";
import { memo } from "react";

import InputField from "../../../app/common/inputField/InputField";
import TextBold from "../../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../../app/common/textComponent/textRegular/textRegular";

import { RPH, RPW } from "../../../../constants/utils/utils";

import useSliceSelector from "../../../../hooks/useSliceSelector";

import AccountRecoveryEmailFormProps from "./interfaces/accountRecoveryEmailFormProps";

const AccountRecoveryEmailForm = (props: AccountRecoveryEmailFormProps) => {
    const { formik } = props;
    const messages = useSliceSelector(state => state.language.messages);

    return (
        <View style={styles.inner}>
            <View>
                <TextBold fontSize={23}>
                    {messages.accountRecoveryHeading}
                </TextBold>
                <TextRegular fontSize={15}>
                    {messages.accountRecoverySubHeading}
                </TextRegular>
            </View>
            <View style={styles.fieldContainer}>
                <InputField
                    type="email"
                    placeholder={messages.email}
                    value={formik.values.email}
                    onChangeText={formik.handleChange("email")}
                    onBlur={formik.handleBlur("email")}
                />
                {formik.touched.email && formik.errors.email && (
                    <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                        {formik.errors.email}
                    </TextRegular>
                )}
            </View>
        </View>
    )
}

export default memo(AccountRecoveryEmailForm)

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
        marginTop: RPH(.3)
    }
})