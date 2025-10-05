import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CommentModal from "../../../modals/commentModal/commentModal";
import ImageFullScreenModal from "../../../modals/imageFullScreenModal/imageFullScreenModal";
import TextRegular from "../common/textComponent/textRegular/textRegular";
import NewsFeedItem from "./newsfeedItem";
import NewsFeedShare from "./newsFeedShare";

import Apis from "../../../constants/apis";
// ❌ ukidamo requestUtils jer koristimo fetch na proxy
// import requestUtils from "../../../constants/utils/requestUtils";
import { getColorForUser, RPH } from "../../../constants/utils/utils";

import useErrorHandling from "../../../hooks/useErrorHandling";
import useSliceSelector from "../../../hooks/useSliceSelector";
// ❌ ne koristimo više app token ovdje
// import useToken from "../../../hooks/useToken";

import FeedPostResponse from "./interfaces/feedPostsResponse";
import NewsFeedProps from "./interfaces/newsFeedShareProps";

/** --- Tipovi iz BuddyBoss API-ja (minimalni dio koji koristimo) --- */
type BbMediaItem = {
  attachment_data?: {
    full?: string;
    thumb?: string;
    media_album_cover?: string;
    [k: string]: any;
  };
};

type BbActivity = {
  id: number;
  user_id?: number;
  name?: string;
  title?: string;
  content?: { rendered?: string };
  content_stripped?: string;
  date?: string;
  link?: string;
  user_avatar?: { full?: string; thumb?: string };
  favorite_count?: number;
  reacted_counts?: Array<{ id?: number; count?: number }>;
  comment_count?: number;
  bp_media_ids?: BbMediaItem[];
  [k: string]: any;
};

