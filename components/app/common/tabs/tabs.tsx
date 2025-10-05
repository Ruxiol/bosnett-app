import { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import TextRegular from '../textComponent/textRegular/textRegular';

import TabsProps from './interfaces/TabsProps';

const Tabs = (props: TabsProps) => {
    const { tabs, onTabPress, activeTab } = props;

    return (
        <View style={styles.tabHeader}>
            {tabs.map((tabHeading) => (
                <TouchableOpacity key={tabHeading.title} onPress={() => onTabPress(tabHeading.title)}>
                    <TextRegular fontSize={16} style={activeTab === tabHeading.title ? styles.activeTab : styles.inactiveTab}>
                        {tabHeading.title}
                    </TextRegular>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default memo(Tabs);

const styles = StyleSheet.create({
    tabHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: '#c1c1c1',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 24
    },
    activeTab: {
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderColor: '#308AFF',
        paddingBottom: 4,
    },
    inactiveTab: {
        color: '#000',
    }
});