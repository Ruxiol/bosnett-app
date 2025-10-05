import { View, StyleSheet, TextInput, Image, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import moment from "moment";

import MainWapper from "../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";
import AppHeader from "../../../components/app/appHeader/appHeader";

import { RPW, RFS, RPH } from "../../../constants/utils/utils";
import Apis from "../../../constants/apis";

import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import UsersInterface from "../friends/interfaces/usersInterface";

import useSliceSelector from "../../../hooks/useSliceSelector";

const imageSize = "thumb";

const NewMessage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const [users, setUsers] = useState<UsersInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const userId = useSliceSelector(state => state.auth.userData.userId);
    const messages = useSliceSelector(state => state.language.messages);

    const fetchData = useCallback(async (page: number) => {
        try {
            const response = await axios.get(`${Apis.friendsApi}?user_id=${userId}&page=${page}`);
            setUsers((prevUsers => [...prevUsers, ...response.data]));
            setTotalPages(response.headers["x-wp-totalpages"]);
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false)

        }
    }, [currentPage])

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage])

    const loadMorePosts = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const inputRef = useRef<TextInput>(null);

    const filteredUsers = users.filter(user => {
        const itemText = user.name.toLowerCase();
        return itemText.includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    const calculateLastActivity = (lastActivityTimestamp: string) => {
        if (lastActivityTimestamp && lastActivityTimestamp !== messages.notActive) {
            const lastActivityMoment = moment(lastActivityTimestamp);
            if (lastActivityMoment.isValid()) {
                const currentTime = moment();
                const hoursSinceLastActivity = currentTime.diff(lastActivityMoment, 'hours');
                if (hoursSinceLastActivity < 24) {
                    return `${hoursSinceLastActivity} ${messages.hoursAgo}`;
                } else {
                    const daysSinceLastActivity = Math.floor(hoursSinceLastActivity / 24);
                    return `${daysSinceLastActivity} ${messages.daysAgo}`;
                }
            } else {
                return messages.invalidDate;
            }
        } else {
            return messages.notActive;
        }
    };

    const renderUserItem = ({ item, index }: { item: UsersInterface; index: number }) => {
        const isActive = calculateLastActivity(item.last_activity)
        return (
            <View key={index}>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("ChatRoom", {
                            user: { userName: item.name, userImage: (item.avatar_urls)[imageSize], lastSeen: isActive }
                        })}>
                    <View style={styles.friendContainer}>
                        <View style={styles.circle}>
                            <Image style={styles.roundImg} source={{ uri: (item.avatar_urls)[imageSize] }} />
                        </View>
                        <View>
                            <TextBold fontSize={17}>
                                {item.name}
                            </TextBold>
                        </View>
                    </View>
                    {
                        index !== filteredUsers.length - 1 &&
                        <View style={styles.borderBottom}></View>
                    }
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <MainWapper>
            <View style={styles.container}>
                <AppHeader headerText={messages.cancel} />
                <View style={styles.inputContainer}>
                    <TextInput
                        ref={inputRef}
                        placeholder={messages.to}
                        style={styles.input}
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                    />
                </View>
                <View style={styles.content}>
                    {filteredUsers.length >= 1 ?
                        <FlatList
                            data={filteredUsers}
                            renderItem={renderUserItem}
                            keyExtractor={(item, index) => `${item.id}_${index}`}
                            onEndReached={loadMorePosts}
                            onEndReachedThreshold={0.5}
                        />
                        :
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
                            <TextBold fontSize={16}>{messages.addFriends}</TextBold>
                        </View>
                    }
                </View>
            </View>
        </MainWapper>
    )
}

export default memo(NewMessage)

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        paddingLeft: RPW(2.2),
        alignItems: "center"
    },
    input: {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        color: "#8E8E93",
        fontSize: RFS(17),
        fontFamily: "Lato-Regular",
        fontWeight: "400",
        paddingVertical: RPH(1.3),
        paddingHorizontal: RPW(7.8),
        flex: 1
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: RPH(1.6)
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
        gap: RPH(.8),
        marginHorizontal: RPH(2.2)
    },
    friendContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: RPW(3)
    },
    borderBottom: {
        borderBottomWidth: .5,
        borderBottomColor: "rgba(0, 0, 0, 0.12)",
        width: "84%",
        alignSelf: "flex-end",
        marginTop: RPH(1.3)
    }
})