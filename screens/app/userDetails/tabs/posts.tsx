import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import FeedPostResponse from "../../../../components/app/newsFeed/interfaces/feedPostsResponse";
import TextRegular from "../../../../components/app/common/textComponent/textRegular/textRegular";
import NewsFeedItem from "../../../../components/app/newsFeed/newsfeedItem";
import CommentModal from "../../../../modals/commentModal/commentModal";
import ImageFullScreenModal from "../../../../modals/imageFullScreenModal/imageFullScreenModal";
import Loader from "../../../../components/common/loader";

import Apis from "../../../../constants/apis";
// ❌ više ne koristimo requestUtils ni useToken ovdje
// import requestUtils from "../../../../constants/utils/requestUtils";
import { RPH } from "../../../../constants/utils/utils";

// import useToken from "../../../../hooks/useToken";
import useErrorHandling from "../../../../hooks/useErrorHandling";
import useSliceSelector from "../../../../hooks/useSliceSelector";

/** --- Minimalni tipovi za BuddyBoss activity --- */
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

function stripHtml(s?: string) {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Mapiranje BuddyBoss → FeedPostResponse koji očekuje NewsFeedItem */
function mapActivityToFeedPost(a: BbActivity): FeedPostResponse {
  const contentHtml = a?.content?.rendered ?? "";
  const contentText = a?.content_stripped ?? stripHtml(contentHtml);
  const displayName = a?.name || stripHtml(a?.title || "");
  const [firstName, ...rest] = (displayName || "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  const images: string[] = Array.isArray(a?.bp_media_ids)
    ? a.bp_media_ids
        .map((m) => m?.attachment_data?.full || m?.attachment_data?.thumb)
        .filter(Boolean) as string[]
    : [];

  const likes =
    typeof a?.favorite_count === "number"
      ? a.favorite_count
      : Array.isArray(a?.reacted_counts)
      ? a.reacted_counts.reduce((sum, x) => sum + (x?.count || 0), 0)
      : 0;

  const mapped: any = {
    _id: String(a.id),
    description: contentText,
    content: contentText,
    createdAt: a.date || "",
    link: a.link || "",
    images,
    likesCount: likes,
    commentsCount: a?.comment_count ?? 0,
    userdetail: {
      userId: String(a?.user_id ?? ""),
      firstName: firstName || displayName || "User",
      lastName,
      userName:
        (displayName || "").toLowerCase().replace(/\s+/g, "-") ||
        `user-${a?.user_id ?? "0"}`,
      profileImage: a?.user_avatar?.full || a?.user_avatar?.thumb || "",
    },
    _raw: a,
  };

  return mapped as FeedPostResponse;
}

/** Dohvati jednu stranicu sa backenda (/api/v1/newsfeed) */
async function fetchBuddyBossPage({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) {
  const wpToken = await AsyncStorage.getItem("wpToken");
  if (!wpToken) {
    throw new Error("WP token nije pronađen. Uloguj se ponovo.");
  }

  const url = `${Apis.newsFeedApi}?per_page=${perPage}&page=${page}`;
  const resp = await fetch(url, { headers: { "X-WP-Token": wpToken } });

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

const Posts = () => {
  const [newsFeedPosts, setNewsFeedPosts] = useState<FeedPostResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { handleError } = useErrorHandling();
  const messages = useSliceSelector((state) => state.language.messages);

  const pageSize = 10;

  const fetchData = useCallback(
    async (page: number) => {
      const setLoadingState = page === 1 ? setIsLoading : setIsFetchingMore;
      setLoadingState(true);

      try {
        const { items, totalPages } = await fetchBuddyBossPage({
          page,
          perPage: pageSize,
        });

        setNewsFeedPosts((prev) => (page === 1 ? items : [...prev, ...items]));
        setTotalPages(totalPages);

        if (page === 1) setIsRefreshing(false);
        setCurrentPage(page);
      } catch (error) {
        handleError(error);
      } finally {
        setLoadingState(false);
      }
    },
    [pageSize, handleError]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

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

  if (isLoading && !isFetchingMore) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={newsFeedPosts}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item, index }) => (
          <NewsFeedItem
            item={item}
            index={index}
            newsFeedPosts={newsFeedPosts}
            setNewsFeedPosts={setNewsFeedPosts}
            isLoading={isLoading}
          />
        )}
        keyExtractor={(item, index) => `${item._id}_${index}`}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderNoPosts}
      />
      <CommentModal />
      <ImageFullScreenModal />
    </View>
  );
};

export default memo(Posts);

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: RPH(1.2),
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
    color: "#767676",
    backgroundColor: "#F9F9F9",
  },
});
