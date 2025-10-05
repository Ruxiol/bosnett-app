import { memo, useCallback, useEffect, useState } from "react"
import { StyleSheet, Image, Dimensions, FlatList, Pressable, View, TouchableOpacity } from "react-native";

import Loader from "../../../../components/common/loader";
import TextRegular from "../../../../components/app/common/textComponent/textRegular/textRegular";

import requestUtils from "../../../../constants/utils/requestUtils";
import Apis from "../../../../constants/apis";

import useToken from "../../../../hooks/useToken";
import useErrorHandling from "../../../../hooks/useErrorHandling";
import useSliceSelector from "../../../../hooks/useSliceSelector";
import useReducerDispatch from "../../../../hooks/useReducerDispatch";
import useSuccessHandling from "../../../../hooks/useSuccessHandling";

import { setImageFullScreenModal } from "../../../../reducers/app/appSlice";

import MediaUploadResponseData from "../../../../constants/interfaces/apisInterfaces/mediaUploadResponseData";
import IErrorResponse from "../../../../interfaces/IErrorResponse";
import ImagesId from "./interfaces/imagesId";

const { width: screenWidth } = Dimensions.get("window");

const Photos = () => {
    const { getToken } = useToken();
    const { handleError } = useErrorHandling();
    const { handleSuccess } = useSuccessHandling();
    const dispatch = useReducerDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<MediaUploadResponseData[]>();
    const isImageFullScreenModalVisible = useSliceSelector(state => state.app.imageFullScreeenModal.isVisible);
    const [longPressedImage, setLongPressedImage] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            setIsLoading(true);
            const { data } = await requestUtils.request<MediaUploadResponseData[], void>(
                Apis.uploadMedia,
                'GET',
                undefined,
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setImages(data);
            setIsLoading(false);
        } catch (error) {
            handleError(error);
        }
    }, [getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleModal = useCallback((imageUri: string[]) => {
        setLongPressedImage(null);
        dispatch(setImageFullScreenModal({ isVisible: !isImageFullScreenModalVisible, uris: imageUri }))
    }, [dispatch, isImageFullScreenModalVisible]);

    const handleDelete = useCallback(async (imageId: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        const id = Array(imageId);

        try {
            setIsLoading(true);
            const response = await requestUtils.request<IErrorResponse, ImagesId>(
                `${Apis.uploadMedia}/delete`,
                'POST',
                { fileIds: id },
                { 'Authorization': `Bearer ${accessToken}` }
            );
            setImages(prevImages => prevImages && prevImages.filter(image => image._id !== imageId));
            handleSuccess(response.message);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
            setLongPressedImage(null);
        }
    }, [getToken, handleSuccess, handleError]);

    const renderItem = ({ item }: { item: MediaUploadResponseData }) => {
        if (isLoading && item._id === longPressedImage) {
            return <Loader />
        }
        const paths = Array(item.path);
        return (
            <View style={styles.imageContainer}>
                <Pressable
                    onPress={() => toggleModal(paths)}
                    onLongPress={() => setLongPressedImage(item._id)}
                >
                    <Image
                        source={{ uri: `${Apis.homeUrl}${item.path}` }}
                        style={styles.image}
                    />
                </Pressable>
                {longPressedImage === item._id && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item._id)}
                    >
                        <TextRegular fontSize={14}>Delete</TextRegular>
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    if (isLoading && !longPressedImage) {
        return <Loader />
    }

    return (
        <FlatList
            data={images}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item._id}_${index}`}
            numColumns={3}
            contentContainerStyle={styles.container}
            initialScrollIndex={0}
        />
    )
}

export default memo(Photos);

const styles = StyleSheet.create({
    container: {
        padding: 1,
    },
    image: {
        width: screenWidth / 3 - 2,
        height: screenWidth / 3 - 2,
        margin: 1,
    },
    imageContainer: {
        position: 'relative',
    },
    deleteButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#fefefe',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 8,
        textAlign: 'center'
    },
});