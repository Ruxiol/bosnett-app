import { memo, useMemo } from "react"
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Path, Circle } from "react-native-svg"

import TextBold from "../common/textComponent/textBold/textBold"
import TextRegular from "../common/textComponent/textRegular/textRegular"
import IconContainer from "../common/iconContainer/iconContainer"

import { RPW, RPH } from "../../../constants/utils/utils"

import useReducerDispatch from "../../../hooks/useReducerDispatch"
import useSliceSelector from "../../../hooks/useSliceSelector"
import { setActiveTab } from "../../../reducers/app/appSlice"

import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface"
import FooterButtonsInterface from "./footerButtonsInterface/FooterButtonsInterface"

interface IconProps {
    isActive: boolean;
}

const NewsFeedIcon = ({ isActive }: IconProps) => (
    <IconContainer width="30" height="30" viewBox="0 0 30 30" fill="none">
        <Path
            d="M28.9688 13.125L26.25 10.4081V3.75C26.25 2.71875 25.4062 1.875 24.375 1.875H22.5C21.4688 1.875 20.625 2.71875 20.625 3.75V4.78687L16.875 1.04062C16.3631 0.556875 15.8944 0 15 0C14.1056 0 13.6369 0.556875 13.125 1.04062L1.03125 13.125C0.44625 13.7344 0 14.1788 0 15C0 16.0556 0.81 16.875 1.875 16.875H3.75V28.125C3.75 29.1562 4.59375 30 5.625 30H11.25V20.625C11.25 19.5938 12.0938 18.75 13.125 18.75H16.875C17.9062 18.75 18.75 19.5938 18.75 20.625V30H24.375C25.4062 30 26.25 29.1562 26.25 28.125V16.875H28.125C29.19 16.875 30 16.0556 30 15C30 14.1788 29.5537 13.7344 28.9688 13.125Z"
            fill={isActive ? '#308AFF' : '#615F5F'}
        />
    </IconContainer>
);

const FriendsIcon = ({ isActive }: IconProps) => (
    <IconContainer width="33" height="31" viewBox="0 0 33 31" fill="none">
        <Path
            d="M26.2976 17.2283C30.1325 17.2283 32.8145 20.4075 32.8145 24.3176C32.8145 26.2843 31.2219 27.8824 29.2662 27.8824H28.1418C27.6495 27.8824 27.2798 27.4605 27.3389 26.9832C27.3673 26.7339 27.3826 26.4803 27.3826 26.2225V25.1635C27.3826 22.7003 26.617 20.4054 25.3044 18.4877C24.9369 17.9486 25.3044 17.2283 25.9651 17.2283H26.2976ZM24.6109 15.0975C22.1979 15.0975 20.2356 12.9475 20.2356 10.3032C20.2356 7.3925 21.9529 5.50886 24.6109 5.50886C27.2689 5.50886 28.9862 7.3925 28.9862 10.3032C28.9862 12.9475 27.0239 15.0975 24.6109 15.0975ZM14.5959 16.1629C19.8156 16.1629 24.064 20.2008 24.064 25.1635V26.2225C24.064 28.3128 22.2767 30.0132 20.0759 30.0132H3.98806C1.7873 30.0132 0 28.3128 0 26.2225V25.1635C0 20.2008 4.2462 16.1629 9.46809 16.1629H14.5959ZM18.048 6.57427C18.048 10.1008 15.3506 12.9667 12.032 12.9667C8.71554 12.9667 6.016 10.1008 6.016 6.57427C6.016 2.63226 8.32177 0.181824 12.032 0.181824C15.7444 0.181824 18.048 2.63226 18.048 6.57427Z"
            fill={isActive ? '#308AFF' : '#615F5F'}
        />
    </IconContainer>
);

