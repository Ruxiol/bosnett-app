import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

import ButtonsInterface from "../../components/app/common/multiButtons/interfaces/buttonsInterface";
import MultiButtons from "../../components/app/common/multiButtons/multiButtons";

import Apis from "../../constants/apis";
import Icons from "../../constants/icons";
import requestUtils from "../../constants/utils/requestUtils";

import useErrorHandling from "../../hooks/useErrorHandling";
import useSliceSelector from "../../hooks/useSliceSelector";
import useSuccessHandling from "../../hooks/useSuccessHandling";
import useToken from "../../hooks/useToken";

import IErrorResponse from "../../interfaces/IErrorResponse";
import PostOptionsModalProps from "./interfaces/postOptionsModalProps";

const PostOptionsModal = (props: PostOptionsModalProps) => {
    const { isModalVisible, setIsModalVisible, postId, setPosts } = props;
    const messages = useSliceSelector(state => state.language.messages);
    const { getToken } = useToken();
    const { handleError } = useErrorHandling();
    const { handleSuccess } = useSuccessHandling();
    const [isLoading, setIsLoading] = useState(false);

    const test = (val: string | undefined) => {
        console.log(val)
    }

    const deletePost = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            setIsLoading(true);

            const { message } = await requestUtils.request<IErrorResponse, undefined>(
                `${Apis.newsFeedApi}/${postId}`,
                'DELETE',
                undefined,
                { 'Authorization': `Bearer ${accessToken}` }
            );

            handleSuccess(message);
            setPosts && setPosts((prevPosts) => prevPosts.filter(post => post._id !== postId));
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }

    }, [getToken, handleError, handleSuccess, setPosts, setIsModalVisible, postId]);

    useEffect(() => {
        if (!isLoading) {
            setIsModalVisible(false);
        }
    }, [isLoading, setIsModalVisible]);

    const buttons: ButtonsInterface[] = [
        {
            label: messages.pin,
            action: () => test(postId),
            icon: Icons.pinIcon,
        },
        {
            label: messages.report,
            action: () => test(postId),
            icon: Icons.reportIcon,
        },
        {
            label: messages.delete,
            action: deletePost,
            icon: Icons.delIcon,
        }
    ];

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
                setIsModalVisible(false);
            }}
        >
            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    {isLoading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    ) : (
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalView}>
                                <MultiButtons buttons={buttons} />
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default memo(PostOptionsModal);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: 'relative'
    },
    modalView: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 10
    },
    loaderContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%'
    },
})