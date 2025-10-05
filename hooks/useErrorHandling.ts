import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

const useErrorHandling = () => {
    const showErrorToast = (errorMessage: string) => {
        Toast.show({
            type: 'error',
            text1: errorMessage,
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            swipeable: true,
            text1Style: {
                fontSize: 13,
                fontWeight: '400',
                fontFamily: 'Lato-Regular',
                color: '#000',
            },
        });
    };

    const handleError = async (error: unknown) => {
        if (error instanceof Error) {
            const errorMessage = error.message || 'An error occurred';
            showErrorToast(errorMessage);
        } else {
            showErrorToast('Unknown error occurred');
        }
    };

    useEffect(() => {
        return () => {
            Toast.hide();
        };
    }, []);

    return { handleError };
};

export default useErrorHandling;