/** Pomoćna: strip HTML tagova */
function stripHtml(s?: string) {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Mapiranje BuddyBoss activity → tvoj FeedPostResponse oblik */
function mapActivityToFeedPost(a: BbActivity): FeedPostResponse {
  const contentHtml = a?.content?.rendered ?? "";
  const contentText = a?.content_stripped ?? stripHtml(contentHtml);
  const displayName = a?.name || stripHtml(a?.title || "");
  const [firstName, ...rest] = (displayName || "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  // Skupi slike iz bp_media_ids
  const images: string[] = Array.isArray(a?.bp_media_ids)
    ? a.bp_media_ids
        .map((m) => m?.attachment_data?.full || m?.attachment_data?.thumb)
        .filter(Boolean) as string[]
    : [];

  // Lajkovi / reakcije
  const likes =
    typeof a?.favorite_count === "number"
      ? a.favorite_count
      : Array.isArray(a?.reacted_counts)
      ? a.reacted_counts.reduce((sum, x) => sum + (x?.count || 0), 0)
      : 0;

  // Minimalni objekat koji NewsFeedItem očekuje (_id + userdetail.userId)
  const mapped: any = {
    _id: String(a.id),
    // polja za prikaz (neka budu kompatibilna)
    description: contentText,
    content: contentText,
    createdAt: a.date || "",
    link: a.link || "",
    images, // ako NewsFeedItem prikazuje slike, neka ih nađe ovdje

    likesCount: likes,
    commentsCount: a?.comment_count ?? 0,

    userdetail: {
      userId: String(a?.user_id ?? ""), // BITNO: koristi se u userColors
      firstName: firstName || displayName || "User",
      lastName,
      userName:
        (displayName || "").toLowerCase().replace(/\s+/g, "-") || `user-${a?.user_id ?? "0"}`,
      profileImage: a?.user_avatar?.full || a?.user_avatar?.thumb || "",
    },

    // čuvamo raw za svaki slučaj debug-a u drugim komponentama
    _raw: a,
  };

  return mapped as FeedPostResponse;
}

/** Fetch na tvoj backend proxy (/api/v1/newsfeed) sa WP tokenom */
async function fetchBuddyBossPage({
  page,
  perPage,
  searchText,
  userId,
}: {
  page: number;
  perPage: number;
  searchText?: string;
  userId?: string | number | null;
}) {
  const wpToken = await AsyncStorage.getItem("wpToken");
  if (!wpToken) {
    throw new Error("WP token nije pronađen. Uloguj se ponovo.");
  }

  const qs = new URLSearchParams();
  qs.set("per_page", String(perPage));
  qs.set("page", String(page));
  if (searchText) qs.set("search", String(searchText));
  if (userId) qs.set("user_id", String(userId));

  const url = `${Apis.newsFeedApi}?${qs.toString()}`;
  const resp = await fetch(url, {
    headers: { "X-WP-Token": wpToken },
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Newsfeed ${resp.status}: ${t}`);
  }

  const json = await resp.json(); // { status, meta, data: BbActivity[] }
  const meta = json?.meta || {};
  const data: BbActivity[] = Array.isArray(json?.data) ? json.data : [];

  return {
    items: data.map(mapActivityToFeedPost),
    totalPages: Number(meta?.totalPages ?? 1),
  };
}

const NewsFeed = (props: NewsFeedProps) => {
  const { showUploadButtons, isPostCreated, userColors, setUserColors } = props;
  const [newsFeedPosts, setNewsFeedPosts] = useState<FeedPostResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { handleError } = useErrorHandling();
  const messages = useSliceSelector((state) => state.language.messages);
  const loggedUserId = useSliceSelector((state) => state.auth.userData.userId);
  const searchText = useSliceSelector((state) => state.app.searchText);
  const isCommentModalVisible = useSliceSelector((state) => state.app.commentModal.isVisible);
  const refetchPostsState = useSliceSelector((state) => state.app.refetchPosts);

  const pageSize = 10;

  /** Re-fetch trenutne stranice (npr. poslije akcija) */
  const refetchedData = useCallback(async () => {
    try {
      const { items, totalPages } = await fetchBuddyBossPage({
        page: currentPage,
        perPage: pageSize,
        searchText,
        userId: loggedUserId,
      });

      setNewsFeedPosts((prevPosts) => {
        const updated = new Map<string, FeedPostResponse>();
        prevPosts.forEach((p: any) => updated.set(String(p._id), p));
        items.forEach((p: any) => updated.set(String(p._id), p));
        return Array.from(updated.values());
      });

      setTotalPages(totalPages);

      // user boje
      const newColors: Record<string, string> = { ...(userColors || {}) };
      items.forEach((post: any) => {
        const uid = post?.userdetail?.userId;
        if (uid && !newColors[uid]) newColors[uid] = getColorForUser(uid);
      });
      setUserColors && setUserColors(newColors);
    } catch (error) {
      handleError(error);
    }
  }, [currentPage, pageSize, searchText, loggedUserId, userColors, setUserColors, handleError]);

  /** Učitaj određenu stranicu */
  const fetchData = useCallback(
    async (page: number) => {
      const setLoadingState = page === 1 ? setIsLoading : setIsFetchingMore;
      setLoadingState(true);
      try {
        const { items, totalPages } = await fetchBuddyBossPage({
          page,
          perPage: pageSize,
          searchText,
          userId: loggedUserId,
        });

        setNewsFeedPosts((prev) => (page === 1 ? items : [...prev, ...items]));
        setTotalPages(totalPages);

        if (page === 1) setIsRefreshing(false);
        setCurrentPage(page);

        // user boje
        const newColors: Record<string, string> = { ...(userColors || {}) };
        items.forEach((post: any) => {
          const uid = post?.userdetail?.userId;
          if (uid && !newColors[uid]) newColors[uid] = getColorForUser(uid);
        });
        setUserColors && setUserColors(newColors);
      } catch (error) {
        handleError(error);
      } finally {
        setLoadingState(false);
      }
    },
    [pageSize, searchText, loggedUserId, userColors, setUserColors, handleError]
  );

  useEffect(() => {
    refetchedData();
  }, [refetchedData, refetchPostsState]);

  useEffect(() => {
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index }) => (
          <NewsFeedItem
            item={item}
            index={index}
            newsFeedPosts={newsFeedPosts}
            setNewsFeedPosts={setNewsFeedPosts}
            isLoading={isLoading}
            userColors={userColors}
          />
        )}
        keyExtractor={(item: any, index) => `${item._id}_${index}`}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<NewsFeedShare isLoading={isLoading} showUploadButtons={showUploadButtons} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderNoPosts}
      />
      {isCommentModalVisible && <CommentModal />}
      <ImageFullScreenModal />
    </View>
  );
};

export default memo(NewsFeed);

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: RPH(1.2),
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
    color: "#767676",
    backgroundColor: "#F9F9F9",
  },
});
`
