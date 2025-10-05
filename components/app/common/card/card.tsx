import { memo, useCallback } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import TextRegular from "../textComponent/textRegular/textRegular";

import { RFS, RPH, RPW } from "../../../../constants/utils/utils";

import CardProps from "./interfaces/CardProps";
import RootStackParamListInterface from "../../../../interfaces/RootStackParamListInterface";

const Card = (props: CardProps) => {
    const { cardItem } = props;
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();

    const navigateToScreen = useCallback((screenName: string) => {
        navigation.navigate(screenName);
    }, [navigation]);

    return (
        <View style={styles.card}>
            {cardItem.map((item, index) => {
                return (
                    <TouchableOpacity
                        style={styles.cardItem}
                        key={index}
                        onPress={() => navigateToScreen(item.screen)}
                    >
                        {item.icon}
                        <TextRegular fontSize={RFS(16)} style={styles.grow}>
                            {item.text}
                        </TextRegular>
                        {item.additionalText && (
                            <TextRegular fontSize={RFS(16)} color='#308AFF'>
                                {item.additionalText}
                            </TextRegular>
                        )}
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default memo(Card);

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: '#e1e1e1',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'flex-start',
        gap: RPH(1.6)
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: RPW(3.2)
    },
    grow: {
        flexGrow: 1
    }
});