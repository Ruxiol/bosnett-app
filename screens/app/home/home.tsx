import { StyleSheet, View } from "react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ImagePickerOptions } from "expo-image-picker";

import AppHeader from "../../../components/app/appHeader/appHeader";
import Footer from "../../../components/app/footer/footer";
import NewsFeed from "../../../components/app/newsFeed/newsFeed";
import SafeAreaViewComponent from "../../../components/app/common/SafeAreaViewComponent/SafeAreaViewComponent";
import CreatePostModal from "../../../modals/createPostModal/createPostModal";
import ImagePickerButtonsModal from "../../../modals/imagePickerButtonsModal/imagePickerButtonsModal";
import ImageInterface from "../../../components/common/interfaces/imageInterface";
import Loader from "../../../components/common/loader";

import Apis from "../../../constants/apis";
import { getColorForUser, RPH } from "../../../constants/utils/utils";
import requestUtils from "../../../constants/utils/requestUtils";

import useToken from "../../../hooks/useToken";
import useReducerDispatch from "../../../hooks/useReducerDispatch";
import useErrorHandling from "../../../hooks/useErrorHandling";
import useSuccessHandling from "../../../hooks/useSuccessHandling";
import useImagePicker from "../../../hooks/useImagePicker";
import useSliceSelector from "../../../hooks/useSliceSelector";

import { setCreatePostModal } from "../../../reducers/app/appSlice";
import { setUserData } from "../../../reducers/auth/authSlice";

import MediaUploadResponseData from "../../../constants/interfaces/apisInterfaces/mediaUploadResponseData";
import IProfileData from "../../../interfaces/IProfileData";
import CreatePostResponse from "./interfaces/createPostResponse";
import { usePushNotifications } from "../../../hooks/usePushNotifications";

const Home = () => {
    const userData = useSliceSelector(state => state.auth.userData);
    const [images, setImages] = useState<ImageInterface[]>([]);
    const dispatch = useReducerDispatch();
    const { getToken } = useToken();
    const [showButtons, setShowButtons] = useState(false);
    const { handleError } = useErrorHandling();
    const [fileIds, setFileIds] = useState<string[]>();
    const [description, setDescription] = useState('');
    const { handleSuccess } = useSuccessHandling();
    const [isPostCreated, setIsPostCreated] = useState(false);
    const [isUploadComplete, setIsUploadComplete] = useState(false);
    const { handleImagePicker } = useImagePicker();
    const [isLoading, setIsLoading] = useState(false);
    const loggedInUserId = useSliceSelector(state => state.auth.userData.userId);
    const [userColors, setUserColors] = useState<{ [key: string]: string }>({});
    const { expoPushToken } = usePushNotifications();

    const userUpdate = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        if (expoPushToken) {
            try {
                const myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${accessToken}`);
                const formdata = new FormData();
                formdata.append("notificationToken", expoPushToken.data);
                const { data, message } = await requestUtils.request<IProfileData, FormData>(
                    Apis.profileApi,
                    'POST',
                    formdata,
                    myHeaders,
                    true
                );

                dispatch(setUserData(data));
                handleSuccess(message);
            } catch (e) {
                handleError(e);
            }
        }
    }, [getToken, expoPushToken]);

    useEffect(() => {
        if (expoPushToken && (!userData.notificationToken || userData.notificationToken !== expoPushToken?.data)) {
            userUpdate();
        }
    }, [expoPushToken, userData.notificationToken]);

    const showUploadButtons = () => {
        setShowButtons(!showButtons)
    };

    const createPost = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            setIsLoading(true);
            await requestUtils.request<CreatePostResponse, { description: string, media?: string[] }>(
                Apis.newsFeedApi,
                'POST',
                {
                    description: description,
                    media: fileIds

                },
                { 'Authorization': `Bearer ${accessToken}` }
            );
            setIsLoading(false);
            handleSuccess('Post Created!');
            setIsPostCreated(true);
            dispatch(setCreatePostModal(false));
            resetPostState();
        } catch (error) {
            handleError(error);
        }

    }, [getToken, description, fileIds, isPostCreated, handleError, dispatch]);

    const resetPostState = useCallback(() => {
        setDescription('');
        setFileIds([]);
        setImages([]);
        setIsUploadComplete(false);
        setIsPostCreated(false)
    }, []);

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

    useEffect(() => {
        if (isUploadComplete) {
            createPost();
        }
    }, [isUploadComplete]);

    const pickImages = async (action: string, options?: ImagePickerOptions) => {
        const selectedImages = await handleImagePicker(action, options);
        if (selectedImages && selectedImages.length > 0) {
            setShowButtons(false);
            setImages((prevImages) => [...prevImages, ...selectedImages]);
        }
    };

    const removeImage = useCallback((index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    }, [images]);

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

            dispatch(setUserData(data));

        } catch (error) {
            console.log(error);
        }
    }, [getToken, dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (loggedInUserId && !userColors[loggedInUserId]) {
            setUserColors(prevColors => ({
                ...prevColors,
                [loggedInUserId]: getColorForUser(loggedInUserId),
            }));
        }
    }, [loggedInUserId, userColors]);

    if (isLoading) {
        return (
            <Loader />
        )
    };

    return (
        <SafeAreaViewComponent>
            <View style={styles.container}>
                <View style={{ paddingVertical: RPH(1.8) }}>
                    <AppHeader />
                </View>
                <NewsFeed showUploadButtons={showUploadButtons} isPostCreated={isPostCreated} />
                <CreatePostModal
                    uploadImages={uploadImages}
                    images={images}
                    handleImagePicker={pickImages}
                    removeImage={removeImage}
                    setDescription={setDescription}
                    description={description}
                />
                <ImagePickerButtonsModal
                    handleImagePicker={pickImages}
                    showButtons={showButtons}
                    setShowButtons={setShowButtons}
                />
                <View style={styles.footer}>
                    <Footer />
                </View>
            </View>
        </SafeAreaViewComponent>
    )
}

export default memo(Home);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: RPH(.8),
        backgroundColor: "#F2F3F9",
        position: "relative"
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    }
})