import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text, Image, ImageBackground, TouchableOpacity, FlatList, RefreshControl, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { ImagePickerOptions } from "expo-image-picker";
import axios from "axios";

import { getColorForUser, RPH } from "../../../../constants/utils/utils";
import { setCreatePostModal } from "../../../../reducers/app/appSlice";
import MainWapper from "../../../../components/app/mainWrapper/mainWrapper";
import AppHeader from "../../../../components/app/appHeader/appHeader";
import useToken from "../../../../hooks/useToken";
import Apis from "../../../../constants/apis";
import GroupsInterface from "../interfaces/groupsInterface";
import useSliceSelector from "../../../../hooks/useSliceSelector";
import NewsFeedItem from "../../../../components/app/newsFeed/newsfeedItem";
import FeedPostResponse from "../../../../components/app/newsFeed/interfaces/feedPostsResponse";
import CreatePostModal from "../../../../modals/createPostModal/createPostModal";
import ImageInterface from "../../../../components/common/interfaces/imageInterface";
import MediaUploadResponseData from "../../../../constants/interfaces/apisInterfaces/mediaUploadResponseData";
import requestUtils from "../../../../constants/utils/requestUtils";
import useErrorHandling from "../../../../hooks/useErrorHandling";
import useImagePicker from "../../../../hooks/useImagePicker";
import useReducerDispatch from "../../../../hooks/useReducerDispatch";
import CreatePostResponse from "../../home/interfaces/createPostResponse";
import useSuccessHandling from "../../../../hooks/useSuccessHandling";
import userInitialUtils from "../../../../constants/utils/userInitialUtils";

