import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { memo, useState } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';

import TextBold from "../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../app/common/textComponent/textRegular/textRegular";
import AccountRecoveryEmailForm from "./accountRecoveryEmailForm/accountRecoveryEmailForm";
import AccountRecoveryCodeForm from "./accountRecoveryCodeForm/accountRecoveryCodeForm";
import AuthHeader from "../authHeader/authHeader";
import AccountRecoveryPasswordForm from "./accountRecoveryPasswordForm/accountRecoveryPasswordForm";
import SuccesModal from "../../../modals/succesModal/succesModal";
import Loader from "../../common/loader";

import { RFS, RPH, RPW } from "../../../constants/utils/utils";
import Apis from "../../../constants/apis";
import requestUtils from "../../../constants/utils/requestUtils";

import useReducerDispatch from "../../../hooks/useReducerDispatch";
import { setIsLoading } from "../../../reducers/auth/authSlice";
import { setSuccessModal } from "../../../reducers/app/appSlice";
import useErrorHandling from "../../../hooks/useErrorHandling";
import useSuccessHandling from "../../../hooks/useSuccessHandling";
import useSliceSelector from "../../../hooks/useSliceSelector";

import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import AccountRecoveryFormValuesInterface from "./interfaces/accountRecoveryFormValuesInterface";
import IErrorResponse from "../../../interfaces/IErrorResponse";

interface AccountRecoveryResponse extends IErrorResponse { }

