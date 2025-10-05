import React, { memo, useRef, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, TextLayoutEventData } from 'react-native';

import TextRegular from '../textComponent/textRegular/textRegular';

import { RFS, RLH, RLS } from '../../../../constants/utils/utils';

import useSliceSelector from '../../../../hooks/useSliceSelector';

import ReadMoreProps from './interfaces/ReadMoreProps';

const ReadMore = ({ text, numberOfLines = 2 }: ReadMoreProps) => {
    const [showFullText, setShowFullText] = useState(false);
    const [textLines, setTextLines] = useState(0);
    const textRef = useRef<Text>(null);
    const messages = useSliceSelector(state => state.language.messages);

    const toggleReadMore = () => {
        setShowFullText(!showFullText);
    };

    const onTextLayout = (event: { nativeEvent: TextLayoutEventData }) => {
        const { lines } = event.nativeEvent;
        setTextLines(lines.length);
    };

    return (
        <View style={styles.container}>
            <Text
                ref={textRef}
                numberOfLines={showFullText ? undefined : numberOfLines}
                style={styles.text}
                onTextLayout={onTextLayout}
            >
                {text}
            </Text>
            {textLines > numberOfLines && (
                <TouchableOpacity onPress={toggleReadMore} style={{ paddingTop: 2 }}>
                    <TextRegular fontSize={13} color="#385DFF">
                        {showFullText ? messages.readLess : messages.readMore}
                    </TextRegular>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default memo(ReadMore);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    text: {
        fontSize: RFS(14),
        color: '#5F6373',
        fontFamily: "Lato-Regular",
        fontWeight: "400",
        lineHeight: RLH(RFS(14), 1.3),
        letterSpacing: RLS(RFS(14))
    }
});