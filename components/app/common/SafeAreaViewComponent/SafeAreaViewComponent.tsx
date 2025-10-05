import React from 'react';
import { View } from 'react-native';
import Constants from "expo-constants";

import SafeAreaViewInterface from './interfaces/SafeAreaViewInterface';

const SafeAreaViewComponent = ({ children }: SafeAreaViewInterface) => (
    <View style={{ flex: 1, paddingTop: Constants.statusBarHeight }}>
        {children}
    </View>
);

export default SafeAreaViewComponent;