import { memo, useEffect, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import TextRegular from "../common/textComponent/textRegular/textRegular";

import Icons from "../../../constants/icons";
import debounce from "../../../constants/utils/debounce";

import { RPH, RPW } from "../../../constants/utils/utils";
import PostDotMenuProps from "./interfaces/postDotMenuProps";

import useSliceSelector from "../../../hooks/useSliceSelector";

const PostDotMenu = (props: PostDotMenuProps) => {
    const { activeIndex, onMenuPress, index, isMenuVisible, setIsMenuVisible, postId } = props;
    const messages = useSliceSelector(state => state.language.messages);

    useEffect(() => {
        setIsMenuVisible(activeIndex === index);
    }, [activeIndex, index]);

    const toggleMenu = useMemo(() =>
        debounce((isOpen: boolean) => {
            setIsMenuVisible(isOpen);
            if (!isOpen) {
                onMenuPress(-1);
            } else {
                onMenuPress(index);
            }
        }, 100),
        [index, onMenuPress]
    );

    useEffect(() => {
        return () => {
            toggleMenu.cancel();
        };
    }, [toggleMenu]);

    const handleIconPress = () => {
        toggleMenu(!isMenuVisible);
    };

    const handleMenuItemPress = (action: string) => {
        console.log(`Selected action: ${action}`);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleIconPress}>
                {Icons.dotsIcon}
            </TouchableOpacity>
            {
                isMenuVisible && (
                    <View style={styles.menu}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('delete')}>
                            {Icons.delIcon}
                            <TextRegular fontSize={14} color="#AFB1B9">
                                {messages.delete}
                            </TextRegular>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('report')}>
                            {Icons.reportIcon}
                            <TextRegular fontSize={14} color="#AFB1B9">
                                {messages.report}
                            </TextRegular>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('pin')}>
                            {Icons.pinIcon}
                            <TextRegular fontSize={14} color="#AFB1B9">
                                {messages.pin}
                            </TextRegular>
                        </TouchableOpacity>
                    </View>
                )
            }
        </View>
    );
};

export default memo(PostDotMenu);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: RPW(2.5),
        top: RPH(-1),
        zIndex: 1
    },
    menu: {
        position: 'absolute',
        top: 6,
        right: 25,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        elevation: 5,
        width: 100,
        paddingHorizontal: 20,
        gap: 10
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
});