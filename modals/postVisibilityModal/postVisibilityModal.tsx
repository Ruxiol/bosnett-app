import { memo, useState } from "react";
import { Modal, TouchableWithoutFeedback, View, StyleSheet, TouchableOpacity } from "react-native";

import PostVisibilityModalProps from "./interfaces/postVisibilityModalProps";
import TextBold from "../../components/app/common/textComponent/textBold/textBold";
import TextRegular from "../../components/app/common/textComponent/textRegular/textRegular";

import Icons from "../../constants/icons";

import useSliceSelector from "../../hooks/useSliceSelector";

import OptionsInterface from "./interfaces/optionsInterface";

const PostVisibilityModal = (props: PostVisibilityModalProps) => {
    const { isModalVisible, setIsModalVisible, setSelectedOption } = props;
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const messages = useSliceSelector(state => state.language.messages);

    const options: OptionsInterface[] = [
        {
            icon: Icons.public,
            title: messages.public,
            description: messages.publicDesc
        },
        {
            icon: Icons.allMembers,
            title: messages.allMembers,
            description: messages.allMembersDesc
        },
        {
            icon: Icons.myFriends,
            title: messages.myFriends,
            description: messages.myFriendsDesc
        },
        {
            icon: Icons.lock,
            title: messages.onlyMe,
            description: messages.onlyMeDesc
        },
        {
            icon: Icons.myGroups,
            title: messages.postInGrp,
            description: messages.postInGrpDesc
        }
    ];

    const handleOption = (index: number) => {
        setSelectedOptionIndex(index);
        setIsModalVisible(false);
        setSelectedOption(options[index].title);
    }

    return (
        <Modal
            visible={isModalVisible}
            animationType="fade"
            transparent={true}
        >
            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            <View style={styles.container}>
                                <View style={styles.header}>
                                    <TextBold fontSize={20}>
                                        {messages.whoPost}
                                    </TextBold>
                                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                        {Icons.crossIcon}
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.body}>
                                    {
                                        options.map((item, index) => {
                                            const isSelected = index === selectedOptionIndex;
                                            return (
                                                <TouchableOpacity
                                                    style={styles.option}
                                                    key={index}
                                                    onPress={() => handleOption(index)}
                                                >
                                                    <View style={styles.icon}>
                                                        {item.icon}
                                                    </View>
                                                    <View style={styles.textContainer}>
                                                        <TextBold fontSize={17}>
                                                            {item.title}
                                                        </TextBold>
                                                        <TextRegular fontSize={14} color='#767676C4'>
                                                            {item.description}
                                                        </TextRegular>
                                                    </View>
                                                    <View
                                                        style={[styles.checkbox, isSelected && styles.CheckboxActive]}>
                                                        {isSelected && <View style={styles.checkboxInner}></View>}
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default memo(PostVisibilityModal);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 11,
        width: "95%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#E4E4E4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E4E4E4',
        padding: 20,
    },
    body: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 20
    },
    option: {
        flexDirection: 'row',
        alignItems: "center",
        gap: 11
    },
    icon: {
        width: 50,
        height: 50,
        backgroundColor: '#F3F4F6',
        borderRadius: 50,
        overflow: "hidden",
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 1
    },
    textContainer: {
        gap: 4,
        flexGrow: 1
    },
    checkboxInner: {
        backgroundColor: '#385DFF',
        width: 19,
        height: 19,
        borderRadius: 19,
        overflow: 'hidden'
    },
    checkbox: {
        width: 33,
        height: 33,
        borderColor: '#A7A7A7',
        borderWidth: 2,
        borderRadius: 30,
        flexShrink: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    CheckboxActive: {
        borderColor: '#385DFF'
    }
})