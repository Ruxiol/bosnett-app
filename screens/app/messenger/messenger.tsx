import { StackNavigationProp } from "@react-navigation/stack";
import { View, StyleSheet, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, Keyboard, ActivityIndicator, FlatList, Alert } from "react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from '@socket.io/component-emitter';

import { RPH, RPW, RFS } from "../../../constants/utils/utils";
import MainWapper from "../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";
import TextRegular from "../../../components/app/common/textComponent/textRegular/textRegular";
import AppHeader from "../../../components/app/appHeader/appHeader";
import Apis from "../../../constants/apis";
import Icons from "../../../constants/icons";

import { setUserData } from "../../../reducers/auth/authSlice";
import useSliceSelector from "../../../hooks/useSliceSelector";
import useToken from "../../../hooks/useToken";
import requestUtils from "../../../constants/utils/requestUtils";
import IProfileData from "../../../interfaces/IProfileData";
import useReducerDispatch from "../../../hooks/useReducerDispatch";
import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import userInitialUtils from "../../../constants/utils/userInitialUtils";
import Toast from "react-native-toast-message";

const Messenger = () => {
    const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
    const userData = useSliceSelector(state => state.auth.userData);
    const [searchQuery, setSearchQuery] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [users, setUsers] = useState<IProfileData>();
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const messages = useSliceSelector(state => state.language.messages);
    const { getToken } = useToken();
    const dispatch = useReducerDispatch();
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();

    const fetchData = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const { data } = await requestUtils.request<IProfileData, void>(
                Apis.profileApi,
                'GET',
                undefined,
                { 'Authorization': `Bearer ${accessToken}` }
            );
            setUsers(data);
            dispatch(setUserData(data));
            setIsLoading(false)
        } catch (error) {
            console.log(error);
        }
    }, [getToken, dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const loadMorePosts = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    };

    const renderUserItem = ({ item, index }: { item: IProfileData; index: number }) => {
        return (
            <TouchableOpacity style={styles.friendListItem} key={index}
                onPress={() =>
                    navigation.navigate("ChatRoom", {
                        user: {
                            userName: `${item.firstName} ${item.lastName}`,
                            userId: item.userId,
                            userImage: item.profileImage
                        },
                        socket: socket.current
                    })}
            >
                <View style={styles.friendListContent}>
                    <View style={styles.friendListCircle}>
                        {
                            item.profileImage
                                ? <Image
                                    style={styles.activeRoundImg}
                                    source={{ uri: item.profileImage }}
                                />
                                : userInitialUtils(item.firstName, item.lastName, item.userId || "")
                        }
                    </View>
                    <View>
                        <TextRegular fontSize={17}>
                            {item.firstName}
                        </TextRegular>
                        <TextRegular fontSize={14} color="rgba(0, 0, 0, 0.50)">
                            You: Whats up man! · 9:40 AM
                        </TextRegular>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <MainWapper>
                <View style={styles.container}>
                    <AppHeader headerText={messages.myFriends} chatHeader={true} />
                    <View style={styles.iconContainer}>
                        <View style={styles.icon}>
                            {Icons.inputSearchIcon}
                        </View>
                        <TextInput
                            placeholder="Search"
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={(text) => setSearchQuery(text)}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                        />
                    </View>
                    <View style={styles.friendListContainer}>
                        {users?.friends.length ?
                            <FlatList
                                data={users.friends}
                                renderItem={renderUserItem}
                                keyExtractor={(item, index) => `${item.userId}_${index}`}
                                onEndReached={loadMorePosts}
                                onEndReachedThreshold={0.5}
                            />
                            :
                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                <TextBold fontSize={16}>Add Some Friends</TextBold>
                            </View>
                        }
                    </View>
                </View>
            </MainWapper>
        </TouchableWithoutFeedback>
    )
}

export default memo(Messenger)

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        // paddingTop: RPH(1.6),
    },
    icon: {
        position: "absolute",
        left: RPW(7.8),
        top: RPH(1.7)
    },
    input: {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        marginHorizontal: RPW(5.9),
        color: "#8E8E93",
        fontSize: RFS(17),
        fontFamily: "Lato-Regular",
        fontWeight: "400",
        paddingVertical: RPH(1.3),
        borderRadius: 10,
        paddingHorizontal: RPW(7.8)
    },
    iconContainer: {
        position: "relative",
        paddingBottom: RPH(1.6),
        marginTop: RPH(1.6)
    },
    activeFriendscontainer: {
        flexDirection: "row",
        gap: RPW(4),
        paddingBottom: RPH(.6)
    },
    activeIcon: {
        backgroundColor: "#5AD439",
        width: 14,
        height: 14,
        borderRadius: 50,
        position: "absolute",
        bottom: 25,
        right: 0,
        borderColor: "#fff",
        borderWidth: 2
    },
    activeCircle: {
        width: RPW(15.3),
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
    },
    activeRoundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: RPH(7.6)
    },
    activeContainer: {
        paddingHorizontal: RPW(3.7)
    },
    activeFriendText: {
        marginTop: RPH(1),
    },
    friendListCircle: {
        width: RPW(17.4),
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
    },
    friendListRoundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: RPH(8.9)
    },
    friendListContainer: {
        marginTop: RPH(.6)
    },
    friendListItem: {
        paddingHorizontal: RPW(4.6),
        paddingVertical: RPH(1.1),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    friendListContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: RPW(3.4)
    }
})