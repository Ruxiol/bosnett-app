import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import MainWapper from "../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";
import TextRegular from "../../../components/app/common/textComponent/textRegular/textRegular";
import AppHeader from "../../../components/app/appHeader/appHeader";

import { RPH, RPW } from "../../../constants/utils/utils";

import useSliceSelector from "../../../hooks/useSliceSelector";

const Notifications = () => {
    const messages = useSliceSelector(state => state.language.messages);

    return (
        <MainWapper>
            <AppHeader icon={true} headerText={messages.notifications} />
            <LinearGradient
                colors={['rgba(39, 60, 255, 0.20)', 'rgba(0, 163, 255, 0.20)']}
                style={styles.container}
            >
                <View style={styles.headText}>
                    <TextBold fontSize={16}>{messages.new}</TextBold>
                </View>
                <ScrollView>
                    <View style={styles.friendListContainer}>
                        <View style={styles.friendListItem}>
                            <View style={styles.friendListContent}>
                                <TouchableOpacity>
                                    <View style={styles.friendListCircle}>
                                        <Image style={styles.activeRoundImg} source={require("../../../assets/dummy-profile.png")} />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.textContainer}>
                                    <TextRegular fontSize={12}>
                                        Darrell Trivedi has a new story up.
                                    </TextRegular>
                                    <TextRegular fontSize={12}>
                                        What’s your reaction?
                                    </TextRegular>
                                    <TextRegular fontSize={11} color="#555">
                                        2 hours ago
                                    </TextRegular>
                                </View>
                                <View style={styles.dotsContainer}>
                                    {/* <PostDotMenu /> */}
                                </View>
                            </View>
                        </View>
                        <View style={styles.friendListItem}>
                            <View style={styles.friendListContent}>
                                <TouchableOpacity>
                                    <View style={styles.friendListCircle}>
                                        <Image style={styles.activeRoundImg} source={require("../../../assets/dummy-profile.png")} />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.textContainer}>
                                    <TextRegular fontSize={12}>
                                        Darrell Trivedi has a new story up.
                                    </TextRegular>
                                    <TextRegular fontSize={12}>
                                        What’s your reaction?
                                    </TextRegular>
                                    <TextRegular fontSize={11} color="#555">
                                        2 hours ago
                                    </TextRegular>
                                </View>
                                <View style={styles.dotsContainer}>
                                    {/* <PostDotMenu /> */}
                                </View>
                            </View>
                        </View>
                        <View style={styles.headText}>
                            <TextBold fontSize={16}>{messages.earlier}</TextBold>
                        </View>
                        <View style={styles.friendListItem}>
                            <View style={styles.friendListContent}>
                                <TouchableOpacity>
                                    <View style={styles.friendListCircle}>
                                        <Image style={styles.activeRoundImg} source={require("../../../assets/dummy-profile.png")} />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.textContainer}>
                                    <TextRegular fontSize={12}>
                                        Darrell Trivedi has a new story up.
                                    </TextRegular>
                                    <TextRegular fontSize={12}>
                                        What’s your reaction?
                                    </TextRegular>
                                    <TextRegular fontSize={11} color="#555">
                                        2 hours ago
                                    </TextRegular>
                                </View>
                                <View style={styles.dotsContainer}>
                                    {/* <PostDotMenu /> */}
                                </View>
                            </View>
                        </View>
                        <View style={styles.friendListItem}>
                            <View style={styles.friendListContent}>
                                <TouchableOpacity>
                                    <View style={styles.friendListCircle}>
                                        <Image style={styles.activeRoundImg} source={require("../../../assets/dummy-profile.png")} />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.textContainer}>
                                    <TextRegular fontSize={12}>
                                        Darrell Trivedi has a new story up.
                                    </TextRegular>
                                    <TextRegular fontSize={12}>
                                        What’s your reaction?
                                    </TextRegular>
                                    <TextRegular fontSize={11} color="#555">
                                        2 hours ago
                                    </TextRegular>
                                </View>
                                <View style={styles.dotsContainer}>
                                    {/* <PostDotMenu /> */}
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </MainWapper>
    )
}

export default Notifications

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    friendListCircle: {
        width: 55,
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
    },
    friendListContainer: {
        // gap: 24
    },
    activeRoundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: 55
    },
    friendListItem: {
        paddingHorizontal: RPW(4.6),
        paddingVertical: RPH(1.1),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    friendListContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: RPW(3.4)
    },
    dotsContainer: {
        position: "absolute",
        top: 0,
        right: 20
    },
    textContainer: {
        paddingRight: 60,
        flex: 1,
        gap: 2
    },
    headText: {
        paddingHorizontal: 22,
        paddingVertical: 8
    }
})