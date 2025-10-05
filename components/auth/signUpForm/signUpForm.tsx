import { StyleSheet, View, TouchableOpacity } from "react-native";
import { memo, useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import AuthHeader from "../authHeader/authHeader";
import TextRegular from "../../app/common/textComponent/textRegular/textRegular";
import SignUpDob from "./signUpDob/SignUpDob";
import SignUpEmail from "./signUpEmail/signUpEmail";
import SignUpName from "./signUpName/signUpName";
import SignUpPassword from "./signUpPassword/signUpPassword";
import SignUpProfilePicture from "./signUpProfilePicture/signUpProfilePicture";
import Loader from "../../common/loader";

import { RPH, RPW } from "../../../constants/utils/utils";
import Apis from "../../../constants/apis";
import requestUtils from "../../../constants/utils/requestUtils";

import useReducerDispatch from "../../../hooks/useReducerDispatch";
import { setIsLoading } from "../../../reducers/auth/authSlice";
import useErrorHandling from "../../../hooks/useErrorHandling";
import useSuccessHandling from "../../../hooks/useSuccessHandling";
import useSliceSelector from "../../../hooks/useSliceSelector";

import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import SignUpFormInterface from "./interfaces/signUpFormInterface";
import SignUpResponseInterface from "./interfaces/signUpResponseInterface";
import ImageInterface from "../../common/interfaces/imageInterface";

const SignUpForm = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const dispatch = useReducerDispatch();
    const [currentStep, setCurrentStep] = useState(1);
    const [skipImage, setSkipImage] = useState(false);
    const { handleError } = useErrorHandling();
    const { handleSuccess } = useSuccessHandling();
    const messages = useSliceSelector(state => state.language.messages);
    const isLoading = useSliceSelector(state => state.auth.isLoading);

    const handleSignUp = useCallback(async (values: SignUpFormInterface) => {
        const { firstName, lastName, userName, email, dayOfBirth, image, password, } = values
        try {
            const formattedDate = moment(dayOfBirth).format("YYYY/MM/DD");
            dispatch(setIsLoading(true));

            const formdata = new FormData();
            formdata.append("userName", userName);
            formdata.append("email", email);
            formdata.append("firstName", firstName);
            formdata.append("lastName", lastName);
            formdata.append("dayOfBirth", formattedDate);
            formdata.append("password", password);
            if (image && image.uri) {
                // @ts-ignore: Unreachable code error
                formdata.append("image", { uri: image.uri, type: image.type, name: image.filename });
            }

            await requestUtils.request<SignUpResponseInterface, FormData>(
                Apis.signupApi,
                'POST',
                formdata,
                undefined,
                true
            );

            dispatch(setIsLoading(false))
            handleSuccess(messages.userCreated)
            navigation.navigate('SignIn', {
                prefillUsername: values.userName,
                prefillPassword: values.password
            });

        } catch (error) {
            dispatch(setIsLoading(false))
            handleError(error)
        }
    }, [setIsLoading, handleSuccess, handleError, dispatch, navigation]);

    const goBackToPreviousStep = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const navigateNext = () => {
        switch (currentStep) {
            case 1:
                emailFormik.handleSubmit();
                break;
            case 2:
                passwordFormik.handleSubmit();
                break;
            case 3:
                nameFormik.handleSubmit();
                break;
            case 4:
                dobFormik.handleSubmit();
                break;
            case 5:
                profilePictureFormik.handleSubmit();
                break;
        }
    };

    const skipProfilePicture = () => {
        setSkipImage(true);
        profilePictureFormik.setFieldValue('image', {
            uri: '',
            type: '',
            filename: ''
        });
        profilePictureFormik.submitForm();
    }

    const emailFormik = useFormik({
        initialValues: {
            email: '',
            confirmEmail: '',
        },
        validationSchema: Yup.object().shape({
            email: Yup.string().email(messages.invalidEmail).required(messages.emailRequired),
            confirmEmail: Yup.string().required(messages.emailRequired)
                .oneOf([Yup.ref('email'), ""], messages.emailsMatch),
        }),
        onSubmit: () => {
            setCurrentStep(prevState => prevState + 1)
            passwordFormik.setErrors({})
            passwordFormik.setTouched({})
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
        onSubmit: () => {
            setCurrentStep(prevState => prevState + 1)
            nameFormik.setErrors({});
            nameFormik.setTouched({});
        },
    });

    const nameFormik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            userName: "",
        },
        validationSchema: Yup.object().shape({
            firstName: Yup.string().required(messages.firstnameRequired),
            lastName: Yup.string().required(messages.lastnameRequired),
            userName: Yup.string().required(messages.usernameRequired),
        }),
        onSubmit: () => {
            setCurrentStep(prevState => prevState + 1)
            dobFormik.setErrors({});
            dobFormik.setTouched({});
        },
    });

    const dobFormik = useFormik({
        initialValues: {
            dayOfBirth: new Date(),
            agreeToTerms: false
        },
        validationSchema: Yup.object().shape({
            dayOfBirth: Yup.string()
                .required(messages.birthdayRequired)
                .test('is-adult', messages.ageRestriction, function (value) {
                    const minAge = 18;
                    const today = new Date();
                    const birthDate = new Date(value);

                    // Calculate age
                    const age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    // Check if birthday has occurred this year or not
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        return age - 1 >= minAge;
                    }

                    return age >= minAge;
                }),
            agreeToTerms: Yup.boolean().oneOf([true], messages.agreeToTerms).required(messages.agreeToTerms),
        }),
        onSubmit: () => {
            setCurrentStep(prevState => prevState + 1)
        },
    });

    const initialValues: ImageInterface = {
        uri: '',
        type: '',
        filename: ''
    }

    const profilePictureFormik = useFormik({
        initialValues: {
            image: initialValues,
        },
        validationSchema: () => {
            if (skipImage) {
                return Yup.object();
            } else {
                return Yup.object().shape({
                    image: Yup.object().required(messages.profilePictureRequired)
                });
            }
        },
        onSubmit: () => {
            const allValues = {
                ...emailFormik.values,
                ...passwordFormik.values,
                ...nameFormik.values,
                ...dobFormik.values,
                ...profilePictureFormik.values,
            };
            handleSignUp(allValues);
        },
    });

    const formJSX = () => {
        switch (currentStep) {
            case 1:
                return <SignUpEmail formik={emailFormik} />;
            case 2:
                return <SignUpPassword formik={passwordFormik} />;
            case 3:
                return <SignUpName formik={nameFormik} />;
            case 4:
                return <SignUpDob formik={dobFormik} />;
            case 5:
                return <SignUpProfilePicture formik={profilePictureFormik} />;
        }
    }

    const buttonText = currentStep === 5 ? messages.continue : messages.next;

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <View style={styles.inner}>
            <AuthHeader currentStep={currentStep} goBackToPreviousStep={goBackToPreviousStep} showBackIcon={true} />
            {formJSX()}
            <TouchableOpacity style={styles.nextButton} onPress={navigateNext}>
                <TextRegular fontSize={18} color='#fff'>
                    {buttonText}
                </TextRegular>
            </TouchableOpacity>
            {currentStep === 5 && (
                <TouchableOpacity style={styles.nextButton} onPress={skipProfilePicture}>
                    <TextRegular fontSize={18} color='#fff'>{messages.skip}</TextRegular>
                </TouchableOpacity>
            )}
            {currentStep === 5 && profilePictureFormik.errors.image && (
                <TextRegular fontSize={13} color="red" style={styles.fieldError}>
                    {profilePictureFormik.errors.image as string}
                </TextRegular>
            )}
        </View>
    )
}

export default memo(SignUpForm)

const styles = StyleSheet.create({
    fieldConainer: {
        paddingTop: RPH(4),
        gap: RPH(3)
    },
    inner: {
        justifyContent: 'space-between'
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
    signInButton: {
        alignSelf: "flex-end"
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
    datePickerButton: {
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: RPH(.6),
        paddingHorizontal: RPW(2),
        borderColor: "#6C6363"
    },
    agreeText: {
        alignSelf: "center",
        flex: 1
    },
    fieldError: {
        marginLeft: RPW(2),
        marginTop: RPH(1)
    }
})