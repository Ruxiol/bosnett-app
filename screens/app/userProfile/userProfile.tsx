import { StyleSheet, View, Image, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { memo, useMemo } from "react";

import Card from "../../../components/app/common/card/card";
import CardItem from "../../../components/app/common/card/interfaces/CardItem";
import MainWapper from "../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../components/app/common/textComponent/textBold/textBold";
import TextRegular from "../../../components/app/common/textComponent/textRegular/textRegular";

import Apis from "../../../constants/apis";
import Icons from "../../../constants/icons";
import { RPW, RPH, getUserInitials, RFS, getColorForUser } from "../../../constants/utils/utils";

import useSliceSelector from "../../../hooks/useSliceSelector";
import useReducerDispatch from "../../../hooks/useReducerDispatch";

import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";

const { height } = Dimensions.get("window");

const UserProfile = () => {
    const userData = useSliceSelector(state => state.auth.userData);
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const dispatch = useReducerDispatch();
    const messages = useSliceSelector(state => state.language.messages);
    const currentLanguage = useSliceSelector(state => state.language.language);
    const language = currentLanguage === 'en' ? messages.english : messages.bosnia;
    const name = `${userData.firstName} ${userData.lastName}`;
    const userInitials = useMemo(() => getUserInitials(name), [userData]);
    const loggedInUserColor = useMemo(() => getColorForUser(userData.userId), []);

    const goBack = () => {
        navigation.goBack();
    }

    const cardsData: CardItem[][] = [
        [
            {
                icon: Icons.editProfile,
                text: messages.editProfileInfo,
                screen: 'EditProfile',
            },
            {
                icon: Icons.editLanguage,
                text: messages.language,
                screen: 'Language',
                additionalText: language
            }
        ],
        [
            {
                icon: Icons.editSecurity,
                text: messages.security,
                screen: 'Security',
            }
        ],
        [
            {
                icon: Icons.editHelp,
                text: messages.helpSupport,
                screen: 'Support',
            },
            {
                icon: Icons.editContact,
                text: messages.contactUs,
                screen: 'Contact',
            },
            {
                icon: Icons.editPrivacy,
                text: messages.privacy,
                screen: 'Privacy',
            }
        ]
    ];

    return (
        <MainWapper>
            <View style={styles.container}>
                <View style={styles.imgContainer}>
                    <Image
                        source={require('../../../assets/dragon.png')}
                        style={styles.backgroundImage}
                    />
                </View>
                <View style={styles.header}>
                    <View style={styles.btnContainer}>
                        <TouchableOpacity onPress={goBack} style={styles.backIcon}>
                            {Icons.backIcon}
                        </TouchableOpacity>
                        <TouchableOpacity>
                            {Icons.userEditIcon}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.imagesContainer}>
                        {userData.profileImage
                            ? <View style={styles.circle}>
                                <Image style={styles.roundImg} source={{ uri: `${Apis.homeUrl}${userData.profileImage}` }} />
                            </View>
                            : <View style={[styles.circle, { backgroundColor: loggedInUserColor }]}>
                                <TextBold fontSize={40} color='#fff'>
                                    {userInitials}
                                </TextBold>
                            </View>
                        }
                    </View>
                </View>
                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <TextBold fontSize={RFS(26)} style={styles.textCap}>
                            {name}
                        </TextBold>
                        <TextRegular fontSize={RFS(15)}>
                            {userData.email}
                        </TextRegular>
                    </View>
                    <ScrollView
                        style={styles.scrollConainer}
                        contentContainerStyle={styles.scrollSpacing}
                    >
                        <View style={styles.cards}>
                            {cardsData.map((cardItem, index) => {
                                return (
                                    <Card cardItem={cardItem} key={index} />
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </MainWapper>
    )
}

export default memo(UserProfile);

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFDFA",
        flex: 1
    },
    scrollConainer: {
        height: height * 0.42,
        width: '100%'
    },
    backIcon: {
        paddingHorizontal: RPW(4),
        paddingVertical: RPH(2)
    },
    textCap: {
        textTransform: 'capitalize'
    },
    scrollSpacing: {
        paddingBottom: RPH(5)
    },
    imgContainer: {
        height: height * 0.30,
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0
    },
    content: {
        alignItems: "center",
        gap: RPH(3.6)
    },
    cards: {
        paddingHorizontal: RPH(3),
        gap: RPH(2)
    },
    card: {
        borderWidth: 1,
        borderColor: '#e1e1e1',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'flex-start',
        gap: RPH(1.6)
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: RPW(3.2)
    },
    textContainer: {
        alignItems: 'center',
        paddingTop: RPH(10),
        gap: RPH(.4)
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    header: {
        height: height * 0.30,
        paddingHorizontal: RPW(4),
        position: 'relative',
        paddingTop: RPH(3),
        zIndex: 1
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    imagesContainer: {
        justifyContent: 'flex-end',
        alignItems: "center",
        position: 'absolute',
        bottom: -66,
        left: '50%',
        transform: [{ translateX: -50 }]
    },
    circle: {
        width: 137,
        height: 137,
        overflow: "hidden",
        borderRadius: 70,
        justifyContent: "center",
        alignItems: "center",
    },
    roundImg: {
        width: "100%",
        height: '100%'
    },
})