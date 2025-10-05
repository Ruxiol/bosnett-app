import { StyleSheet, View, TouchableOpacity } from "react-native";
import { memo, useCallback, useState } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";
import Checkbox from "expo-checkbox";

import TextBold from "../../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../../app/common/textComponent/textRegular/textRegular";

import { RPH, RPW } from "../../../../constants/utils/utils";

import useSliceSelector from "../../../../hooks/useSliceSelector";

import SignUpDobProps from "./interfaces/signUpDobProps";

const SignUpDob = (props: SignUpDobProps) => {
    const { formik } = props
    const [isChecked, setChecked] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const messages = useSliceSelector(state => state.language.messages);

    const handleDateChange = useCallback((selectedDate: Date) => {
        if (selectedDate) {
            formik.setFieldValue('dayOfBirth', selectedDate)
            setShowDatePicker(false);
        }
    }, [formik.setFieldValue])

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    return (
        <View style={styles.inner}>
            <View>
                <TextBold fontSize={23}>
                    {messages.yourBirthday}
                </TextBold>
            </View>
            <View style={styles.fieldContainer}>
                <View style={styles.dobContainer}>
                    <TextBold fontSize={14}>
                        {messages.birthday}
                    </TextBold>
                    <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
                        <TextBold fontSize={14}>
                            {moment(formik.values.dayOfBirth).format('YYYY/MM/DD')}
                        </TextBold>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={formik.values.dayOfBirth}
                            mode="date"
                            display="spinner"
                            onChange={(_, date) => {
                                if (date) {
                                    formik.setFieldValue('dayOfBirth', date)
                                    handleDateChange(date);
                                }
                            }}
                        />
                    )}
                </View>
                <View>
                    {
                        formik.touched.dayOfBirth && formik.errors.dayOfBirth &&
                        <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                            {formik.errors.dayOfBirth as string}
                        </TextRegular>
                    }
                </View>
                <View style={styles.termsContainer}>
                    <Checkbox
                        style={styles.checkbox}
                        value={isChecked}
                        onValueChange={(newValue) => {
                            formik.handleChange('agreeToTerms')(newValue.toString());
                            setChecked(newValue);
                        }}
                        color={isChecked ? '#000' : undefined}
                    />
                    <TextRegular fontSize={12} color="#4F555E" style={styles.agreeText}>
                        {messages.agree}
                    </TextRegular>
                </View>
                <View>
                    {
                        formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                            <TextRegular fontSize={12} color="red" style={styles.fieldError}>
                                {formik.errors.agreeToTerms}
                            </TextRegular>
                        )
                    }
                </View>
            </View>
        </View>
    )
}

export default memo(SignUpDob)

const styles = StyleSheet.create({
    agreeText: {
        alignSelf: "center",
        flex: 1
    },
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
    },
    nextButton: {
        backgroundColor: "#308AFF",
        borderRadius: 34,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 33,
        width: '100%',
        paddingVertical: 11
    },
    checkbox: {
        marginRight: RPW(1),
        alignSelf: "center"
    },
    dobContainer: {
        flexDirection: "row",
        gap: RPW(5),
        alignItems: "center",
        paddingLeft: RPW(4)
    },
    termsContainer: {
        flexDirection: "row",
        gap: RPW(1.4)
    },
    datePickerButton: {
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: RPH(.6),
        paddingHorizontal: RPW(2),
        borderColor: "#6C6363"
    }
})
