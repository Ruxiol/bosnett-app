import { NavigationContainer } from '@react-navigation/native';

import useSliceSelector from '../hooks/useSliceSelector';

import AppStack from './appStack';
import AuthStack from './authStack';

const MainNavigator = () => {
    const isAuthenticated = useSliceSelector(state => state.auth.isAuthenticated);

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    )
}

export default MainNavigator;