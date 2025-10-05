import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

import useErrorHandling from './useErrorHandling';

const useImagePicker = () => {
    const { handleError } = useErrorHandling();

    const handleImagePicker = useCallback(async (action: string, options?: ImagePicker.ImagePickerOptions) => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            handleError(new Error("You've refused to allow this app to access your photos!"));
            return;
        }

        let result;
        if (action === "gallery") {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [1, 1],
                quality: 1,
                allowsMultipleSelection: options?.allowsMultipleSelection,
                allowsEditing: options?.allowsEditing
            });
        } else {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: options?.allowsMultipleSelection,
                allowsEditing: options?.allowsEditing,
                aspect: [1, 1],
                quality: 1,
            });
        }

        if (!result.canceled && result.assets.length > 0) {
            const selectedImages = result.assets.map((image) => {
                let filename = image.uri.split('/').pop();
                let uri = image.uri;

                // Infer the type of the image
                let match = /\.(\w+)$/.exec(filename as string);
                let type = match ? `image/${match[1]}` : `image`;

                return {
                    uri,
                    type,
                    filename: filename || '',
                };
            });
            return selectedImages;
        }

        return [];
    }, []);

    return { handleImagePicker };
};

export default useImagePicker;