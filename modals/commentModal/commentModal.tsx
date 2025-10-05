import moment from "moment";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Keyboard, Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import Shimmer from "../../components/app/common/shimmer/shimmer";
import TextBold from "../../components/app/common/textComponent/textBold/textBold";
import TextRegular from "../../components/app/common/textComponent/textRegular/textRegular";
import Loader from "../../components/common/loader";

import Apis from "../../constants/apis";
import Icons from "../../constants/icons";
import debounce from "../../constants/utils/debounce";
import requestUtils from "../../constants/utils/requestUtils";
import { getColorForUser, getUserInitials, RPH, RPW } from "../../constants/utils/utils";

import useErrorHandling from "../../hooks/useErrorHandling";
import useReducerDispatch from "../../hooks/useReducerDispatch";
import useSliceSelector from "../../hooks/useSliceSelector";
import useSuccessHandling from "../../hooks/useSuccessHandling";
import useToken from "../../hooks/useToken";
import { setCommentModal } from "../../reducers/app/appSlice";

import IErrorResponse from "../../interfaces/IErrorResponse";
import CommentRequestData from "./interfaces/CommentRequestData";
import CommentResponse from "./interfaces/CommentResponse";
import SubCommentRequestData from "./interfaces/SubCommentRequestData";
import SubCommentResponse from "./interfaces/SubCommentResponse";

