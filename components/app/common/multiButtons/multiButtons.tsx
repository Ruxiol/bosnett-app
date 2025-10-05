import { memo } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

import TextRegular from "../textComponent/textRegular/textRegular";

import MultiButtonsProps from "./interfaces/multiButtonsProps";

const MultiButtons = (props: MultiButtonsProps) => {
    const { buttons } = props;

    return (
        <View style={styles.container}>
            {buttons.map((button, index) => {
                return (
                    <View style={styles.spacing} key={index}>
                        <TouchableOpacity style={styles.w100} onPress={() => button.action()}>
                            {button.icon}
                            <TextRegular fontSize={16} color="#000">
                                {button.label}
                            </TextRegular>
                        </TouchableOpacity>
                        {index !== buttons.length - 1 && <View style={styles.borderBottom}></View>}
                    </View>
                )
            })}
        </View>
    )
}

export default memo(MultiButtons);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
        paddingHorizontal: 10
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#EBEFF2',
        width: '100%'
    },
    w100: {
        width: '100%',
        flexDirection: 'row',
        gap: 8
    },
    spacing: {
        gap: 8
    }
})