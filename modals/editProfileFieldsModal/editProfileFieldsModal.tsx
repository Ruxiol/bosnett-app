import { memo, useCallback } from "react";
import { Modal, TouchableWithoutFeedback, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

import TextRegular from "../../components/app/common/textComponent/textRegular/textRegular";
import TextBold from "../../components/app/common/textComponent/textBold/textBold";

import useSliceSelector from "../../hooks/useSliceSelector";

import { RFS, RPH } from "../../constants/utils/utils";
import Icons from "../../constants/icons";

import EditProfileFieldsModalProps from "./interfaces/editProfileFieldsModalProps";

const EditProfileFieldsModal = (props: EditProfileFieldsModalProps) => {
    const {
        isModalVisible,
        editingField,
        value,
        firstName,
        lastName,
        keyValuePairs,
        setIsModalVisible,
        setEditValue,
        setFirstName,
        setLastName,
        handleSave,
        handleAddKeyValuePair,
        handleSaveKeyValuePair,
        handleRemoveKeyValuePair
    } = props;
    const messages = useSliceSelector(state => state.language.messages);

    const handleKeyValueChange = useCallback((index: number, name: string, value: string) => {
        handleSaveKeyValuePair(editingField, index, name, value);
    }, [editingField, handleSaveKeyValuePair]);

    const handleAddKeyValuePairWithLimit = useCallback(() => {
        if (keyValuePairs.length < 10) {
            handleAddKeyValuePair(editingField);
        } else {
            console.log('Maximum limit reached');
        }
    }, [editingField, handleAddKeyValuePair, keyValuePairs]);

    const FieldLabel = useCallback(() => {
        let fieldName;
        switch (editingField) {
            case 'bio':
                fieldName = messages.biography;
                break;
            case 'phone':
                fieldName = messages.phone;
                break;
            default:
                fieldName = '';
        }
        return fieldName;
    }, [editingField, messages]);

    const FieldLabelPref = useCallback(() => {
        let fieldName;
        switch (editingField) {
            case 'education':
                fieldName = messages.education;
                break;
            case 'workExperience':
                fieldName = messages.work;
                break;
            case 'socialMedia':
                fieldName = messages.socials;
                break;
            default:
                fieldName = '';
        }
        return fieldName;
    }, [editingField, messages]);

    const FieldLabelModal = useCallback(() => {
        let name;
        let value;
        switch (editingField) {
            case 'education':
                name = 'School/College';
                value = 'Degree'
                break;
            case 'workExperience':
                name = 'Company';
                value = 'Experience';
                break;
            case 'socialMedia':
                name = 'Name';
                value = 'link'
                break;
            default:
                name = '';
                value = '';
        }
        return { name, value };
    }, [editingField, messages]);

    return (
        <Modal
            visible={isModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => {
                setIsModalVisible(false);
            }}
        >
            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            {['socialMedia', 'education', 'workExperience'].includes(editingField) ? (
                                <ScrollView>
                                    <TextBold fontSize={16}>
                                        {FieldLabelPref()}
                                    </TextBold>
                                    {keyValuePairs.map((pair, index) => (
                                        <View key={index} style={styles.keyValuePair}>
                                            <View style={styles.keyValueContainer}>
                                                <TextInput
                                                    style={styles.input}
                                                    onChangeText={(text) => handleKeyValueChange(index, text, pair.value)}
                                                    value={pair.name}
                                                    placeholder={FieldLabelModal().name}
                                                />
                                                <TextInput
                                                    style={styles.input}
                                                    onChangeText={(text) => handleKeyValueChange(index, pair.name, text)}
                                                    value={pair.value}
                                                    placeholder={FieldLabelModal().value}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveKeyValuePair(editingField, index)}
                                                style={styles.cross}
                                            >
                                                {Icons.crossIcon}
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : editingField === 'firstName'
                                ? <View style={styles.modalFields}>
                                    <View style={styles.modalField}>
                                        <TextBold fontSize={16}>
                                            First Name
                                        </TextBold>
                                        <TextInput
                                            style={styles.input}
                                            onChangeText={setFirstName}
                                            value={firstName}
                                        />
                                    </View>
                                    <View style={styles.modalField}>
                                        <TextBold fontSize={16}>
                                            Last Name
                                        </TextBold>
                                        <TextInput
                                            style={styles.input}
                                            onChangeText={setLastName}
                                            value={lastName}
                                        />
                                    </View>
                                </View>
                                : <View style={styles.modalFields}>
                                    <View style={styles.modalField}>
                                        <TextBold fontSize={16}>
                                            {FieldLabel()}
                                        </TextBold>
                                        <TextInput
                                            style={styles.input}
                                            onChangeText={setEditValue}
                                            autoFocus={true}
                                            value={value}
                                        />
                                    </View>
                                </View>
                            }
                            <View style={styles.btnContainer}>
                                {['socialMedia', 'education', 'workExperience'].includes(editingField)
                                    && keyValuePairs.length < 10 && (
                                        <TouchableOpacity onPress={handleAddKeyValuePairWithLimit} style={styles.nextButton}>
                                            <TextRegular fontSize={17} color='#fff'>Add</TextRegular>
                                        </TouchableOpacity>
                                    )}
                                <TouchableOpacity onPress={handleSave} style={styles.nextButton}>
                                    <TextRegular fontSize={17} color='#fff'>Save</TextRegular>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default memo(EditProfileFieldsModal);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    cross: {
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    keyValuePair: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 10,
        width: '100%',
        paddingTop: 10
    },
    keyValueContainer: {
        gap: 10,
        width: '70%'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#ccc'
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 10,
    },
    input: {
        borderRadius: 14,
        backgroundColor: "#fff",
        paddingVertical: RPH(1.4),
        paddingLeft: 10,
        color: "#000",
        fontFamily: "Lato-Regular",
        fontWeight: "400",
        fontSize: RFS(16),
        borderWidth: 1,
        borderColor: '#C4C4C4'
    },
    nextButton: {
        backgroundColor: "#308AFF",
        borderRadius: 34,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingVertical: 11,
        paddingHorizontal: 26,
        marginTop: 15,
        width: '40%'
    },
    modalFields: {
        flexDirection: 'column',
        width: '100%',
        gap: 20,
        paddingBottom: 10
    },
    modalField: {
        gap: 10
    }
})