const GroupIcon = ({ isActive }: IconProps) => (
    <IconContainer width="40" height="31" viewBox="0 0 40 31" fill="none">
        <Path d="M17.4424 24.0046C17.4424 10.7029 36.6064 23.6877 23.3047 23.6877C10.003 23.6877 28.4493 10.735 28.4493 24.0368C28.4493 37.3385 4.14068 24.0046 17.4424 24.0046C30.7441 24.0046 17.4424 37.3063 17.4424 24.0046ZM27.2276 23.6877C27.2276 21.4187 20.6766 31.1221 21.9915 29.9187C6.9535 29.9187 23.2935 27.2259 21.4679 29.0983C21.4679 14.0603 -0.349071 39.0468 16.7554 17.5789C31.7934 17.5789 27.6815 24.0706 27.2276 23.6877ZM6.2393 17.5789H6.55765C7.19017 17.5789 7.54413 18.2869 7.19226 18.8167C5.93561 20.7017 5.20046 22.9574 5.20046 25.3786V26.4195C5.20046 26.6729 5.21512 26.9222 5.24445 27.1672C5.2989 27.6364 4.94704 28.0511 4.47579 28.0511H3.39926C1.52474 28.0511 0 26.4803 0 24.5471C0 20.7038 2.56986 17.5789 6.2393 17.5789ZM33.5548 17.5789C37.2264 17.5789 39.7941 20.7038 39.7941 24.5471C39.7941 26.4803 38.2694 28.0511 36.397 28.0511H35.3204C34.8492 28.0511 34.4952 27.6364 34.5518 27.1672C34.579 26.9222 34.5937 26.6729 34.5937 26.4195V25.3786C34.5937 22.9574 33.8606 20.7017 32.604 18.8167C32.2521 18.2869 32.6039 17.5789 33.2365 17.5789H33.5548ZM7.8541 15.4845C5.54395 15.4845 3.66525 13.3712 3.66525 10.772C3.66525 7.91106 5.30937 6.05959 7.8541 6.05959C10.3988 6.05959 12.043 7.91106 12.043 10.772C12.043 13.3712 10.1643 15.4845 7.8541 15.4845ZM31.94 15.4845C29.6299 15.4845 27.7512 13.3712 27.7512 10.772C27.7512 7.91106 29.3953 6.05959 31.94 6.05959C34.4847 6.05959 36.1289 7.91106 36.1289 10.772C36.1289 13.3712 34.2502 15.4845 31.94 15.4845ZM22.3517 16.5317C27.349 16.5317 31.4164 20.5007 31.4164 25.3786V26.4195C31.4164 28.4742 29.7053 30.1455 27.5983 30.1455H12.1959C10.0889 30.1455 8.37771 28.4742 8.37771 26.4195V25.3786C8.37771 20.5007 12.443 16.5317 17.4424 16.5317H22.3517ZM25.6567 7.1068C25.6567 10.5731 23.0743 13.3901 19.8971 13.3901C16.7219 13.3901 14.1374 10.5731 14.1374 7.1068C14.1374 3.23211 16.3449 0.823517 19.8971 0.823517C23.4513 0.823517 25.6567 3.23211 25.6567 7.1068Z"
            fill={isActive ? '#308AFF' : '#615F5F'}
        />
    </IconContainer>
);

const NotificationIcon = ({ isActive }: IconProps) => (
    <IconContainer width="30" height="31" viewBox="0 0 30 31" fill="none">
        <Path
            d="M7.31492 27.7813C9.08371 27.7813 11.9918 27.6188 15.9248 26.8943C15.2446 28.7438 13.4719 30.069 11.3896 30.069C9.65857 30.069 8.14209 29.1521 7.28631 27.7813H7.31492ZM29.5237 17.6914C29.8449 19.3458 28.6848 20.8089 26.0732 22.0432C24.6426 22.7182 21.4613 24.0031 16.207 25.0254C12.1544 25.8122 9.18516 25.993 7.31622 25.993C6.76087 25.993 6.30177 25.9774 5.94021 25.9566C3.05812 25.7914 1.43239 24.868 1.11115 23.2137C0.623428 20.7075 1.39467 19.7398 2.67314 18.1375L3.01 17.7148C3.87228 16.621 4.20913 15.5468 3.65768 12.7128C2.42343 6.36595 5.28211 2.02851 11.4989 0.813765C17.7183 -0.386672 21.9946 2.56045 23.2288 8.90858C23.779 11.7426 24.4943 12.6113 25.7038 13.3019V13.3032L26.1747 13.5699C27.9591 14.5765 29.0359 15.1839 29.5237 17.6914Z"
            fill={isActive ? '#308AFF' : '#615F5F'}
        />
    </IconContainer>
);

