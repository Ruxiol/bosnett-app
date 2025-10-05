import { Modal, View, Image, StyleSheet } from "react-native";

import TextRegular from "../../components/app/common/textComponent/textRegular/textRegular";

import useSliceSelector from "../../hooks/useSliceSelector";
import useReducerDispatch from "../../hooks/useReducerDispatch";
import { setSuccessModal } from "../../reducers/app/appSlice";

import SuccesModalProps from "./interfaces/succesModalProps";

const SuccesModal = (props: SuccesModalProps) => {
    const isModalVisible = useSliceSelector(state => state.app.successModal.isVisible)
    const dispatch = useReducerDispatch()

    return (
        <Modal
            transparent
            animationType="fade"
            visible={isModalVisible}
            onRequestClose={() => dispatch(setSuccessModal(false))}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Image source={require('../../assets/verified.png')} />
                    <TextRegular fontSize={20}>
                        {props.successText}
                    </TextRegular>
                </View>
            </View>
        </Modal>
    )
}

export default SuccesModal

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 69,
        gap: 30,
        height: 450,
        justifyContent: 'center',
        alignItems: 'center',
    },
})