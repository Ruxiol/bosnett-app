import { memo, useEffect, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import MainWrapper from "../../../components/app/mainWrapper/mainWrapper";
import TextRegular from "../../../components/app/common/textComponent/textRegular/textRegular";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";

import Icons from "../../../constants/icons";

import useSliceSelector from "../../../hooks/useSliceSelector";
import useReducerDispatch from "../../../hooks/useReducerDispatch";

import { loadLanguage, setLanguage } from "../../../reducers/language/languageSlice";
import { resetActiveTab } from "../../../reducers/app/appSlice";

import LanguageOptionInterface from "../../../interfaces/languageOptionInterface";
import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";
import { RPH, RPW } from "../../../constants/utils/utils";

const Language = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const messages = useSliceSelector(state => state.language.messages);
    const currentLanguage = useSliceSelector(state => state.language.language);
    const dispatch = useReducerDispatch();

    const languageOptions: LanguageOptionInterface[] = [
        {
            label: messages.english,
            value: 'en'
        },
        {
            label: messages.bosnia,
            value: 'bs'
        }
    ];

    const [selectedOptionIndex, setSelectedOptionIndex] = useState(
        languageOptions.findIndex(option => option.value === currentLanguage)
    );

    useEffect(() => {
        dispatch(loadLanguage());
    }, [dispatch]);

    useEffect(() => {
        setSelectedOptionIndex(
            languageOptions.findIndex(option => option.value === currentLanguage)
        );
    }, [currentLanguage]);

    const handleOption = (index: number) => {
        setSelectedOptionIndex(index);
        dispatch(setLanguage(languageOptions[index].value));
    };

    const goBack = () => {
        navigation.goBack();
        dispatch(resetActiveTab());
    };

    return (
        <MainWrapper isFooter={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={goBack}>
                        {Icons.backIcon}
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <TextBold fontSize={24}>
                            {messages.language}
                        </TextBold>
                    </View>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.content}>
                    {
                        languageOptions.map((item, index) => {
                            const isSelected = index === selectedOptionIndex;
                            return (
                                <TouchableOpacity
                                    style={styles.option}
                                    key={index}
                                    onPress={() => handleOption(index)}
                                >
                                    <View style={styles.textContainer}>
                                        <TextRegular fontSize={17}>
                                            {item.label}
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
        </MainWrapper>
    )
}

export default memo(Language);

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFDFA",
        flex: 1,
        paddingTop: RPH(4),
        paddingHorizontal: RPW(6)
    },
    option: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'center'
    },
    content: {
        gap: 10
    },
    placeholder: {
        width: 11,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: RPH(3)
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    textContainer: {
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
});