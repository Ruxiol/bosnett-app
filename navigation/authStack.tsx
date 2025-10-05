import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AccountRecovery from '../screens/auth/accountRecovery/accountRecovery';
import SignIn from '../screens/auth/signIn/signIn';
import SignUp from '../screens/auth/signUp/signup';

const Stack = createStackNavigator();

const AuthStack = () => {
    return (
        <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="AccountRecovery" component={AccountRecovery} />
        </Stack.Navigator>
    );
};

export default AuthStack;
