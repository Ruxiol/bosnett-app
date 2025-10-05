import { memo, useCallback, useMemo } from "react";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import MainWapper from "../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";
import AppHeader from "../../../components/app/appHeader/appHeader";
import Loader from "../../../components/common/loader";

import Icons from "../../../constants/icons";
import { RPH, RPW } from "../../../constants/utils/utils";

import useReducerDispatch from "../../../hooks/useReducerDispatch";
import useSliceSelector from "../../../hooks/useSliceSelector";
import useErrorHandling from "../../../hooks/useErrorHandling";

import { logout } from "../../../reducers/auth/authSlice";
import { resetActiveTab, setIsLoading } from "../../../reducers/app/appSlice";

import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import menuButtonsInterface from "./interfaces/menuButtonsInterface";

const Menu = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const dispatch = useReducerDispatch();
    const messages = useSliceSelector(state => state.language.messages);
    const isLoading = useSliceSelector(state => state.app.isLoading);
    const { handleError } = useErrorHandling();

    const handleLogout = useCallback(async () => {
        try {
            dispatch(setIsLoading(true));

            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userData');

            dispatch(logout());
            dispatch(resetActiveTab());
            dispatch(setIsLoading(false));

        } catch (error) {
            handleError(error);
            dispatch(setIsLoading(false));
        }
    }, [logout, resetActiveTab, setIsLoading, dispatch, handleError]);

    const menuButtons: menuButtonsInterface[] = useMemo(() => [
        {
            icon: Icons.ebooksIcon,
            text: messages.ebooks
        },
        {
            icon: Icons.accSettingsIcon,
            text: messages.accSettings
        },
        {
            icon: Icons.profileIcon,
            text: messages.profile,
            screenName: 'UserProfile'
        },
        {
            icon: Icons.membersIcon,
            text: messages.members
        },
        {
            icon: Icons.donateIcon,
            text: messages.donate
        }
    ], []);

    if (isLoading) {
        return (
            <Loader />
        )
    };

    return (
        <MainWapper>
            <View style={styles.container}>
                <AppHeader headerText={messages.menu} icon={true} />
                <View style={styles.contentContainer}>
                    <View style={styles.buttonsContainer}>
                        {menuButtons.map((item, index) => {
                            return (
                                <View style={styles.rowContainer} key={index}>
                                    <View style={styles.btnContainer}>
                                        <TouchableOpacity
                                            style={styles.btnInner}
                                            onPress={() =>
                                                item.screenName && navigation.navigate(item.screenName as string)
                                            }
                                        >
                                            {item.icon}
                                            <TextBold fontSize={19} style={styles.btnText}>
                                                {item.text}
                                            </TextBold>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    <TouchableOpacity style={styles.logout} onPress={handleLogout}>
                        {Icons.logoutIcon}
                        <TextBold fontSize={19} style={styles.logoutText}>
                            {messages.logout}
                        </TextBold>
                    </TouchableOpacity>
                </View>
            </View>
        </MainWapper>
    )
}

export default memo(Menu);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: RPH(1.6),
        flexDirection: "column",
        backgroundColor: "#fff"
    },
    contentContainer: {
        paddingHorizontal: RPW(2),
        paddingBottom: RPH(4.9),
        height: "95%",
        justifyContent: "space-between"
    },
    textSpacing: {
        paddingLeft: RPW(5.5)
    },
    btnText: {
        paddingTop: RPH(.2)
    },
    buttonsContainer: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E7E7E7",
        backgroundColor: "#fff",
        marginHorizontal: RPW(2),
        flexDirection: "column",
        paddingHorizontal: RPW(2.7),
        paddingBottom: 20,
        justifyContent: "space-between",
    },
    rowContainer: {
        flexDirection: 'column',
    },
    btnContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        borderColor: "rgba(247, 246, 245, 0.16)",
        paddingHorizontal: RPW(2.1),
        paddingVertical: RPH(2),
        marginTop: RPH(1.9),
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.15)',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    logout: {
        flexDirection: "row",
        gap: RPW(2.8),
        borderWidth: 0.5,
        borderColor: 'rgba(247, 246, 245, 0.16)',
        backgroundColor: '#E7E7E7',
        marginHorizontal: RPW(3),
        paddingVertical: RPH(1.1),
        justifyContent: "center",
        borderRadius: 10,
        marginTop: RPH(2.5),
        marginBottom: 10
    },
    logoutText: {
        alignSelf: "center"
    },
    btnInner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    }
})