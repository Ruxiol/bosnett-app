import { View, StyleSheet } from "react-native";

import { getColorForUser, getUserInitials, RPH, RPW } from "./utils";
import TextBold from "../../components/app/common/textComponent/textBold/textBold";

const userInitialUtils = (firstName: string, lastName: string, userId: string, height = RPH(5.8), width = RPW(11.5)) => {
    const loggedInUserColor = getColorForUser(userId);

    return <View style={[styles.circle, { backgroundColor: loggedInUserColor, height: height, width }]}>
        <TextBold fontSize={16} color='#fff'>
            {getUserInitials(`${firstName} ${lastName}`)}
        </TextBold>
    </View>
};

const styles = StyleSheet.create({
    circle: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
    },
});

export default userInitialUtils;