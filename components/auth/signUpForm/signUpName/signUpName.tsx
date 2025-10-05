import { StyleSheet, View } from "react-native";
import { memo } from "react";

import InputField from "../../../app/common/inputField/InputField";
import TextBold from "../../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../../app/common/textComponent/textRegular/textRegular";

import { RPH, RPW } from "../../../../constants/utils/utils";

import useSliceSelector from "../../../../hooks/useSliceSelector";

import SignUpNameProps from "./interfaces/signUpNameProps";

const SignUpName = (props: SignUpNameProps) => {
    const { formik } = props;
    const messages = useSliceSelector(state => state.language.messages);

    return (
        <View style={styles.inner}>
            <View>
                <TextBold fontSize={23}>
                    {messages.yourName}
                </TextBold>
            </View>
            <View style={styles.fieldContainer}>
                <View>
                    <InputField
                        placeholder={messages.firstName}
                        type="text"
                        onChangeText={formik.handleChange('firstName')}
                        onBlur={formik.handleBlur('firstName')}
                        value={formik.values.firstName}
                    />
                    {
                        formik.touched.firstName && formik.errors.firstName &&
                        <TextRegular fontSize={13} color="red" style={styles.fieldError}>
                            {formik.errors.firstName}
                        </TextRegular>
                    }
                </View>
                <View>
                    <InputField
                        placeholder={messages.lastName}
                        type="text"
                        onChangeText={formik.handleChange('lastName')}
                        onBlur={formik.handleBlur('lastName')}
                        value={formik.values.lastName}
                    />
                    {
                        formik.touched.lastName && formik.errors.lastName &&
                        <TextRegular fontSize={13} color="red" style={styles.fieldError}>
                            {formik.errors.lastName}
                        </TextRegular>
                    }
                </View>
                <View>
                    <InputField
                        placeholder={messages.username}
                        type="text"
                        onChangeText={formik.handleChange('userName')}
                        onBlur={formik.handleBlur('userName')}
                        value={formik.values.userName}
                    />
                    {
                        formik.touched.userName && formik.errors.userName &&
                        <TextRegular fontSize={13} color="red" style={styles.fieldError}>
                            {formik.errors.userName}
                        </TextRegular>
                    }
                </View>
            </View>
        </View>
    )
}

export default memo(SignUpName)

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
