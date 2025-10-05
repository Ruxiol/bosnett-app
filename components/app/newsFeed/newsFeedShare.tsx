import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard, Pressable, Image } from "react-native";
import { memo, useCallback, useMemo } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import TextBold from "../common/textComponent/textBold/textBold";
import Shimmer from "../common/shimmer/shimmer";

import Apis from "../../../constants/apis";
import Icons from "../../../constants/icons";
import { RPW, RPH, RFS, getUserInitials, getColorForUser } from "../../../constants/utils/utils";

import useSliceSelector from "../../../hooks/useSliceSelector";
import useReducerDispatch from "../../../hooks/useReducerDispatch";
import { setCreatePostModal } from "../../../reducers/app/appSlice";

import NewsFeedShareProps from "./interfaces/newsFeedShareProps";
import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";

const NewsFeedShare = (props: NewsFeedShareProps) => {
    const { showUploadButtons, isLoading } = props;
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const isCreatePostModalVisible = useSliceSelector(state => state.app.createPostModal.isVisible);
    const dispatch = useReducerDispatch();
    const userData = useSliceSelector(state => state.auth.userData);
    const messages = useSliceSelector(state => state.language.messages);
    const loggedInUserColor = useMemo(() => getColorForUser(userData.userId), []);

    const handleToggleCreatePostModal = useCallback(() => {
        dispatch(setCreatePostModal(!isCreatePostModalVisible));
    }, [isCreatePostModalVisible]);

    const name = `${userData.firstName} ${userData.lastName}`;
    const userInitials = useMemo(() => getUserInitials(name), [userData]);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.shareContainer}>
                    {isLoading
                        ? <Shimmer isLoading={isLoading} width={RPW(11.5)} height={RPH(5.6)} borderRadius={50} />
                        : userData.profileImage
                            ? <TouchableOpacity style={styles.circle} onPress={() => navigation.navigate("UserProfile")}>
                                <Image style={styles.roundImg} source={{ uri: `${Apis.homeUrl}${userData.profileImage}` }} />
                            </TouchableOpacity>
                            : <TouchableOpacity
                                style={[styles.circle, { backgroundColor: loggedInUserColor }]}
                                onPress={() => navigation.navigate("UserProfile")}
                            >
                                <TextBold fontSize={14} color='#fff'>
                                    {userInitials}
                                </TextBold>
                            </TouchableOpacity>
                    }
                    <View style={styles.inputContainer}>
                        {isLoading
                            ? <Shimmer isLoading={isLoading} width='100%' height={RPH(5)} borderRadius={20} />
                            : <Pressable onPress={handleToggleCreatePostModal} style={{ flex: 1 }}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={messages.newsfeedPlaceholder}
                                    editable={false}
                                />
                            </Pressable>
                        }
                    </View>
                    {isLoading
                        ? <Shimmer isLoading={isLoading} width={RPW(11)} height={RPH(5.2)} borderRadius={50} />
                        : <TouchableOpacity onPress={() => showUploadButtons(true)} style={styles.uploadButton}>
                            {Icons.uploadIcon}
                        </TouchableOpacity>}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default memo(NewsFeedShare);

const styles = StyleSheet.create({
    shareContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: RPW(5),
        paddingBottom: RPH(2),
        width: "100%",
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: RPW(3),
    },
    input: {
        width: '100%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.26)',
        borderRadius: 25,
        paddingHorizontal: RPW(2.5),
        paddingVertical: RPH(.6),
        color: "#767676",
        fontSize: RFS(12),
        fontFamily: "Lato-Regular",
        fontWeight: "400"
    },
    roundImg: {
        width: '100%',
        height: '100%'
    },
    circle: {
        width: 34,
        height: 34,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: 70,
    },
    uploadButton: {
        flexShrink: 1,
    }
});