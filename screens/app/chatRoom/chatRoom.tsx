import { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput, Text } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Path } from "react-native-svg";
import { Pusher, PusherMember, PusherChannel, PusherEvent, } from "@pusher/pusher-websocket-react-native";

import IconContainer from "../../../components/app/common/iconContainer/iconContainer";
import MainWapper from "../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";
import TextRegular from "../../../components/app/common/textComponent/textRegular/textRegular";
import { RPH, RPW } from "../../../constants/utils/utils"
import Icons from "../../../constants/icons"
import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import chatRoomParamsInterface from "../../../interfaces/chatRoomInterface";
import useSliceSelector from "../../../hooks/useSliceSelector";
import useToken from "../../../hooks/useToken";
import requestUtils from "../../../constants/utils/requestUtils";
import Apis from "../../../constants/apis";

const userPlaceholder = require("../../../assets/user-placeholder.png");

const galleryIcon = <IconContainer width="20" height="21" viewBox="0 0 20 21" fill="none">
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M15.7718 0.65802C17.6797 0.65802 19.2263 2.2549 19.2263 4.22476V16.7084C19.2263 18.6782 17.6797 20.2751 15.7718 20.2751H3.68086C1.77297 20.2751 0.226318 18.6782 0.226318 16.7084V4.22476C0.226318 2.2549 1.77297 0.65802 3.68086 0.65802H15.7718ZM15.7716 2.44135H3.68072C2.72678 2.44135 1.95345 3.23979 1.95345 4.22472V13.5566C1.95345 13.6551 2.03078 13.735 2.12618 13.735C2.15314 13.735 2.17973 13.7284 2.20382 13.7159L7.39747 11.0176C8.86245 10.2561 10.5901 10.2558 12.0554 11.0165L17.2486 13.7125C17.3338 13.7567 17.4376 13.7213 17.4805 13.6333C17.4926 13.6084 17.4989 13.581 17.4989 13.5532V4.22472C17.4989 3.23979 16.7256 2.44135 15.7716 2.44135ZM5.83993 4.22482C7.03236 4.22482 7.99902 5.22287 7.99902 6.45403C7.99902 7.6852 7.03236 8.68325 5.83993 8.68325C4.6475 8.68325 3.68084 7.6852 3.68084 6.45403C3.68084 5.22287 4.6475 4.22482 5.83993 4.22482Z" fill="#385DFF" />
</IconContainer>;

const linkIcon = <IconContainer width="19" height="22" viewBox="0 0 19 22" fill="none">
    <Path d="M6.55476 21.2751C5.28082 21.2753 4.03543 20.8977 2.97611 20.1901C1.91679 19.4824 1.09114 18.4765 0.603588 17.2996C0.11604 16.1226 -0.0115009 14.8275 0.237098 13.578C0.485697 12.3286 1.09927 11.1809 2.0002 10.2803L10.1974 2.08307C11.067 1.21346 12.2464 0.724915 13.4763 0.724915C14.7061 0.724915 15.8855 1.21346 16.7551 2.08307C17.6247 2.95268 18.1133 4.13213 18.1133 5.36194C18.1133 6.59176 17.6247 7.7712 16.7551 8.64082L9.65021 15.7447C9.11036 16.2603 8.39254 16.5481 7.646 16.5481C6.89946 16.5481 6.18164 16.2603 5.64179 15.7447C5.11098 15.213 4.81301 14.4924 4.8134 13.7411C4.81379 12.9898 5.11249 12.2694 5.64385 11.7383L10.9259 6.45524C11.021 6.35682 11.1347 6.27832 11.2604 6.22432C11.3861 6.17031 11.5213 6.14189 11.6581 6.1407C11.795 6.13951 11.9306 6.16558 12.0573 6.21739C12.1839 6.26921 12.299 6.34572 12.3957 6.44247C12.4925 6.53922 12.569 6.65427 12.6208 6.78091C12.6726 6.90755 12.6987 7.04324 12.6975 7.18006C12.6963 7.31688 12.6679 7.45209 12.6139 7.57781C12.5599 7.70353 12.4814 7.81723 12.383 7.91229L7.1009 13.1954C6.95617 13.3403 6.87488 13.5367 6.87488 13.7415C6.87488 13.9463 6.95617 14.1427 7.1009 14.2876C7.24808 14.428 7.44365 14.5063 7.64703 14.5063C7.85041 14.5063 8.04598 14.428 8.19317 14.2876L15.2981 7.18377C15.7803 6.70027 16.0511 6.0453 16.0511 5.36246C16.0511 4.67962 15.7803 4.02464 15.2981 3.54115C14.8073 3.0725 14.1548 2.811 13.4763 2.811C12.7977 2.811 12.1452 3.0725 11.6544 3.54115L3.45725 11.7383C3.0428 12.1432 2.71283 12.6263 2.48643 13.1597C2.26004 13.693 2.14173 14.266 2.13835 14.8454C2.13498 15.4248 2.24661 15.9991 2.46678 16.535C2.68694 17.071 3.01127 17.5579 3.42097 17.9676C3.83067 18.3773 4.31759 18.7016 4.85353 18.9218C5.38947 19.1419 5.96377 19.2536 6.54317 19.2502C7.12256 19.2468 7.69552 19.1285 8.22886 18.9021C8.7622 18.6757 9.24531 18.3457 9.65021 17.9313L16.0266 11.5559C16.1217 11.4575 16.2354 11.379 16.3611 11.325C16.4868 11.271 16.622 11.2426 16.7588 11.2414C16.8957 11.2402 17.0313 11.2663 17.158 11.3181C17.2846 11.3699 17.3997 11.4464 17.4964 11.5432C17.5932 11.6399 17.6697 11.755 17.7215 11.8816C17.7733 12.0082 17.7994 12.1439 17.7982 12.2808C17.797 12.4176 17.7686 12.5528 17.7146 12.6785C17.6606 12.8042 17.5821 12.9179 17.4837 13.013L11.1083 19.3873C10.5118 19.9877 9.80208 20.4637 9.02025 20.7878C8.23842 21.1118 7.40005 21.2775 6.55373 21.2751H6.55476Z" fill="#385DFF" />
