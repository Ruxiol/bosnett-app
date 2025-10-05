import { Modal, View, Image, StyleSheet, Animated, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { memo, useCallback } from "react";

import { setImageFullScreenModal } from "../../reducers/app/appSlice";
import useReducerDispatch from "../../hooks/useReducerDispatch";
import useSliceSelector from "../../hooks/useSliceSelector";

import Icons from "../../constants/icons";
import { RPH, RPW } from "../../constants/utils/utils";
import Apis from "../../constants/apis";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ImageFullScreenModal = () => {
    const isImageFullScreenModalVisible = useSliceSelector(state => state.app.imageFullScreeenModal.isVisible);
    const imageModalUris = useSliceSelector(state => state.app.imageFullScreeenModal.imageUris);
    const dispatch = useReducerDispatch();
    const startIndex = useSliceSelector(state => state.app.imageFullScreeenModal.startIndex);

    const closeModal = useCallback(() => {
        dispatch(setImageFullScreenModal({ isVisible: false }));
    }, [dispatch]);

    return (
        <Modal
            visible={isImageFullScreenModalVisible}
            animationType="fade"
        >
            <Animated.View style={styles.modalContainer}>
                {imageModalUris && (
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentOffset={{ x: startIndex ? screenWidth * startIndex : 0, y: 0 }}
                    >
                        {imageModalUris.map((uri, index) => (
                            <View key={index} style={styles.modalContent}>
                                <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
                                    {Icons.grayCross}
                                </TouchableOpacity>
                                <Image
                                    source={{ uri: `${Apis.homeUrl}${uri}` }}
                                    style={styles.modalImage}
                                />
                            </View>
                        ))}
                    </ScrollView>
                )}
            </Animated.View>
        </Modal>
    )
}

export default memo(ImageFullScreenModal)

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth,
        height: screenHeight
    },
    modalImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    closeIcon: {
        alignSelf: "flex-end",
        marginTop: RPH(6),
        marginRight: RPW(2)
    }
})