const AccountRecoveryForm = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const [currentStep, setCurrentStep] = useState(1);
    const dispatch = useReducerDispatch();
    const { handleError } = useErrorHandling();
    const { handleSuccess } = useSuccessHandling();
    const messages = useSliceSelector(state => state.language.messages);
    const isLoading = useSliceSelector(state => state.auth.isLoading);

    const navigateToSignIn = () => {
        navigation.navigate("SignIn",
            {
                prefillUsername: emailFormik.values.email,
                prefillPassword: passwordFormik.values.password
            })
    }

    const showSuccessModal = () => {
        dispatch(setSuccessModal(true))
        setTimeout(() => {
            dispatch(setSuccessModal(false))
            navigateToSignIn();
        }, 2000);
    };

    const sendRecoveryEmail = async (email: string) => {
        try {
            dispatch(setIsLoading(true))

            await requestUtils.request<AccountRecoveryResponse, { email: string }>(
                Apis.accountRecoveryEmail,
                'POST',
                {
                    email: email
                }
            );

            dispatch(setIsLoading(false))
            handleSuccess(messages.emailSent)
            setCurrentStep(prevState => prevState + 1)

        } catch (error) {
            handleError(error)
            dispatch(setIsLoading(false))
        }
    };

    const CheckVerificationCode = async (email: string, code: string) => {
        try {
            dispatch(setIsLoading(true))

            await requestUtils.request<AccountRecoveryResponse, { email: string, otp_code: string }>(
                Apis.accountVerificationCode,
                'POST',
                {
                    email: email,
                    otp_code: code
                }
            );

            dispatch(setIsLoading(false))
            handleSuccess(messages.codeVerified)
            setCurrentStep(prevState => prevState + 1)

        } catch (error) {
            handleError(error)
            dispatch(setIsLoading(false))
        }
    };

    const handleRecoverForm = async (values: AccountRecoveryFormValuesInterface) => {
        try {
            await requestUtils.request<AccountRecoveryResponse, AccountRecoveryFormValuesInterface>(
                Apis.accountChangePassword,
                'POST',
                {
                    email: values.email,
                    otp_code: values.otp_code,
                    password: values.password
                }
            );

            dispatch(setIsLoading(false))
            showSuccessModal();

        } catch (error) {
            handleError(error)
            dispatch(setIsLoading(false))
        }
    };

    const emailFormik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email(messages.invalidEmail).required(messages.emailRequired),
        }),
        onSubmit: (values) => {
            sendRecoveryEmail(values.email)
        },
    });

    const verificationCodeFormik = useFormik({
        initialValues: {
            otp_code: "",
        },
        validationSchema: Yup.object({
            otp_code: Yup.string()
                .required(messages.codeRequired)
                .matches(
                    /^\d{5}$/,
                    messages.codeDigits
                ),
        }),
        onSubmit: (values) => {
            CheckVerificationCode(emailFormik.values.email, values.otp_code)
        },
    });

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const passwordFormik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            password: Yup.string()
                .required(messages.passwordRequired)
                .matches(
                    passwordRegex,
                    messages.passwordInclude
                ),
            confirmPassword: Yup.string()
                .required(messages.confirmPassword)
                .oneOf([Yup.ref("password")], messages.passwordsMatch),
        }),
        onSubmit: (values) => {
            const allValues = {
                ...emailFormik.values,
                ...verificationCodeFormik.values,
                ...values
            }
            handleRecoverForm(allValues);
        },
    });

    const goBackToPreviousStep = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const navigateNext = () => {
        switch (currentStep) {
            case 1:
                emailFormik.handleSubmit();
                break;
            case 2:
                verificationCodeFormik.handleSubmit();
                break;
            case 3:
                passwordFormik.handleSubmit();
        }
    };

    const formJSX = () => {
        switch (currentStep) {
            case 1:
                return <AccountRecoveryEmailForm formik={emailFormik} />;
            case 2:
                return <AccountRecoveryCodeForm formik={verificationCodeFormik} />;
            case 3:
                return <AccountRecoveryPasswordForm formik={passwordFormik} />
        }
    }

    const buttonText = currentStep === 1 ? messages.requestLink : messages.continue;

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <View style={styles.inner}>
            <AuthHeader currentStep={currentStep} goBackToPreviousStep={goBackToPreviousStep} showBackIcon={true} />
            {formJSX()}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={navigateNext}>
                    <TextRegular fontSize={18} color='#fff'>
                        {buttonText}
                    </TextRegular>
                </TouchableOpacity>
                {/* {currentStep === 1 && (
                    <TouchableOpacity style={styles.nextButton} onPress={navigateToSignIn}>
                        <TextRegular fontSize={18} color='#fff'>
                            {messages.signInHeading}
                        </TextRegular>
                    </TouchableOpacity>
                )} */}
            </View>
            <View style={styles.bottomContainer}>
                <View style={styles.terms}>
                    <TouchableOpacity>
                        <TextBold fontSize={16} color="#5F6373">
                            {messages.terms}
                        </TextBold>
                    </TouchableOpacity>
                    <TextRegular fontSize={16} color="#5F6373">
                        {messages.and}
                    </TextRegular>
                    <TouchableOpacity>
                        <TextBold fontSize={16} color="#5F6373">
                            {messages.privacyPolicy}
                        </TextBold>
                    </TouchableOpacity>
                </View>
            </View>
            <SuccesModal successText={messages.passwordChanged} />
        </View>
    )
}

export default memo(AccountRecoveryForm)

const styles = StyleSheet.create({
    bottomContainer: {
        marginTop: RPH(10),
        alignItems: "center"
    },
    inner: {
        justifyContent: 'space-between',
    },
    fieldContainer: {
        paddingTop: RPH(4),
    },
    requestButton: {
        backgroundColor: "#385DFF",
        borderRadius: 10,
        color: "#fff",
        paddingVertical: RPH(.9),
        paddingHorizontal: RPW(2.8)
    },
    buttonContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: RPW(2),
        gap: RPH(2),
        marginTop: RPH(4)
    },
    terms: {
        flexDirection: "row",
        marginTop: RPH(6),
        justifyContent: "center",
        alignItems: "center"
    },
    languageDropdown: {
        borderRadius: 10,
        backgroundColor: "#0000009E",
        opacity: .9,
        width: RPW(40),
        height: RPH(5),
        alignSelf: "center",
        justifyContent: "center"
    },
    dropdownText: {
        fontSize: RFS(17),
        fontFamily: "Lato-Regular",
    },
    nextButton: {
        backgroundColor: "#308AFF",
        borderRadius: 34,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        width: '100%',
        paddingVertical: 11
    },
    fieldError: {
        marginLeft: RPW(2),
        marginTop: RPH(.3)
    }
})