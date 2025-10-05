import { useEffect } from 'react';
import Toast from 'react-native-toast-message';

const useSuccessHandling = () => {
    const showSuccessToast = (successMessage: string) => {
        Toast.show({
            type: 'success',
            text1: successMessage,
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

    const handleSuccess = (response: string | undefined) => {
        if (response) {
            const successMessage = response;
            showSuccessToast(successMessage);
        } else {
            showSuccessToast('Success!');
        }
    };

    useEffect(() => {
        return () => {
            Toast.hide();
        };
    }, []);

    return { handleSuccess };
};

export default useSuccessHandling;