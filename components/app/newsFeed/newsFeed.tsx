import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import CommentModal from "../../../modals/commentModal/commentModal";
import ImageFullScreenModal from "../../../modals/imageFullScreenModal/imageFullScreenModal";
import TextRegular from "../common/textComponent/textRegular/textRegular";
import NewsFeedItem from "./newsfeedItem";
import NewsFeedShare from "./newsFeedShare";

import Apis from "../../../constants/apis";
import requestUtils from "../../../constants/utils/requestUtils";
import { getColorForUser, RPH } from "../../../constants/utils/utils";

import useErrorHandling from "../../../hooks/useErrorHandling";
import useSliceSelector from "../../../hooks/useSliceSelector";
import useToken from "../../../hooks/useToken";

import FeedPostResponse from "./interfaces/feedPostsResponse";
import NewsFeedProps from "./interfaces/newsFeedShareProps";

const NewsFeed = (props: NewsFeedProps) => {
    const { showUploadButtons, isPostCreated, userColors, setUserColors } = props;
    const [newsFeedPosts, setNewsFeedPosts] = useState<FeedPostResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const { getToken } = useToken();
    const { handleError } = useErrorHandling();
    const messages = useSliceSelector(state => state.language.messages);
    const loggedUserId = useSliceSelector(state => state.auth?.userData?.userId);
    const searchText = useSliceSelector(state => state.app.searchText);
    const isCommentModalVisible = useSliceSelector(state => state.app.commentModal.isVisible);
    const refetchPostsState = useSliceSelector(state => state.app.refetchPosts);

    const pageSize = 10;

    // Helper to normalize backend response shape (support meta or pagination)
    const normalizeResponse = (res: any) => {
        // requestUtils likely returns { data, pagination } or { status, meta, data }
        const data = res.data ?? res;
        const pagination = res.pagination ?? res.meta ?? res.paging ?? null;
        return { data, pagination };
    };

    const refetchedData = useCallback(async () => {
        // don't require loggedUserId — include it only if present
        const accessToken = await getToken();
        // if token missing, still attempt without authorization header
        try {
            const url = `${Apis.newsFeedApi}?pageSize=${pageSize}&page=${currentPage}&search=${encodeURIComponent(searchText || "")}` + (loggedUserId ? `&userId=${loggedUserId}` : '');
            const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : undefined;

            const raw = await requestUtils.request<FeedPostResponse[], void>(url, 'GET', undefined, headers);
            const { data } = normalizeResponse(raw);

            if (!Array.isArray(data)) return;

            setNewsFeedPosts((prevPosts) => {
                const updatedPosts = new Map<string, FeedPostResponse>();

                prevPosts.forEach((post) => updatedPosts.set(String((post as any)._id ?? post.id), post));

                data.forEach((post: FeedPostResponse) => {
                    const id = String((post as any)._id ?? post.id);
                    updatedPosts.set(id, post);
                });

                return Array.from(updatedPosts.values());
            });

            // if pagination provided update totalPages
            const pagination = raw.pagination ?? raw.meta ?? null;
            if (pagination && pagination.totalPages) {
                setTotalPages(pagination.totalPages);
            }

            // update userColors
            const newColors = { ...userColors };
            (data || []).forEach((post: any) => {
                const userId = post?.userdetail?.userId;
                if (userId && !newColors[userId]) {
                    newColors[userId] = getColorForUser(userId);
                }
            });
            setUserColors && setUserColors(newColors);

        } catch (error) {
            handleError(error);
        }
    }, [getToken, currentPage, pageSize, searchText, loggedUserId, userColors, setUserColors, handleError]);

    const fetchData = useCallback(async (page: number) => {
        const accessToken = await getToken();
        const setLoadingState = page === 1 ? setIsLoading : setIsFetchingMore;
        setLoadingState(true);

        try {
            const url = `${Apis.newsFeedApi}?pageSize=${pageSize}&page=${page}&search=${encodeURIComponent(searchText || "")}` + (loggedUserId ? `&userId=${loggedUserId}` : '');
            const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : undefined;

            const raw = await requestUtils.request<FeedPostResponse[], void>(url, 'GET', undefined, headers);
            const { data, pagination } = normalizeResponse(raw);

            if (!Array.isArray(data)) {
                setLoadingState(false);
                if (page === 1) setIsRefreshing(false);
                return;
            }

            setNewsFeedPosts(prevPosts => page === 1 ? data : [...prevPosts, ...data]);
            if (pagination && pagination.totalPages) {
                setTotalPages(pagination.totalPages);
            }

            setLoadingState(false);
            if (page === 1) {
                setIsRefreshing(false);
            }
            setCurrentPage(page);

            const newColors = { ...userColors };
            data.forEach((post: any) => {
                const userId = post?.userdetail?.userId;
                if (userId && !newColors[userId]) {
                    newColors[userId] = getColorForUser(userId);
                }
            });
            setUserColors && setUserColors(newColors);

        } catch (error) {
            handleError(error);
            setIsLoading(false);
            setIsFetchingMore(false);
            setIsRefreshing(false);
        }
    }, [getToken, pageSize, searchText, loggedUserId, userColors, setUserColors, handleError]);

    useEffect(() => {
        // run a lightweight refetch when triggered externally (e.g. new post)
        refetchedData();
    }, [refetchedData, refetchPostsState]);

    useEffect(() => {
        // initial load & re-load on post created or search change
        fetchData(1);
    }, [isPostCreated, fetchData, loggedUserId, searchText]);

    const loadMorePosts = useCallback(() => {
        if (!isFetchingMore && currentPage < totalPages) {
            fetchData(currentPage + 1);
        }
    }, [fetchData, currentPage, totalPages, isFetchingMore]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchData(1);
    }, [fetchData]);

    const renderFooter = () => {
        return isFetchingMore ? <NewsFeedItem isLoading loadingMore /> : null;
    };

    const renderNoPosts = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <TextRegular fontSize={16}>{messages.noPosts}</TextRegular>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={newsFeedPosts}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item, index }) =>
                    <NewsFeedItem
                        item={item}
                        index={index}
                        newsFeedPosts={newsFeedPosts}
                        setNewsFeedPosts={setNewsFeedPosts}
                        isLoading={isLoading}
                        userColors={userColors}
                    />
                }
                keyExtractor={(item, index) => `${(item as any)._id ?? item.id}_${index}`}
                onEndReached={loadMorePosts}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={<NewsFeedShare isLoading={isLoading} showUploadButtons={showUploadButtons} />}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderNoPosts}
            />
            {isCommentModalVisible && (
                <CommentModal />
            )}
            <ImageFullScreenModal />
        </View>
    )
}

export default memo(NewsFeed)

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: RPH(1.2),
        paddingBottom: 100
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20,
        color: '#767676',
        backgroundColor: '#F9F9F9'
    }
})