const UserPlaceholderIcon = ({ isActive }: IconProps) => (
    <IconContainer width="34" height="34" viewBox="0 0 45 45" fill="none">
        <Circle cx="20" cy="20" r="20" fill={isActive ? '#308AFF' : '#615F5F'} />
        <Path
            d="M20.5 6C17.0469 6 14.25 8.79688 14.25 12.25C14.25 15.6953 17.0469 18.5 20.5 18.5C23.9531 18.5 26.75 15.6953 26.75 12.25C26.75 8.79688 23.9531 6 20.5 6ZM20.5 21.625C16.3359 21.625 8 23.7109 8 27.875V31H33V27.875C33 23.7109 24.6641 21.625 20.5 21.625Z"
            fill="white"
        />
    </IconContainer>
);

const Footer = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const dispatch = useReducerDispatch();
    const activeTab = useSliceSelector(state => state.app.footerActiveButton.activeTab);
    const messages = useSliceSelector(state => state.language.messages);

    const handlePress = (screenName: string) => {
        dispatch(setActiveTab(screenName));
        navigation.navigate(screenName);
    };

    const footerButtons: FooterButtonsInterface[] = [
        {
            icon: <NewsFeedIcon isActive={false} />,
            activeIcon: <NewsFeedIcon isActive={true} />,
            text: messages.newsfeed,
            screenName: "Home"
        },
        {
            icon: <FriendsIcon isActive={false} />,
            activeIcon: <FriendsIcon isActive={true} />,
            text: messages.myFriends,
            screenName: "Friends"
        },
        {
            icon: <GroupIcon isActive={false} />,
            activeIcon: <GroupIcon isActive={true} />,
            text: messages.myGroups,
            screenName: "Groups"
        },
        {
            icon: <NotificationIcon isActive={false} />,
            activeIcon: <NotificationIcon isActive={true} />,
            text: messages.notifications,
            screenName: "Notifications"
        },
        {
            icon: <UserPlaceholderIcon isActive={false} />,
            activeIcon: <UserPlaceholderIcon isActive={true} />,
            screenName: "Menu"
        }
    ]

    const footerJSX = useMemo(() => (
        footerButtons.map((item, index) => {
            return (
                <TouchableOpacity
                    key={index}
                    style={styles.buttonContainer}
                    onPress={() => handlePress(item.screenName)}
                >
                    {index === 3 &&
                        <View style={styles.notificationActive}>
                            <TextBold fontSize={10} color="#fff">
                                99
                            </TextBold>
                        </View>
                    }
                    {activeTab === item.screenName ? item.activeIcon : item.icon}
                    <TextRegular fontSize={10} color="#888">
                        {item.text as string}
                    </TextRegular>
                </TouchableOpacity>
            )
        })
    ), [activeTab])


    return (
        <View style={styles.container}>
            {footerJSX}
        </View>
    )
}

export default memo(Footer)

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingTop: RPH(2),
        backgroundColor: '#FFF',
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
        borderRadius: 10,
        borderTopWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.25)",
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.25)',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 1,
                shadowRadius: 0,
                paddingBottom: 20,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    buttonContainer: {
        flex: 1,
        alignItems: "center",
        gap: 2
    },
    notificationActive: {
        backgroundColor: "#FF0202",
        width: 15,
        height: 15,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        right: RPW(6.4),
        top: RPH(-.8),
        zIndex: 99
    }
})