import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from "expo-status-bar";
import MainNavigator from './navigation/mainNavigator';
import Toast from 'react-native-toast-message';

import Loader from './components/common/loader';

import store from './store';

const customFonts = {
  'Lato-Regular': require('./assets/fonts//Lato-Regular.ttf'),
  'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
  'ReadexPro-Regular': require('./assets/fonts/ReadexPro-Regular.ttf')
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  // Simulate a delay of 2 seconds
  const simulateDelay = () => {
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  // Use useEffect to simulate the delay when the component mounts
  useEffect(() => {
    const delay = async () => {
      await simulateDelay(); // Simulate delay
      setIsAppReady(true); // Set app ready state
    };
    delay();
  }, []); // Empty dependency array to simulate componentDidMount

  const loadFontsAsync = async () => {
    await Font.loadAsync(customFonts);
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFontsAsync();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  // Render the app loading screen until the app is ready
  if (!isAppReady) {
    return (
      <Loader />
    );
  }

  return (
    <Provider store={store}>
      <StatusBar style="dark" translucent={true} hidden={false} />
      <MainNavigator />
      <Toast />
    </Provider>
  );
}

export default App
