import { memo, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';

import TextBold from "../../../app/common/textComponent/textBold/textBold";
import ImagePickerButtonsModal from "../../../../modals/imagePickerButtonsModal/imagePickerButtonsModal";

import { RPH } from "../../../../constants/utils/utils";

import useSliceSelector from "../../../../hooks/useSliceSelector";
import useImagePicker from "../../../../hooks/useImagePicker";

import SignUpProfilePictureProps from "./interfaces/signUpProfilePictureProps";

const userPlaceholder = require("../../../../assets/user-placeholder.png");

const SignUpProfilePicture = (props: SignUpProfilePictureProps) => {
    const { formik } = props;
    const [showButtons, setShowButtons] = useState<boolean>(false);
    const messages = useSliceSelector(state => state.language.messages);
    const { handleImagePicker } = useImagePicker();

    const showUploadButtons = () => {
        setShowButtons(true)
    }

    const pickImage = async (action: string, options?: ImagePicker.ImagePickerOptions) => {
        const selectedImage = await handleImagePicker(action, options);
        if (selectedImage && selectedImage.length > 0) {
            setShowButtons(false);
            formik.setFieldValue('image', selectedImage[0]);
        }
    };

    return (
        <View>
            <View style={{ alignSelf: 'center' }}>
                <TextBold fontSize={23}>
                    {messages.updateProfilePicture}
                </TextBold>
            </View>
            <View style={styles.fieldContainer}>
                <TouchableOpacity style={[styles.circle, formik.values.image ? {} : { backgroundColor: '#767676' }]} onPress={showUploadButtons}>
                    {formik.values.image.uri ? (
                        <Image style={styles.roundImg} source={{ uri: formik.values.image.uri }} />
                    ) : (
                        <Image style={styles.roundImg} source={userPlaceholder} />
                    )}
                    <View style={styles.editImage}>
                        <Image source={require("../../../../assets/icons/editImg.png")} />
                    </View>
                </TouchableOpacity>
            </View>
            <ImagePickerButtonsModal
                handleImagePicker={pickImage}
                showButtons={showButtons}
                setShowButtons={setShowButtons}
            />
        </View>
    )
}

export default memo(SignUpProfilePicture)

const styles = StyleSheet.create({
    editImage: {
        width: 36,
        height: 25,
        backgroundColor: '#5890FF',
        borderRadius: 6,
        position: 'absolute',
        bottom: -1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circle: {
        width: 170,
        height: 170,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 6,
        borderColor: "#5890FF",
        borderRadius: 90,
        position: "relative",
        overflow: "hidden"
    },
    roundImg: {
        width: "100%",
        height: "100%"
    },
    fieldContainer: {
        paddingTop: RPH(4),
        gap: RPH(2),
        alignItems: 'center'
    },
    nextButton: {
        backgroundColor: "#308AFF",
        borderRadius: 34,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingVertical: 11,
        paddingHorizontal: 16
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
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
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#cecece',
        width: '100%'
    },
    w100: {
        width: '100%'
    }
})