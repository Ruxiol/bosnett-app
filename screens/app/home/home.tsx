import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis from "../../../constants/apis";

type ActivityItem = {
  id: number;
  name?: string;
  title?: string; // često HTML string (anchor tagovi)
  content?: { rendered?: string };
  content_stripped?: string;
  date?: string;
  link?: string;
  user_avatar?: { thumb?: string; full?: string };
};

type NewsfeedResponse = {
  status: boolean;
  meta?: {
    total?: number;
    totalPages?: number;
    page?: number;
    per_page?: number;
  };
  data: ActivityItem[];
};

const PER_PAGE = 20;

function stripHtml(input?: string) {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchNewsfeed(page: number, perPage: number, opts: { wpToken?: string | null; appToken?: string | null }) {
  const url = `${Apis.newsFeedApi}?per_page=${perPage}&page=${page}`;
  const headers: Record<string, string> = {};
  if (opts?.wpToken) headers["X-WP-Token"] = opts.wpToken;
  if (opts?.appToken) headers["Authorization"] = `Bearer ${opts.appToken}`;

  const resp = await fetch(url, { headers });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Newsfeed ${resp.status}: ${t}`);
  }
  const json = (await resp.json()) as NewsfeedResponse;
  if (!json || !Array.isArray(json.data)) {
    throw new Error("Invalid newsfeed payload");
  }
  return json;
}

export default function Home() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    const wp = await AsyncStorage.getItem("wpToken"); // direktno string
    const appTokRaw = await AsyncStorage.getItem("token"); // kod vas je spašen JSON.stringify(token)
    let appTok: string | null = null;
    if (appTokRaw) {
      try {
        const parsed = JSON.parse(appTokRaw);
        appTok = typeof parsed === "string" ? parsed : null;
      } catch {
        // nije JSON ili je već string – probaj ga koristiti kao string
        appTok = appTokRaw;
      }
    }
    return { wpToken: wp, appToken: appTok };
  }, []);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { wpToken, appToken } = await loadTokens();
      const res = await fetchNewsfeed(1, PER_PAGE, { wpToken, appToken });
      setItems(res.data);
      setPage(1);
      setTotalPages(res.meta?.totalPages ?? 1);
    } catch (e: any) {
      setError(e?.message || "Greška pri učitavanju feeda");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadTokens]);

  const loadNextPage = useCallback(async () => {
    if (loading) return;
    if (page >= totalPages) return;
    try {
      const next = page + 1;
      const { wpToken, appToken } = await loadTokens();
      const res = await fetchNewsfeed(next, PER_PAGE, { wpToken, appToken });
      setItems((prev) => [...prev, ...res.data]);
      setPage(next);
      setTotalPages(res.meta?.totalPages ?? totalPages);
    } catch (e) {
      // tiho, zadrži postojeće
    }
  }, [loading, page, totalPages, loadTokens]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const renderItem = useCallback(({ item }: { item: ActivityItem }) => {
    const titleText = stripHtml(item.title) || item.name || `Post #${item.id}`;
    const bodyText = stripHtml(item.content_stripped || item.content?.rendered || "");
    const avatar = item.user_avatar?.thumb || item.user_avatar?.full;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {titleText}
            </Text>
            {!!item.date && (
              <Text style={styles.date} numberOfLines={1}>
                {item.date}
              </Text>
            )}
          </View>
        </View>
        {!!bodyText && (
          <Text style={styles.body} numberOfLines={6}>
            {bodyText}
          </Text>
        )}
        {!!item.link && (
          <TouchableOpacity onPress={() => { /* po želji: Linking.openURL(item.link) */ }}>
            <Text style={styles.link} numberOfLines={1}>
              {item.link}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, []);

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadFirstPage}>
          <Text style={{ color: "#fff" }}>Pokušaj ponovo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => String(it.id)}
      renderItem={renderItem}
      contentContainerStyle={items.length === 0 ? styles.centerList : undefined}
      ListEmptyComponent={
        !loading ? <Text>Nema stavki za prikaz.</Text> : null
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReachedThreshold={0.4}
      onEndReached={loadNextPage}
      ListFooterComponent={
        page < totalPages ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  centerList: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e9eef5",
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e9eef5",
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
  },
  date: {
    opacity: 0.6,
    marginTop: 2,
    fontSize: 12,
  },
  body: {
    marginTop: 8,
    lineHeight: 19,
  },
  link: {
    color: "#308AFF",
    marginTop: 8,
  },
  footerLoading: {
    paddingVertical: 16,
  },
  retryBtn: {
    backgroundColor: "#308AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