const Group = memo(() => {
    const dispatch = useReducerDispatch();
    const { getToken } = useToken();
    const route = useRoute();
    const isCreatePostModalVisible = useSliceSelector(state => state.app.createPostModal.isVisible);
    const params = route.params as Record<string, string>;
    const [group, setGroup] = useState<GroupsInterface>();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(1);
    const userData = useSliceSelector(state => state.auth.userData);
    const [newsFeedPosts, setNewsFeedPosts] = useState<FeedPostResponse[]>([]);
    const [userColor, setUserColor] = useState<{ [key: string]: string }>()
    const [description, setDescription] = useState("");
    const [fileIds, setFileIds] = useState<string[]>();
    const [images, setImages] = useState<ImageInterface[]>([]);
    const [isUploadComplete, setIsUploadComplete] = useState(false);
    const { handleError } = useErrorHandling();
    const { handleImagePicker } = useImagePicker();
    const [isPostCreated, setIsPostCreated] = useState(false);
    const { handleSuccess } = useSuccessHandling();

    const handleToggleCreatePostModal = useCallback(() => {
        dispatch(setCreatePostModal(!isCreatePostModalVisible));
    }, [isCreatePostModalVisible]);

    const getGroupPosts = useCallback(async (id: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        let config = {
            method: "get",
            url: `https://app.bosnett.com/api/v1/groups/feed-post/${id}`,
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        axios.request(config)
            .then((response) => {
                const newColors = { ...userColor };
                response.data.data.forEach((post: { userdetail: { userId: any; }; }) => {
                    const userId = post.userdetail.userId;
                    if (!newColors[userId]) {
                        newColors[userId] = getColorForUser(userId);
                    }
                });
                setUserColor(newColors);
                setNewsFeedPosts(response.data.data);
            })
            .catch((error) => {
                console.log(error);
            });

    }, [])

    const isRequested = useMemo(() =>
        group?.requested.some((user) => user.userId === userData.userId) || false,
        [group?.requested, userData._id]);

    const isMember = useMemo(() => group?.members.some((user) => user.userId === userData.userId) || false,
        [group?.members, userData._id]);

    const getGroup = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        let config = {
            method: "get",
            url: `${Apis.singleGroup}/${params.id}`,
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        axios.request(config)
            .then((response) => {
                setGroup(response.data.data);
                getGroupPosts(response.data.data._id);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [params.id]);

    const joinGroup = useCallback(async (id: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        setLoading(true);
        let data = JSON.stringify({
            "id": id
        });

        let config = {
            method: "post",
            url: "https://app.bosnett.com/api/v1/joinGroup",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            data: data
        };

        axios.request(config)
            .then(() => {
                getGroup();
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const resetPostState = useCallback(() => {
        setDescription('');
        setFileIds([]);
        setImages([]);
        setIsUploadComplete(false);
        setIsPostCreated(false)
    }, []);

    const createPost = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            setLoading(true);
            await requestUtils.request<CreatePostResponse, { description: string, media?: string[], postType: string, group: string }>(
                Apis.newsFeedApi,
                'POST',
                {
                    description: description,
                    media: fileIds,
                    postType: "Group",
                    group: params.id

                },
                { 'Authorization': `Bearer ${accessToken}` }
            );
            getGroup();
            handleSuccess("Post Created!");
            setIsPostCreated(true);
            dispatch(setCreatePostModal(false));
            resetPostState();
        } catch (error) {
            handleError(error);
        }

    }, [getToken, description, fileIds, isPostCreated, handleError, dispatch, params.id, getGroup]);

    const uploadImages = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        if (images.length) {
            const formData = new FormData();
            images.forEach((image) => {
                // @ts-ignore: Unreachable code error
                formData.append("file", { uri: image.uri, type: image.type, name: image.filename })
            })

            try {
                const { data } = await requestUtils.request<MediaUploadResponseData[], FormData>(
                    Apis.uploadMedia,
                    'POST',
                    formData,
                    { 'Authorization': `Bearer ${accessToken}` },
                    true
                );

                const ids = data.map(item => item._id);
                setFileIds(ids);
                setIsUploadComplete(true);
            } catch (error) {
                handleError(error);
            }
        } else {
            setIsUploadComplete(true);
        }

    }, [getToken, images, handleError])

    const pickImages = async (action: string, options?: ImagePickerOptions) => {
        const selectedImages = await handleImagePicker(action, options);
        if (selectedImages && selectedImages.length > 0) {
            setImages((prevImages) => [...prevImages, ...selectedImages]);
        }
    };

    const removeImage = useCallback((index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    }, [images]);

    useEffect(() => {
        if (isUploadComplete) {
            createPost();
        }
    }, [isUploadComplete]);

    useEffect(() => {
        getGroup();
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    return (
        <MainWapper>
            <View style={styles.container}>
                <AppHeader headerText={group?.name} icon={true} />
                <ScrollView>
                    <ImageBackground
                        source={{ uri: `${Apis.homeUrl}${group?.image.path}` }}
                        style={{ width: "100%", height: 200, justifyContent: "flex-end" }}
                        resizeMode="cover"
                    >
                        <View style={{ paddingHorizontal: 10, backgroundColor: "#ffffff26", height: 80, justifyContent: "space-between", alignItems: "center", flexDirection: "row" }}>
                            <View style={{ gap: 5 }}>
                                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16, textTransform: "capitalize" }}>
                                    {group?.name}
                                </Text>
                                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16, textTransform: "capitalize" }}>
                                    Members ({group?.name})
                                </Text>
                            </View>
                            <View>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: "#308AFF",
                                        width: 100,
                                        height: 40,
                                        borderRadius: 50,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    onPress={() => !isMember && !isRequested && joinGroup(group?._id as string)}
                                >
                                    <Text style={{ color: "#fff" }}>
                                        {isMember ? "Member" : isRequested ? "Requested" : "Join"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                    <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: activeTab === 1 ? "#308AFF" : "#D3D3D3",
                                    width: "50%",
                                    height: 30,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderBottomRightRadius: 5,
                                    borderTopRightRadius: 5
                                }}
                                onPress={() => setActiveTab(1)}
                            >
                                <Text style={{ color: "#fff" }}>Posts</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: activeTab === 2 ? "#308AFF" : "#D3D3D3",
                                    width: "50%",
                                    height: 30,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderBottomLeftRadius: 5,
                                    borderTopLeftRadius: 5
                                }}
                                onPress={() => setActiveTab(2)}
                            >
                                <Text style={{ color: "#fff" }}>Members</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            {
                                activeTab === 1
                                    ? isMember
                                        ? newsFeedPosts.length
                                            ? newsFeedPosts.map((item, index) => (
                                                <NewsFeedItem
                                                    key={index}
                                                    item={item}
                                                    index={index}
                                                    newsFeedPosts={newsFeedPosts}
                                                    setNewsFeedPosts={setNewsFeedPosts}
                                                    isLoading={loading}
                                                    userColors={userColor}
                                                />
                                            )) :
                                            <View style={{ marginTop: 10, justifyContent: "center", alignItems: "center" }}>
                                                <Text style={{ fontSize: 18 }}>No New Posts</Text>
                                            </View>
                                        : <View style={{ marginTop: 10, justifyContent: "center", alignItems: "center" }}>
                                            <Text style={{ fontSize: 18 }}>Join Group To View Posts</Text>
                                        </View>
                                    : <View>
                                        {group?.members.map((member, index) => (
                                            <View
                                                key={index}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    marginHorizontal: 10,
                                                    marginTop: 10,
                                                    borderWidth: 1,
                                                    borderColor: "#D3D3D3",
                                                    padding: 5,
                                                    borderRadius: 5,
                                                    justifyContent: "space-between"
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                                    {
                                                        member.profileImage
                                                            ? <Image style={styles.roundImg} source={{ uri: member.profileImage }} />
                                                            : userInitialUtils(member.firstName, member.lastName, member.userId || "")
                                                    }
                                                    <Text style={{ textTransform: "capitalize" }}>{member.firstName} {member.lastName} ({member.userName})</Text>
                                                </View>
                                                {member.userId === userData.userId && <Text>Me</Text>}
                                            </View>
                                        ))}
                                    </View>
                            }
                        </View>
                    </View>
                </ScrollView>
                {isMember && <TouchableOpacity
                    style={{
                        backgroundColor: "#308AFF",
                        position: "absolute",
                        bottom: 20,
                        left: "45%",
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 50
                    }}
                    onPress={handleToggleCreatePostModal}
                >
                    <Image source={require("../../../../assets/icons/add.png")} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>}
            </View>
            <CreatePostModal
                uploadImages={uploadImages}
                images={images}
                handleImagePicker={pickImages}
                removeImage={removeImage}
                setDescription={setDescription}
                description={description}
                isGroup
            />
        </MainWapper>
    )
});

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        paddingTop: RPH(1.6),
        flex: 1,
        backgroundColor: "#fff"
    },
    roundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: RPH(5.5)
    },
})

export default Group;