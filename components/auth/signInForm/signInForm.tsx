import { StyleSheet, View, TouchableOpacity } from "react-native";
import { memo, useCallback, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFormik } from "formik";
import * as Yup from "yup";

import InputField from "../../app/common/inputField/InputField";
import TextBold from "../../app/common/textComponent/textBold/textBold";
import TextRegular from "../../app/common/textComponent/textRegular/textRegular";
import AuthHeader from "../authHeader/authHeader";
import Loader from "../../common/loader";

import { RPH, RPW } from "../../../constants/utils/utils";
import Icons from "../../../constants/icons";
import Apis from "../../../constants/apis";
import requestUtils from "../../../constants/utils/requestUtils";

import useReducerDispatch from "../../../hooks/useReducerDispatch";
import { login, setIsLoading, setSsoUrl } from "../../../reducers/auth/authSlice";
import useErrorHandling from "../../../hooks/useErrorHandling";
import useSliceSelector from "../../../hooks/useSliceSelector";

import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import RequestData from "./interfaces/requestData";
import IProfileData from "../../../interfaces/IProfileData";

const SignInForm = () => {
    const route = useRoute();
    const params = route.params as { prefillUsername: string; prefillPassword: string };
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const dispatch = useReducerDispatch();
    const { handleError } = useErrorHandling();
    const messages = useSliceSelector(state => state.language.messages);
    const language = useSliceSelector(state => state.language.language);
    const isLoading = useSliceSelector(state => state.auth.isLoading);

    const validationSchema = Yup.object().shape({
        email_or_username: Yup.string().required(messages.usernameRequired),
        password: Yup.string().required(messages.passwordRequired)
    });

    const handleRememberMe = async (values: RequestData) => {
        const userData: RequestData = {
            email_or_username: values.email_or_username,
            password: values.password
        };

        try {
            await AsyncStorage.setItem("userData", JSON.stringify(userData));
        } catch (error) {
            console.error("Error storing credentials:", error);
        }
    };

    const loadStoredCredentials = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("userData");

            if (storedUserData) {
                const userData: RequestData = JSON.parse(storedUserData);
                formik.setFieldValue("email_or_username", userData.email_or_username);
                formik.setFieldValue("password", userData.password);

                handleSignIn({
                    email_or_username: userData.email_or_username,
                    password: userData.password
                })
            }
        } catch (error) {
            console.error("Error loading stored credentials:", error);
        }
    };

    const handleSignIn = useCallback(async (values: RequestData) => {
      dispatch(setIsLoading(true));
      try {
        const trimmedUsername = values.email_or_username.trim();
    
        // Login prema tvom backendu (koji vraća { token, ssoUrl, ... })
        const { data } = await requestUtils.request<IProfileData, RequestData>(
          Apis.loginApi,
          "POST",
          {
            email_or_username: trimmedUsername,
            password: values.password,
          }
        );
    
        // Tip-safe fallback (jer backend vraća i extra polja)
        const anyData = data as unknown as {
          token?: unknown;
          ssoUrl?: string;
          [k: string]: any;
        };
    
        // 1) Sačuvaj token (ako ga ima)
        if (anyData?.token) {
          await AsyncStorage.setItem("token", JSON.stringify(anyData.token));
        }
    
        // 2) Sačuvaj SSO URL (ako ga backend šalje)
        if (anyData?.ssoUrl) {
          await AsyncStorage.setItem("ssoUrl", anyData.ssoUrl);
          dispatch(setSsoUrl(anyData.ssoUrl));
        } else {
          // (Opcionalno) Ako ga nema, očisti staru vrijednost
          await AsyncStorage.removeItem("ssoUrl");
          dispatch(setSsoUrl(undefined));
        }
    
        // 3) Remember me (tvoja postojeća logika)
        await handleRememberMe({ ...values, email_or_username: trimmedUsername });
    
        // 4) Uključi authenticated state
        dispatch(login());
      } catch (error) {
        // UI/validacija poruke
        handleError(error);
        formik.setErrors({
          email_or_username: formik.errors.email_or_username,
          password: formik.errors.password,
        });
      } finally {
        // Uvijek ugasi loader
        dispatch(setIsLoading(false));
      }
    }, [dispatch, handleRememberMe, handleError]);


    const formik = useFormik({
        initialValues: {
            email_or_username: "",
            password: "",
            selectedLanguage: language
        },
        validationSchema,
        onSubmit: () => {
            console.log(formik.values);
            handleSignIn({
                email_or_username: formik.values.email_or_username,
                password: formik.values.password
            })
        }
    });

    useEffect(() => {
        if (params != undefined && params.prefillUsername && params.prefillPassword) {
            handleSignIn({ email_or_username: params.prefillUsername, password: params.prefillPassword });
            // handleRememberMe(params.prefillUsername, params.prefillPassword);
        }
    }, [params]);

    useEffect(() => {
        loadStoredCredentials();
    }, []);

    const navigateToSignUp = () => {
        navigation.navigate("SignUp");
    }

    const navigateToAccountRecovery = () => {
        navigation.navigate("AccountRecovery");
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <View style={styles.inner}>
            <AuthHeader showBackIcon={false} />
            <TextBold fontSize={23}>
                {messages.signInHeading}
            </TextBold>
            <View style={styles.fieldContainer}>
                <InputField
                    placeholder={messages.userNameOrEmail}
                    type="text"
                    onChangeText={formik.handleChange("email_or_username")}
                    value={formik.values.email_or_username}
                />
                {formik.touched.email_or_username && formik.errors.email_or_username &&
                    <TextRegular fontSize={12} color="red">
                        {formik.errors.email_or_username}
                    </TextRegular>
                }
                <InputField
                    placeholder={messages.password}
                    rightIcon={Icons.eyeIcon}
                    secureTextEntry={true}
                    type="password"
                    onChangeText={formik.handleChange("password")}
                    value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password &&
                    <TextRegular fontSize={12} color="red">
                        {formik.errors.password}
                    </TextRegular>
                }
            </View>
            <TouchableOpacity
                style={styles.nextButton}
                onPress={() => formik.handleSubmit()}
            >
                <TextRegular fontSize={18} color="#fff">{messages.login}</TextRegular>
            </TouchableOpacity>
            <View style={styles.buttonSpacing}>
                <TouchableOpacity onPress={navigateToAccountRecovery}>
                    <TextBold fontSize={14} color="#363636">
                        {messages.forgotPass}
                    </TextBold>
                </TouchableOpacity>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity onPress={navigateToSignUp} style={styles.newAcc}>
                    <TextBold fontSize={13} color="#308AFF">
                        {messages.createAcc}
                    </TextBold>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default memo(SignInForm)

const styles = StyleSheet.create({
    inner: {
        justifyContent: "space-between"
    },
    footer: {
        alignSelf: "center",
        justifyContent: "flex-end",
        width: "100%",
        marginTop: 50
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
    checkbox: {
        marginRight: RPW(2)
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: RPH(4)
    },
    buttonSpacing: {
        marginBottom: RPH(2),
        marginTop: 12,
        alignItems: "center"
    },
    nextButton: {
        backgroundColor: "#308AFF",
        borderRadius: 34,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 33,
        width: "100%",
        paddingVertical: 11
    },
    newAcc: {
        backgroundColor: "transparent",
        borderRadius: 34,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#308AFF",
        paddingVertical: 11,
    }
})
