import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, Share, StyleSheet, TouchableOpacity, View } from "react-native";
import axios from "axios";

import TextRegular from "../common/textComponent/textRegular/textRegular";

import { RPH, RPW } from "../../../constants/utils/utils";

import OverlayActionsInterface from "./interfaces/overlayActions";
import UserActionsInterface from "./interfaces/userActionsInterface";
import UserActionsProps from "./interfaces/userActionsProps";

import Icons from "../../../constants/icons";

import { setActiveFeedItem, setCommentModal, refetchPosts } from "../../../reducers/app/appSlice";
import useToken from "../../../hooks/useToken";
import useReducerDispatch from "../../../hooks/useReducerDispatch";
import useSliceSelector from "../../../hooks/useSliceSelector";

const UserActions = (props: UserActionsProps) => {
    const { onLongPress, showOverlay, closeOverlay, activeId, commentsCount, reactions } = props;
    const userData = useSliceSelector(state => state.auth.userData);
    const isCommentModalVisible = useSliceSelector(state => state.app.commentModal.isVisible);
    const refetchPostsState = useSliceSelector(state => state.app.refetchPosts);
    const dispatch = useReducerDispatch();
    const [selectedIcon, setSelectedIcon] = useState<string>("");
    const messages = useSliceSelector(state => state.language.messages);
    const { getToken } = useToken();
    const [isLoading, setIsLoading] = useState(false);

    const changeIcon = (selectedIconText: string): ImageSourcePropType => {
        switch (selectedIconText) {
            case messages.likeAction:
                return require("../../../assets/icons/liked.svg");
            case messages.love:
                return require("../../../assets/icons/loved.png");
            case messages.sad:
                return require("../../../assets/icons/sadness.png");
            case messages.shock:
                return require("../../../assets/icons/shocked.png");
            case messages.laugh:
                return require("../../../assets/icons/laughed.png");
            case messages.angry:
                return require("../../../assets/icons/angered.png");
            default:
                return require("../../../assets/icons/likes.svg");
        }
    };

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: "Check out this awesome content!",
            }, {
                dialogTitle: "test",
                subject: "auh",
                tintColor: "#fff"
            });
            if (result.action === Share.sharedAction) {
                console.log(result)
                if (result.activityType) {
                    console.log(`Shared with activity type: ${result.activityType}`);
                } else {
                    console.log("Shared successfully");
                }
            } else if (result.action === Share.dismissedAction) {
                console.log("Share dismissed");
            }
        } catch (error: any) {
            console.log(error.message);
        }
    };

    const handleAction = async (text: string) => {
        closeOverlay();
        await handlerReaction(text);
    };

    const deleteReaction = useCallback(async (reactionId: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;
        let config = {
            method: "delete",
            url: `https://app.bosnett.com/api/v1/users/likes/${reactionId}`,
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        };

        axios.request(config)
            .then(() => {
                dispatch(refetchPosts(!refetchPostsState));
                setIsLoading(false);
                setSelectedIcon("");
            })
            .catch((error) => {
                setIsLoading(false);
                console.log("delete", error);
            });

    }, [refetchPostsState, dispatch]);

    const updateReaction = useCallback(async (reactionId: string, reaction: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        let data = JSON.stringify({
            "like": reaction
        });

        let config = {
            method: "put",
            url: `https://app.bosnett.com/api/v1/users/likes/${reactionId}`,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            data: data
        };

        axios.request(config)
            .then(() => {
                setIsLoading(false);
                dispatch(refetchPosts(!refetchPostsState));
            })
            .catch((error) => {
                setIsLoading(false);
                console.log("update", error);
            });

    }, [dispatch, refetchPostsState]);

    const handlerReaction = useCallback(async (reaction?: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        setIsLoading(true);

        const isLiked = reactions?.find((item) => item.userdetail.userId === userData.userId);
        const isReactionUpdated = reaction && reactions?.find((item) => item.reaction === reaction);

        if (isReactionUpdated && isLiked) {
            await deleteReaction(isLiked._id);
        } else if (isLiked && !isReactionUpdated) {
            await updateReaction(isLiked._id, reaction as string);
        } else {
            let data = JSON.stringify({
                "like": reaction,
                "feedPostId": activeId
            });

            let config = {
                method: "post",
                url: "https://app.bosnett.com/api/v1/users/likes",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                data: data
            };

            axios.request(config)
                .then(() => {
                    setIsLoading(false);
                    dispatch(refetchPosts(!refetchPostsState));
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.log(error);
                });
        }

    }, [activeId, reactions, userData, dispatch, refetchPostsState]);

    const handleLike = async () => {
        if (selectedIcon) {
            await handlerReaction(selectedIcon);
            setSelectedIcon("");
        } else {
            await handlerReaction("Liked");
        }
    }

    const handleComment = () => {
        if (activeId || commentsCount) {
            dispatch(setActiveFeedItem({ postId: activeId || "", commentsCount: commentsCount || 0 }))
        }
        dispatch(setCommentModal(!isCommentModalVisible))
        closeOverlay();
    }

    const handleShare = () => {
        onShare();
        closeOverlay();
    }

    const overlayActions: OverlayActionsInterface[] = [
        {
            text: messages.liked,
            icon: require("../../../assets/icons/like.gif"),
            onPress: () => handleAction(messages.liked)
        },
        {
            text: messages.love,
            icon: require("../../../assets/icons/love.gif"),
            onPress: () => handleAction(messages.love)
        },
        {
            text: messages.sad,
            icon: require("../../../assets/icons/sad.gif"),
            onPress: () => handleAction(messages.sad)
        },
        {
            text: messages.shock,
            icon: require("../../../assets/icons/shock.gif"),
            onPress: () => handleAction(messages.shock)
        },
        {
            text: messages.laugh,
            icon: require("../../../assets/icons/laugh.gif"),
            onPress: () => handleAction(messages.laugh)
        },
        {
            text: messages.angry,
            icon: require("../../../assets/icons/angry.gif"),
            onPress: () => handleAction(messages.angry)
        }
    ];

    const userActions: UserActionsInterface[] = [
        {
            icon: changeIcon(selectedIcon),
            text: selectedIcon ? selectedIcon : messages.likeAction,
            onPress: handleLike,
            onLongPress: onLongPress
        },
        {
            icon: require("../../../assets/icons/comment.svg"),
            text: messages.commentAction,
            onPress: handleComment
        },
        {
            icon: require("../../../assets/icons/share.svg"),
            text: messages.shareAction,
            onPress: handleShare
        },
    ];

    useMemo(() => {
        const reaction = reactions?.find((item) => item.userdetail.userId === userData.userId);

        reaction && setSelectedIcon(reaction?.reaction === "Like" ? "Liked" : reaction.reaction);
    }, [userData, reactions]);

    return (
        <View style={styles.userActions}>
            <View style={styles.actionsContainer}>
                {isLoading
                    ? <ActivityIndicator />
                    : userActions.map((item, index) => {
                        return (
                            <Pressable
                                key={index}
                                onPress={item.onPress}
                                onLongPress={item.onLongPress}
                                style={({ pressed }) => [
                                    styles.action,
                                    pressed && styles.actionOnPress
                                ]}
                            >
                                {
                                    item.text === messages.likeAction ? Icons.likeIcon :
                                        item.text === messages.liked ? Icons.likedIcon :
                                            item.text === messages.commentAction ? Icons.commentIcon :
                                                item.text === messages.shareAction ? Icons.shareIcon :
                                                    <Image
                                                        source={item.icon}
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                }
                                <TextRegular
                                    fontSize={11}
                                    color={index === 0 ?
                                        (selectedIcon === messages.laugh || selectedIcon === messages.sad || selectedIcon === messages.shock ? "#fcba03" :
                                            selectedIcon === messages.angry || selectedIcon === messages.love ? "#fc0303" :
                                                selectedIcon === messages.likeAction ? "#308AFF" :
                                                    "rgba(95, 99, 117, 0.74)") :
                                        "rgba(95, 99, 117, 0.74)"}
                                    style={styles.actionText}
                                >
                                    {item.text}
                                </TextRegular>
                            </Pressable>
                        )
                    })}
            </View>
            {showOverlay && (
                <View style={styles.overlayContainer}>
                    {overlayActions.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} onPress={item.onPress} >
                                <Image style={styles.overlayImg} source={item.icon} />
                            </TouchableOpacity>
                        )
                    })}
                </View>
            )
            }
        </View>
    )
}

export default memo(UserActions)

const styles = StyleSheet.create({
    overlayImg: {
        width: 40,
        height: 40
    },
    userActions: {
        flexDirection: "row",
        justifyContent: "center",
        position: "relative",
    },
    action: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: RPH(1),
        paddingHorizontal: RPW(4)
    },
    actionOnPress: {
        backgroundColor: "#eee",
        borderRadius: 12
    },
    actionText: {
        alignContent: "center",
        paddingLeft: RPW(.9)
    },
    actionsContainer: {
        flexDirection: "row",
        gap: RPW(6),
        alignItems: "center",
        justifyContent: "center"
    },
    overlayContainer: {
        position: "absolute",
        top: RPH(-7),
        paddingHorizontal: 12,
        paddingBottom: 8,
        paddingTop: 6,
        borderRadius: 16,
        left: RPW(10),
        backgroundColor: "#fefefe",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        borderColor: "#eee",
        borderWidth: 1
    }
})