</IconContainer>;

const gifIcon = <IconContainer width="24" height="11" viewBox="0 0 24 11" fill="none">
    <Path d="M11.1429 0.142853H13.7143V10.4286H11.1429V0.142853ZM6.85714 0.142853H1.71429C0.685714 0.142853 0 0.999995 0 1.85714V8.71428C0 9.57142 0.685714 10.4286 1.71429 10.4286H6.85714C7.88571 10.4286 8.57143 9.57142 8.57143 8.71428V5.28571H6V7.85713H2.57143V2.71428H8.57143V1.85714C8.57143 0.999995 7.88571 0.142853 6.85714 0.142853ZM24 2.71428V0.142853H16.2857V10.4286H18.8571V6.99999H22.2857V4.42857H18.8571V2.71428H24Z" fill="#385DFF" />
</IconContainer>;

const emojiIcon = <IconContainer width="24" height="24" viewBox="0 0 24 24" fill="none" >
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM16.7118 15.72C15.518 17.249 13.9759 17.9946 12 17.9946C10.0241 17.9946 8.48203 17.249 7.28821 15.72C6.94832 15.2847 6.3199 15.2073 5.88459 15.5472C5.44927 15.8871 5.37191 16.5155 5.71179 16.9508C7.28627 18.9674 9.41086 19.9946 12 19.9946C14.5891 19.9946 16.7137 18.9674 18.2882 16.9508C18.6281 16.5155 18.5507 15.8871 18.1154 15.5472C17.6801 15.2073 17.0517 15.2847 16.7118 15.72ZM8 8C7.17157 8 6.5 8.89543 6.5 10C6.5 11.1046 7.17157 12 8 12C8.82843 12 9.5 11.1046 9.5 10C9.5 8.89543 8.82843 8 8 8ZM16 8C15.1716 8 14.5 8.89543 14.5 10C14.5 11.1046 15.1716 12 16 12C16.8284 12 17.5 11.1046 17.5 10C17.5 8.89543 16.8284 8 16 8Z" fill="#385DFF" />
</IconContainer>;

