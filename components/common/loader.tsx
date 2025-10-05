import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';

const Loader = () => {
    return (
        <BlurView intensity={10} style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
        </BlurView>
    );
};

export default memo(Loader);

const styles = StyleSheet.create({
    loaderContainer: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        zIndex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
});