const CommmentModal = () => {
    const [newCommentText, setNewCommentText] = useState("");
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [subComments, setSubComments] = useState<{ [key: string]: SubCommentResponse[] }>({});
    const [subCommentPages, setSubCommentPages] = useState<{ [key: string]: number }>({});
    const [subCommentTotalPages, setSubCommentTotalPages] = useState<{ [key: string]: number }>({});
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [newText, setNewText] = useState("");
    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);
    const [selectedCommentId, setSelectedCommentId] = useState('');
    const [selectedSubCommentId, setSelectedSubCommentId] = useState('');
    const [editingText, setIsEditingText] = useState('');

    const { getToken } = useToken();
    const dispatch = useReducerDispatch();
    const { handleError } = useErrorHandling();
    const activePostId = useSliceSelector(state => state.app.newsFeedActiveItem.postId);
    const commentsCount = useSliceSelector(state => state.app.newsFeedActiveItem.commentsCount);
    const isCommentModalVisible = useSliceSelector(state => state.app.commentModal.isVisible);
    const messages = useSliceSelector(state => state.language.messages);
    const userData = useSliceSelector(state => state.auth.userData);
    const loggedInUserColor = useMemo(() => getColorForUser(userData.userId), []);
    const loggedInUserName = `${userData.firstName} ${userData.lastName}`;
    const { handleSuccess } = useSuccessHandling();

    const fetchSubComments = useCallback(async (commentId: string, page = 1) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const { data: subCommentsData, pagination } = await requestUtils.request<SubCommentResponse[], void>(
                `${Apis.userSubComments}?pageSize=10&page=${page}&search&commentId=${commentId}`,
                'GET',
                undefined,
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setSubComments(prev => ({
                ...prev,
                [commentId]: page === 1 ? subCommentsData : [...(prev[commentId] || []), ...subCommentsData]
            }));

            setSubCommentPages(prev => ({ ...prev, [commentId]: page }));
            pagination && setSubCommentTotalPages(prev => ({ ...prev, [commentId]: pagination.totalPages }));

        } catch (error) {
            handleError(error);
        }
    }, [getToken, handleError]);

    const fetchComments = useCallback(async (page = 1) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        if (page === 1) {
            setIsRefreshing(true);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const { data, pagination } = await requestUtils.request<CommentResponse[], void>(
                `${Apis.userComments}?pageSize=10&page=${page}&search&feedPostId=${activePostId}`,
                'GET',
                undefined,
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setComments(prev => page === 1 ? data : [...prev, ...data]);

            setCurrentPage(page);
            if (pagination) {
                setTotalPages(pagination.totalPages);
            }

            if (page === 1) {
                setIsRefreshing(false);
                setIsLoading(false);
            } else {
                setIsFetchingMore(false);
            }

            for (const comment of data) {
                await fetchSubComments(comment._id, 1);
            }

        } catch (error) {
            handleError(error);
            setIsRefreshing(false);
            setIsFetchingMore(false);
            setIsLoading(false);
        }

    }, [getToken, activePostId, handleError]);

    const fetchCommentsDebounced = useMemo(() => debounce((page: number) => fetchComments(page), 300), []);

    const handleSubComment = useCallback((commentId: string) => {
        setExpandedComments(prev => {
            const newExpandedComments = new Set(prev);
            if (newExpandedComments.has(commentId)) {
                newExpandedComments.delete(commentId);
            } else {
                newExpandedComments.add(commentId);
                const currentSubCommentPage = subCommentPages[commentId] || 1;
                const totalSubCommentPages = subCommentTotalPages[commentId] || 1;
                if (currentSubCommentPage < totalSubCommentPages) {
                    fetchSubComments(commentId, currentSubCommentPage + 1);
                }
            }
            return newExpandedComments;
        });
    }, [subCommentPages, subCommentTotalPages, fetchSubComments]);

    useEffect(() => {
        if (isCommentModalVisible) {
            fetchCommentsDebounced(1);
        }
        return () => {
            fetchCommentsDebounced.cancel();
        };

    }, [isCommentModalVisible, fetchCommentsDebounced]);

    const handleAddComment = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const { data } = await requestUtils.request<CommentResponse, CommentRequestData>(
                `${Apis.userComments}`,
                'POST',
                {
                    comment: newCommentText,
                    feedPostId: activePostId
                },
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setComments(prev => [data, ...prev]);
            setNewCommentText("");

        } catch (error) {
            handleError(error);
        }
    }, [getToken, newCommentText, activePostId, handleError]);

    const handlDeleteComment = useCallback(async (commentId: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const { message } = await requestUtils.request<IErrorResponse, undefined>(
                `${Apis.userComments}/${commentId}`,
                'DELETE',
                undefined,
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setComments(prev => prev.filter(comment => comment._id !== commentId));
            setSubComments(prev => {
                const newSubComments = { ...prev };
                delete newSubComments[commentId];
                return newSubComments;
            });
            handleSuccess(message);

        } catch (error) {
            handleError(error);
        }
    }, [getToken, handleSuccess, handleError]);

    const handleEditComment = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const { data } = await requestUtils.request<CommentResponse, { comment: string }>(
                `${Apis.userComments}/${selectedCommentId}`,
                'POST',
                {
                    comment: newCommentText
                },
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setComments(prev => [data, ...prev]);
            setNewCommentText("");

        } catch (error) {
            handleError(error);
        }
    }, [getToken, newCommentText, handleError, selectedCommentId]);

    const handlDeleteSubComment = useCallback(async (commentId: string, subCommentId: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const { message } = await requestUtils.request<IErrorResponse, undefined>(
                `${Apis.userSubComments}/${subCommentId}`,
                'DELETE',
                undefined,
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setSubComments(prev => {
                const updatedSubComments = prev[commentId]?.filter(subComment => subComment._id !== subCommentId) || [];
                const newSubComments = { ...prev, [commentId]: updatedSubComments };

                if (updatedSubComments.length === 0) {
                    setExpandedComments(expandedComments => {
                        const newExpandedComments = new Set(expandedComments);
                        newExpandedComments.delete(commentId);
                        return newExpandedComments;
                    });
                }

                return newSubComments;
            });

            handleSuccess(message);

        } catch (error) {
            handleError(error);
        }
    }, [getToken, handleSuccess, handleError, expandedComments]);

    const handleAddSubComment = useCallback(async () => {
        if (!replyTo) return;

        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            const { data } = await requestUtils.request<SubCommentResponse, SubCommentRequestData>(
                `${Apis.userSubComments}`,
                'POST',
                {
                    comment: newText,
                    commentId: replyTo
                },
                { 'Authorization': `Bearer ${accessToken}` }
            );

            setSubComments(prev => ({
                ...prev,
                [replyTo]: [data, ...(prev[replyTo] || [])]
            }));

            setExpandedComments(prev => {
                const newExpandedComments = new Set(prev);
                newExpandedComments.add(replyTo);
                return newExpandedComments;
            });

            setReplyTo(null);
            setNewText("");

        } catch (error) {
            handleError(error);
        }
    }, [getToken, newText, replyTo, handleError]);

    const handleSend = () => {
        if (selectedCommentId) {
            handleEditComment();
        }
        else if (replyTo) {
            handleAddSubComment();
        } else {
            handleAddComment();
        }
    };

    const closeModal = () => {
        dispatch(setCommentModal(!isCommentModalVisible))
    }

    const resetReplyTo = () => {
        setReplyTo(null);
        setNewText("");
    };

    const handleReply = (commentId: string) => {
        setReplyTo(commentId);
        inputRef.current?.focus();
    };

    const loadMorePosts = useCallback(() => {
        if (!isFetchingMore && currentPage < totalPages) {
            fetchCommentsDebounced(currentPage + 1);
        }
    }, [isFetchingMore, fetchCommentsDebounced, currentPage, totalPages]);

    const renderFooter = useCallback(() => {
        return isFetchingMore ?
            <View>
                <Shimmer isLoading={isLoading} width="40" height="40" borderRadius={26} />
                <Shimmer isLoading={isLoading} width="80" height="40" borderRadius={12} />
            </View> : null;
    }, [isFetchingMore]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchCommentsDebounced(1);
    }, [fetchCommentsDebounced]);

    const handleLongPress = useCallback((commentId: string, commentText: string, subCommentId?: string) => {
        setSelectedCommentId('');
        setSelectedSubCommentId('');
        setNewCommentText('');

        setTimeout(() => {
            setSelectedCommentId(commentId);
            setSelectedSubCommentId(subCommentId || '');
            setIsEditingText(commentText);
        }, 0);
    }, []);

    const confirmDeleteComment = useCallback(() => {
        if (selectedSubCommentId) {
            handlDeleteSubComment(selectedCommentId, selectedSubCommentId);
        } else if (selectedCommentId) {
            handlDeleteComment(selectedCommentId);
        }
        closeOptions();
    }, [selectedCommentId, selectedSubCommentId, handlDeleteComment, handlDeleteSubComment]);

    const handleEdit = useCallback(() => {
        inputRef.current?.focus();
        setNewCommentText(editingText);
    }, [editingText]);

    const closeOptions = useCallback(() => {
        setSelectedCommentId('');
        setSelectedSubCommentId('');
        setNewCommentText('');
        Keyboard.dismiss;
    }, []);

    const commentListItem = useCallback((item: CommentResponse) => {
        const hasReplies = subComments[item._id] && subComments[item._id].length > 0;
        const commentUserName = `${item.userdetail.firstName} ${item.userdetail.lastName}`;
        const isOptionsVisible = selectedCommentId === item._id && !selectedSubCommentId;
        return (
            <View style={styles.commentContainer}>
                <View style={styles.commentBody}>
                    {userData.profileImage
                        ? <View style={styles.circle}>
                            <Image style={styles.roundImg} source={{ uri: `${Apis.homeUrl}${item.userdetail.profileImage}` }} />
                        </View>
                        : <View style={[styles.circle, { backgroundColor: loggedInUserColor }]}>
                            <TextBold fontSize={16} color='#fff'>
                                {getUserInitials(commentUserName)}
                            </TextBold>
                        </View>
                    }
                    <TouchableOpacity
                        style={styles.commentContent}
                        onLongPress={() => handleLongPress(item._id, item.comment, '')}
                    >
                        <TextBold fontSize={12} style={styles.textCapt}>
                            {commentUserName}
                        </TextBold>
                        <TextRegular fontSize={12}>
                            {item.comment}
                        </TextRegular>
                    </TouchableOpacity>
                </View>
                {isOptionsVisible && (
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity onPress={handleEdit} style={styles.button}>
                            <TextRegular fontSize={12} color="gray">Edit</TextRegular>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmDeleteComment} style={styles.button}>
                            <TextRegular fontSize={12} color="red">Delete</TextRegular>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.commentAction}>
                    {hasReplies && (
                        <TouchableOpacity onPress={() => handleSubComment(item._id)}>
                            <TextBold fontSize={12} color='#555'>
                                {expandedComments.has(item._id) ? 'Hide Replies' : `Replies ${subComments[item._id]?.length || 0}`}
                            </TextBold>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => handleReply(item._id)}>
                        <TextBold fontSize={12} color="#555">
                            {messages.reply}
                        </TextBold>
                    </TouchableOpacity>
                    <TextBold fontSize={12} color="#555" style={styles.textCapt}>
                        {moment(item.createdDate).fromNow()}
                    </TextBold>
                </View>
                {expandedComments.has(item._id) && (
                    <FlatList
                        data={subComments[item._id]}
                        keyExtractor={(reply: SubCommentResponse, index) => `${reply._id}_${index}`}
                        renderItem={({ item }) => {
                            const subCommentUserName = `${item.userdetail.firstName} ${item.userdetail.lastName}`;
                            const isSubOptionsVisible = selectedSubCommentId === item._id;
                            return (
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={styles.replyContainer}>
                                        <View style={styles.subContainer}>
                                            {userData.profileImage
                                                ? <View style={styles.circle}>
                                                    <Image style={styles.roundImg} source={{ uri: `${Apis.homeUrl}${item.userdetail.profileImage}` }} />
                                                </View>
                                                : <View style={[styles.circle, { backgroundColor: loggedInUserColor }]}>
                                                    <TextBold fontSize={16} color='#fff'>
                                                        {getUserInitials(subCommentUserName)}
                                                    </TextBold>
                                                </View>
                                            }
                                            <TouchableOpacity
                                                style={styles.commentContent}
                                                onLongPress={() => handleLongPress(item.commentId, item.comment, item._id)}>
                                                <TextBold fontSize={12} style={styles.textCapt}>
                                                    {subCommentUserName}
                                                </TextBold>
                                                <TextRegular fontSize={12}>
                                                    {item.comment}
                                                </TextRegular>
                                            </TouchableOpacity>
                                            {isSubOptionsVisible && (
                                                <View style={styles.optionsContainer}>
                                                    <TouchableOpacity onPress={handleEdit} style={styles.button}>
                                                        <TextRegular fontSize={12} color="gray">Edit</TextRegular>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={confirmDeleteComment} style={styles.button}>
                                                        <TextRegular fontSize={12} color="red">Delete</TextRegular>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.timeContainer}>
                                            <TextBold fontSize={12} color="#555" style={styles.textCapt}>
                                                {moment(item.createdDate).fromNow()}
                                            </TextBold>
                                        </View>
                                    </View>
                                </View>
                            )
                        }
                        }
                    />
                )}
            </View>
        )
    }, [subComments, expandedComments, userData, loggedInUserColor, messages, selectedCommentId, selectedSubCommentId]);

    const CommentList = memo(() => (
        <FlatList
            ref={flatListRef}
            style={styles.commentList}
            data={comments}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            keyExtractor={(item: CommentResponse, index) => `${item._id}_${index}`}
            renderItem={({ item }) => commentListItem(item)}
            onEndReached={loadMorePosts}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
        />
    ));

    return (
        <Modal visible={isCommentModalVisible} transparent={true}>
            <TouchableOpacity
                style={styles.modalBackground}
                activeOpacity={1}
                onPress={() => { resetReplyTo(); closeOptions() }}
            >
                <View style={styles.commentModalContainer}>
                    <View style={styles.commentModalContent}>
                        <View style={styles.reactedContainer}>
                            <TouchableOpacity onPress={closeModal} style={styles.backIcon}>
                                {Icons.backIcon}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.likeContainer}>
                            <View style={styles.likeText}>
                                {Icons.commentLikedIcon}
                                <TextRegular fontSize={11}>
                                    You, Anin Kale and 205 others
                                </TextRegular>
                            </View>
                            <TextRegular fontSize={11}>
                                {commentsCount.toString()} {commentsCount === 1 ? messages.comment : messages.comments}
                            </TextRegular>
                        </View>
                        <View style={[styles.pt10, Keyboard ? styles.pb80 : null, isLoading && styles.loaderCenter]}>
                            {commentsCount === 0 && isLoading ? (
                                <TextRegular fontSize={14} style={{ textAlign: 'center' }}>
                                    {messages.noComments}
                                </TextRegular>
                            ) : isLoading ? (
                                <Loader />
                            ) : <CommentList />
                            }
                        </View>
                    </View>
                    <View style={styles.writeComment}>
                        {userData.profileImage
                            ? <View style={styles.circle}>
                                <Image style={styles.roundImg} source={{ uri: `${Apis.homeUrl}${userData.profileImage}` }} />
                            </View>
                            : <View style={[styles.circle, { backgroundColor: loggedInUserColor }]}>
                                <TextBold fontSize={16} color='#fff'>
                                    {getUserInitials(loggedInUserName)}
                                </TextBold>
                            </View>
                        }
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder={replyTo
                                ? `${messages.replyingTo} ${loggedInUserName}`
                                : `${messages.writeComment}...`}
                            value={replyTo ? newText : newCommentText}
                            onChangeText={replyTo ? setNewText : setNewCommentText}
                        />
                        <View style={styles.iconContainer}>
                            <TouchableOpacity>
                                {Icons.cameraIcon2}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSend}>
                                {Icons.sendIcon}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default memo(CommmentModal);

const styles = StyleSheet.create({
    optionsContainer: {
        position: 'absolute',
        top: 6,
        right: 60,
        backgroundColor: '#fafafa',
        borderRadius: 5,
        padding: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
        zIndex: 1000,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#cecece'
    },
    button: {
        marginHorizontal: 5,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconSpace: {
        paddingHorizontal: RPW(4),
        paddingVertical: RPH(1)
    },
    writeComment: {
        flexDirection: "row",
        marginTop: 30,
        gap: 10,
        paddingLeft: RPW(2)
    },
    subContainer: {
        flexDirection: 'row',
        gap: 8
    },
    pb80: {
        paddingBottom: 80
    },
    pt10: {
        paddingTop: 10
    },
    loaderCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    likeBtn: {
        alignSelf: 'center',
        flex: 1,
        alignItems: 'flex-end',
    },
    commentModalContent: {
        flex: 1,
        flexGrow: 1
    },
    textCapt: {
        textTransform: 'capitalize'
    },
    timeContainer: {
        paddingLeft: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentModalContainer: {
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: RPH(1),
        flex: 1,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        position: "relative"
    },
    likeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: "center",
        paddingHorizontal: 15
    },
    likeText: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3
    },
    circle: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 70,
        overflow: 'hidden'
    },
    roundImg: {
        width: "100%",
        height: '100%'
    },
    commentContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
        paddingLeft: RPW(3),
        position: 'relative'
    },
    commentList: {
        height: '100%',
        maxHeight: 600
    },
    commentBody: {
        flexDirection: 'row',
        gap: 10
    },
    commentContent: {
        paddingLeft: 8,
        paddingRight: 14,
        paddingVertical: 6,
        backgroundColor: "'rgba(221, 221, 221, 0.5)'",
        borderRadius: 10,
        position: 'relative',
        maxWidth: '80%'
    },
    commentAction: {
        flexDirection: "row",
        gap: 8,
        paddingLeft: 55,
        paddingBottom: 12
    },
    input: {
        borderRadius: 10,
        backgroundColor: "'rgba(221, 221, 221, 1)'",
        padding: 8,
        width: "82%",
        paddingRight: 114
    },
    iconContainer: {
        flexDirection: "row",
        alignSelf: "center",
        gap: 10,
        position: "absolute",
        right: 30
    },
    reactedText: {
        paddingTop: 6
    },
    backIcon: {
        paddingHorizontal: RPW(4),
        paddingVertical: RPH(2)
    },
    reactedContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },
    replyContainer: {
        paddingLeft: 40,
        borderLeftWidth: 1,
        borderLeftColor: "#ddd",
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 16,
        marginTop: 0
    },
    dialogContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#dedede',
        alignItems: 'center',
    },
    dialogButtons: {
        flexDirection: 'row',
        gap: 10
    }
})