const likeIcon = <IconContainer width="28" height="30" viewBox="0 0 28 30" fill="none">
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M4.69977 14.1458C5.41721 14.1458 5.99882 14.7473 5.99882 15.4893V28.645C5.99882 29.387 5.41721 29.9885 4.69977 29.9885H2.36711C1.97143 29.9885 1.60425 29.7884 1.37982 29.459L1.30257 29.3295C0.522893 27.8255 0.133057 25.4047 0.133057 22.0671C0.133057 18.8077 0.504854 16.4227 1.24845 14.9119L1.37582 14.6682C1.55526 14.345 1.88808 14.1458 2.2484 14.1458H4.69977ZM14.0724 0.399825C17.0635 0.803068 18.559 2.77943 18.559 6.3289C18.559 7.0463 18.3721 8.65177 17.9982 11.1453C24.0958 11.2768 26.9694 12.3938 26.9694 14.4962C26.9694 15.0143 26.841 15.5104 26.2337 15.9845C27.1803 16.582 27.6536 17.4327 27.6536 18.5367C27.6536 19.6406 27.1094 20.5434 26.021 21.2451C26.5445 21.8557 26.7406 22.5683 26.6091 23.3828C26.4777 24.1973 25.882 24.8094 24.8223 25.2189C25.3371 27.5197 22.8271 28.6701 17.2923 28.6701C9.13843 28.6701 8.37218 26.5598 8.34742 24.662L8.34676 17.013C8.26321 15.2675 8.75647 13.8013 9.82657 12.6146L10.0483 12.381C11.9443 10.4808 12.969 8.58108 13.1222 6.68175L12.8999 1.51333C12.8744 0.920345 13.3186 0.41825 13.8919 0.39187C13.9522 0.389097 14.0126 0.391758 14.0724 0.399825Z" fill="#385DFF" />
</IconContainer>;

interface IMessage {
    fromSelf: boolean;
    message: string;
};

const pusher = Pusher.getInstance();

