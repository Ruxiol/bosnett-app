import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';

import { RPH, RPW } from '../../../constants/utils/utils';

import AuthContainerInterface from './interfaces/AuthContainerInterface';

const AuthContainer = ({ children }: AuthContainerInterface) => {
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <LinearGradient
                    colors={['rgba(212, 178, 211, .3)', 'rgba(221, 249, 249, 1)', '#FFF']}
                    locations={[0.1694, 0.5649, 1.1252]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[{ height: Dimensions.get('window').height }, styles.container]}
                >
                    {children}
                </LinearGradient>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default AuthContainer

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: RPW(10),
        paddingTop: RPH(1)
    },
});