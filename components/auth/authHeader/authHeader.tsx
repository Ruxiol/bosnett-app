import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { memo, useEffect } from 'react';

import Icons from '../../../constants/icons';
import { RPH, RPW, RFS } from '../../../constants/utils/utils';

import useReducerDispatch from '../../../hooks/useReducerDispatch';
import useSliceSelector from '../../../hooks/useSliceSelector';
import { loadLanguage, setLanguage } from '../../../reducers/language/languageSlice';

import RootStackParamListInterface from '../../../interfaces/RootStackParamListInterface';
import AuthHeaderProps from './interfaces/authHeaderProps';
import LanguageOptionInterface from '../../../interfaces/languageOptionInterface';

const AuthHeader = (props: AuthHeaderProps) => {
    const { currentStep, goBackToPreviousStep, formik, showBackIcon } = props
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const currentLanguage = useSliceSelector(state => state.language.language);
    const dispatch = useReducerDispatch();
    const messages = useSliceSelector(state => state.language.messages);

    useEffect(() => {
        dispatch(loadLanguage());
    }, [dispatch]);

    const handleLanguageChange = (itemValue: string) => {
        dispatch(setLanguage(itemValue));
        formik?.setFieldValue('selectedLanguage', itemValue);
    };

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

    const goBack = () => {
        if (currentStep && goBackToPreviousStep && currentStep > 1) {
            goBackToPreviousStep();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {showBackIcon && (
                    <TouchableOpacity style={styles.iconContainer} onPress={goBack}>
                        {Icons.backIcon}
                    </TouchableOpacity>
                )}
                <View style={styles.languageDropdown}>
                    <Picker
                        mode="dropdown"
                        dropdownIconColor="#000"
                        selectedValue={currentLanguage}
                        onValueChange={handleLanguageChange}>
                        {languageOptions.map((item, index) => (
                            <Picker.Item
                                style={styles.dropdownText}
                                key={index}
                                label={item.label}
                                value={item.value}
                            />
                        ))}
                    </Picker>
                </View>
            </View>
            <View style={styles.logo}>
                <Text style={styles.logoText}>bosnett</Text>
            </View>
        </View>
    )
}

export default memo(AuthHeader);

const styles = StyleSheet.create({
    container: {
        paddingTop: RPH(2),
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%'
    },
    iconContainer: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: RPW(4),
        paddingVertical: RPH(2)
    },
    header: {
        flexDirection: 'row'
    },
    logoText: {
        color: '#2196f3',
        fontSize: 46,
        fontFamily: 'ReadexPro-Regular'
    },
    languageDropdown: {
        borderRadius: 10,
        height: RPH(5),
        justifyContent: "center",
        paddingHorizontal: RPW(19),
        width: '100%',
        paddingTop: 10
    },
    dropdownText: {
        fontSize: RFS(17),
        fontFamily: "Lato-Regular"
    },
    logo: {
        paddingVertical: 70,
        alignItems: "center"
    },
});