const ChatRoom = () => {
    const route = useRoute();
    const userData = useSliceSelector(state => state.auth.userData);
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const { user, socket } = route.params as chatRoomParamsInterface;
    const userName = user.userName;
    const userImage = user.userImage;
    const isActive = user.lastSeen;
    const userId = user.userId;
    const { getToken } = useToken();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        let isMounted = true; // To prevent state updates if the component unmounts
        const initializePusher = async () => {
            try {
                await pusher.init({
                    apiKey: "2ee2fda7b1243572fd70",
                    cluster: "ap2",
                });

                if (!isMounted) return; // Avoid continuing if the component is unmounted
                console.log("Connecting to Pusher...");
                await pusher.connect();

                if (!isMounted) return; // Avoid subscribing if unmounted

                console.log("Subscribing to channel: my-channel");
                const subscription = await pusher.subscribe({
                    channelName: "my-channel",
                    onEvent: (event: PusherEvent) => {
                        const eventData = JSON.parse(event.data);
                        if (eventData.toUser === userData.userId) {
                            setMessages((prevState) => [...prevState, { message: eventData.message, fromSelf: false }])
                        }
                    },
                });
                console.log("Subscribed successfully:", subscription);
            } catch (error) {
                console.error("Error initializing Pusher:", error);
            }
        };

        initializePusher();

        return () => {
            isMounted = false;
            try {
                pusher.disconnect();
            } catch (error) {
                console.error("Error during Pusher disconnect:", error);
            }
        };
    }, [userData]);

    const sendMessage = useCallback(async (text: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            if (text) {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${accessToken}`);

                const raw = JSON.stringify({
                    "to": userId,
                    "from": userData.userId,
                    "message": text
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                };

                fetch(`${Apis.baseUrl}messages/addMsg`, requestOptions)
                    .then((response) => response.text())
                    .then(() => {
                        setMessages((prevState) => [...prevState, { fromSelf: true, message: text }]);
                        inputRef.current?.clear();
                    })
                    .catch((error) => console.error(error));
            }
        } catch (e) {
            console.log(e)
        }
    }, [socket, inputRef, getToken]);

    const getMessages = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const data = await requestUtils.request<IMessage[], { to: string, from: string }>(
                `${Apis.baseUrl}messages/getMessages`,
                'POST',
                {
                    to: userId,
                    from: userData.userId
                },
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setMessages(data.data)
        } catch (e) {
            console.log(e)
        }
    }, [userData.userId, userId, getToken]);

    useEffect(() => {
        getMessages();
    }, []);

    const goBack = () => {
        navigation.goBack();
    };

    return (
        <MainWapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backIcon}>
                    {Icons.backIcon}
                </TouchableOpacity>
                <View style={styles.circle}>
                    {/* {
                        userImage
                            ? <Image style={styles.roundImg} source={{ uri: userImage }} />
                            : <Image style={styles.roundImg} source={userPlaceholder} />
                    } */}
                </View>
                <View>
                    <TextBold fontSize={17}>
                        {userName}
                    </TextBold>
                    {
                        isActive &&
                        <TextRegular fontSize={13} color="rgba(0, 0, 0, 0.35)">
                            {isActive}
                        </TextRegular>
                    }
                </View>
            </View>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContentContainer}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                <View style={styles.content}>
                    <View style={styles.imageContainer}>
                        <View style={styles.contentCircle}>
                            {/* {
                                userImage
                                    ? <Image style={styles.contentRoundImg} source={{ uri: userImage }} />
                                    : <Image style={styles.contentRoundImg} source={userPlaceholder} />
                            } */}
                        </View>
                        <TextBold fontSize={24} style={styles.userName}>
                            {userName}
                        </TextBold>
                    </View>
                    <View style={styles.messagesContainer}>
                        {messages.map((msg, index) => (
                            <View
                                style={
                                    msg.fromSelf
                                        ? [styles.leftStart, { flexDirection: "row" }]
                                        : [styles.rightStart, { flexDirection: "row-reverse" }]
                                }
                                key={index}
                            >
                                <View style={styles.messageCircle}>
                                    {/* {
                                        userImage ?
                                            <Image style={styles.messageRoundImg} source={{ uri: userImage }} />
                                            : <Image style={styles.messageRoundImg} source={userPlaceholder} />
                                    } */}
                                </View>
                                <Text style={styles.leftPad}>{msg.message}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.bottomIcons}>
                <TouchableOpacity>
                    {galleryIcon}
                </TouchableOpacity>
                <TouchableOpacity>
                    {linkIcon}
                </TouchableOpacity>
                <TouchableOpacity>
                    {gifIcon}
                </TouchableOpacity>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    returnKeyType="send"
                    onSubmitEditing={(e) => sendMessage(e.nativeEvent.text)}
                />
                <TouchableOpacity style={styles.emojiIcon}>
                    {emojiIcon}
                </TouchableOpacity>
                <TouchableOpacity>
                    {likeIcon}
                </TouchableOpacity>
            </View>
        </MainWapper >
    )
}

export default memo(ChatRoom)

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        gap: RPW(3),
        paddingHorizontal: RPW(2.7),
        paddingTop: RPH(1),
        paddingBottom: RPH(2),
        alignItems: "center",
        backgroundColor: "#fff"
    },
    backIcon: {
        paddingHorizontal: RPW(4),
        paddingVertical: RPH(2)
    },
    imageContainer: {
        alignItems: "center"
    },
    messagesContainer: {
        justifyContent: "flex-end",
        flexDirection: "column",
        flex: 1,
        gap: 10
    },
    circle: {
        width: RPW(11.5),
        height: RPH(5.8),
        justifyContent: "center",
        alignItems: "center",
    },
    messageCircle: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    messageRoundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: 30
    },
    contentCircle: {
        width: RPW(25.6),
        height: RPH(12.3),
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 10
    },
    contentRoundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: RPH(12.3)
    },
    roundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: RPH(5.8)
    },
    content: {
        backgroundColor: "#fff",
        paddingBottom: 10,
        gap: 20
    },
    userName: {
        marginTop: RPH(1.2)
    },
    scrollContentContainer: {
        flexGrow: 1,
        justifyContent: "flex-end"
    },
    bottomIcons: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: RPW(5),
        paddingBottom: RPH(.6),
        backgroundColor: "#fff",
        gap: RPW(5),
        position: "relative"
    },
    input: {
        flex: 1,
        paddingVertical: RPH(1),
        paddingLeft: RPW(5),
        borderRadius: 18,
        backgroundColor: "rgba(177, 177, 177, 0.23)"
    },
    emojiIcon: {
        position: "absolute",
        right: RPW(18),
        top: RPH(1.2)
    },
    leftStart: {
        alignSelf: "flex-start",
        marginLeft: RPW(3.2),
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "rgba(0, 0, 0, 0.06)",
        borderRadius: 18,
        paddingHorizontal: 13,
        paddingVertical: 5,
        paddingLeft: 5
    },
    rightStart: {
        alignSelf: "flex-end",
        marginRight: RPW(3.2),
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.06)",
        borderRadius: 18,
        paddingHorizontal: 13,
        paddingVertical: 5,
        paddingRight: 5,
        gap: 5
    },
    leftPad: {
        paddingLeft: 8
    },
    rightPad: {
        paddingRight: 8
    }
})
