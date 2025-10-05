import { View, StyleSheet, TextInput, Image, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard, FlatList, Text, RefreshControl } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";

import MainWrapper from "../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";
import AppHeader from "../../../components/app/appHeader/appHeader";

import { RPH, RPW, RFS } from "../../../constants/utils/utils";
import Apis from "../../../constants/apis";
import Icons from "../../../constants/icons";

import useSliceSelector from "../../../hooks/useSliceSelector";

import UsersInterface from "./interfaces/usersInterface";
import IProfileData from "../../../interfaces/IProfileData";
import requestUtils from "../../../constants/utils/requestUtils";
import useReducerDispatch from "../../../hooks/useReducerDispatch";
import { setUserData } from "../../../reducers/auth/authSlice";
import useToken from "../../../hooks/useToken";
import userInitialUtils from "../../../constants/utils/userInitialUtils";

const Friends = () => {
    const dispatch = useReducerDispatch();
    const { getToken } = useToken();
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<IProfileData>();
    const [users, setUsers] = useState<UsersInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const messages = useSliceSelector(state => state.language.messages);

    const acceptRequest = useCallback(async (id: string) => {
        try {
            const accessToken = await getToken();
            if (!accessToken) return;

            const data = await requestUtils.request<IProfileData, Record<string, string>>(
                Apis.acceptRequest,
                "POST",
                { requestUserId: id },
                { "Authorization": `Bearer ${accessToken}` }
            );
            dispatch(setUserData(data.data));
        } catch (e) {
            console.log(e)
        }
    }, [getToken, setUserData, dispatch]);

    const getUser = useCallback(async () => {
        setRefreshing(true);
        const accessToken = await getToken();
        if (!accessToken) return;


        try {
            const { data } = await requestUtils.request<IProfileData, void>(
                Apis.profileApi,
                "GET",
                undefined,
                { "Authorization": `Bearer ${accessToken}` }
            );

            dispatch(setUserData(data));
            setUser(data);
            setRefreshing(false);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setRefreshing(false);
        }
    }, [getToken, dispatch, setUser]);

    useEffect(() => {
        getUser();
    }, [getUser]);

    const filteredUsers = users.filter(user => {
        const itemText = user.name.toLowerCase();
        return itemText.includes(searchQuery.toLowerCase());
    });

    const renderUserItem = ({ item, index }: { item: IProfileData; index: number }) => (
        <View key={index}>
            <View style={styles.friendContainer}>
                <TouchableOpacity>
                    <View style={styles.circle}>
                        {
                            item.profileImage
                                ? <Image
                                    style={styles.roundImg}
                                    source={{ uri: item.profileImage }}
                                />
                                : userInitialUtils(item.firstName, item.lastName, item.userId || "")
                        }
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <View>
                        <TextBold fontSize={17}>{item.firstName} {item.lastName} ({item.userName})</TextBold>
                    </View>
                </TouchableOpacity>
            </View>
            {index !== filteredUsers.length - 1 && <View style={styles.borderBottom} />}
        </View>
    );

    const friendRequestsJSX = useMemo(() => (
        user?.friendRequestsReceived.map((item, index) => (
            <View key={index}
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#e1e1e1",
                    padding: 5,
                    borderRadius: 5
                }}
            >
                <View style={styles.friendContainer}>
                    <TouchableOpacity>
                        <View style={styles.circle}>
                            {
                                item.profileImage
                                    ? <Image style={styles.roundImg} source={{ uri: item.profileImage }} />
                                    : userInitialUtils(item.firstName, item.lastName, item.userId || "")
                            }
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View>
                            <TextBold fontSize={17}>{item.userName}</TextBold>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity onPress={() => acceptRequest(item.userId)}>
                        <AntDesign name="checkcircle" size={20} color="green" />
                    </TouchableOpacity>
                    <Entypo name="circle-with-cross" size={24} color="red" />
                </View>
            </View>
        ))
    ), [user]);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <MainWrapper>
                <View style={styles.container}>
                    <AppHeader headerText={messages.friends} icon={true} />
                    <View style={styles.iconContainer}>
                        <View style={styles.icon}>
                            {Icons.inputSearchIcon}
                        </View>
                        <TextInput
                            placeholder={messages.searchFriends}
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={(text) => setSearchQuery(text)}
                        />
                    </View>
                    <View style={{ margin: RPW(2.5) }}>
                        <Text style={{ marginVertical: 5, fontWeight: "500" }}>New Friend Requests</Text>
                        {friendRequestsJSX}
                    </View>
                    <View style={styles.bodyContainer}>
                        <TextBold style={styles.friendsText} fontSize={18}>
                            {
                                filteredUsers.length === 1 ?
                                    `${user?.friends.length} ${messages.friend}` :
                                    `${user?.friends.length} ${messages.friends}`
                            }
                        </TextBold>
                        <View style={styles.content}>
                            <FlatList
                                data={user?.friends}
                                renderItem={renderUserItem}
                                keyExtractor={(item, index) => `${item.userId}_${index}`}
                                onEndReachedThreshold={0.5}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={getUser} />
                                }
                            />
                        </View>
                    </View>
                </View>
            </MainWrapper>
        </TouchableWithoutFeedback>
    )
}

export default Friends

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: RPH(1.6)
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
        position: "relative"
    },
    friendsText: {
        paddingLeft: RPW(2.5)
    },
    bodyContainer: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E7E7E7",
        marginHorizontal: RPW(2.5),
        paddingLeft: RPW(2.5),
        paddingVertical: RPW(5.4),
        marginBottom: RPH(1.8),
        backgroundColor: "#fff",
        marginTop: RPH(1.6)
    },
    circle: {
        width: RPW(11.5),
        justifyContent: "center",
        alignItems: "center"
    },
    roundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: RPH(5.5)
    },
    content: {
        marginTop: RPH(3.6),
        gap: RPH(1)
    },
    friendContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: RPW(3.2)
    },
    borderBottom: {
        borderBottomWidth: .5,
        borderBottomColor: "rgba(0, 0, 0, 0.12)",
        width: "84%",
        alignSelf: "flex-end",
        marginTop: RPH(1.3)
    }
})