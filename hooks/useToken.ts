import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useToken = () => {
    const getToken = useCallback(async () => {
        const accessToken = await AsyncStorage.getItem("token");
        return accessToken && JSON.parse(accessToken);
    }, []);

    return { getToken };
};

export default useToken;
