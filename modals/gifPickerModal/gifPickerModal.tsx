import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";

import TextBold from "../../components/app/common/textComponent/textBold/textBold";

interface GifPickerModalProps {
    isVisible: boolean;
    onClose: (value: boolean) => {};
    onSelectGif: (value: string) => {};
}

interface GifUser {
    avatar_url: string;
    banner_image: string;
    banner_url: string;
    description: string;
    display_name: string;
    instagram_url: string;
    is_verified: boolean;
    profile_url: string;
    username: string;
    website_url: string;
}

interface GifData {
    import_datetime: string;
    is_sticker: number;
    rating: string;
    slug: string;
    source: string;
    source_post_url: string;
    source_tld: string;
    title: string;
    trending_datetime: string;
    type: string;
    url: string;
    user: GifUser;
    username: string;
}

const GifPickerModal = (props: GifPickerModalProps) => {
    const { isVisible, onClose, onSelectGif } = props;
    const [gifs, setGifs] = useState<GifData[]>([]);

    const handleGifPicker = useCallback(async () => {
        try {
            const response = await fetch('http://api.giphy.com/v1/gifs/trending?api_key=8vBaJNSyG9oU5fQYvdoUCWiR80lu5BRh');
            const data = await response.json();
            console.log(data.data);
            setGifs(data.data);
            return data
        } catch (error) {
            console.error('Error fetching GIFs:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        handleGifPicker()
    }, []);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => onClose(false)}
        >
            <View style={styles.gifModalContainer}>
                <View style={styles.gifModalContent}>
                    <View style={styles.header}>
                        <TextBold fontSize={20}>Select a GIF</TextBold>
                        <TouchableOpacity onPress={() => onClose(false)}>
                            {/* Add close icon here */}
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.gifGrid}>
                        {gifs.map((gif, index) => (
                            <TouchableOpacity key={index} onPress={() => onSelectGif(gif.url)}>
                                <Image source={{ uri: gif.url }} style={styles.gifImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    gifModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    gifModalContent: {
        backgroundColor: "#fff",
        borderRadius: 11,
        width: "90%",
        height: "80%",
        alignItems: "center",
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    gifGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    gifImage: {
        width: 100,
        height: 100,
        margin: 5,
    },
});

export default GifPickerModal;