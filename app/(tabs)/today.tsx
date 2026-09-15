import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { getToday, type FieldJob } from "../../src/api";
import { signOut } from "../../src/auth";
import { flushQueue, listQueue } from "../../src/queue";
import { colors } from "../../src/theme";

export default function Today() {
  const router = useRouter();
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string; starts_at: string; project_name: string | null }[]>([]);
  const [shop, setShop] = useState("Gangbox");
  const [queued, setQueued] = useState(0);
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const net = await NetInfo.fetch();
    const on = Boolean(net.isConnected);
    setOffline(!on);
    setQueued((await listQueue()).length);
    if (!on) return;
    try {
      const data = await getToday();
      setJobs(data.jobs);
      setEvents(data.events);
      setShop(data.companyName);
      setError(null);
      const flushed = await flushQueue();
      if (flushed.sent) setQueued((await listQueue()).length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.paper }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.muted }}>Field</Text>
      <Text style={{ fontSize: 28, marginTop: 4, color: colors.ink }}>{shop}</Text>
      {offline ? (
        <Text style={{ marginTop: 12, backgroundColor: colors.warnBg, color: colors.warn, padding: 12 }}>
          Offline. Photos queue on this phone until you have signal.
        </Text>
      ) : null}
      {queued > 0 ? (
        <Text style={{ marginTop: 12, color: colors.warn }}>{queued} photo(s) queued on this device.</Text>
      ) : null}
      {error ? <Text style={{ marginTop: 12, color: colors.warn }}>{error}</Text> : null}

      <Text style={{ marginTop: 24, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.muted }}>
        Board
      </Text>
      {events.length === 0 ? (
        <Text style={{ marginTop: 8, color: colors.muted }}>Nothing scheduled in the next window.</Text>
      ) : (
        events.map((e) => (
          <View key={e.id} style={{ marginTop: 8, backgroundColor: "#fff", padding: 14 }}>
            <Text style={{ color: colors.ink, fontWeight: "600" }}>{e.title}</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{e.project_name ?? ""}</Text>
          </View>
        ))
      )}

      <Text style={{ marginTop: 24, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.muted }}>
        Jobs
      </Text>
      {jobs.map((j) => (
        <Pressable
          key={j.id}
          onPress={() => router.push(`/job/${j.id}`)}
          style={{ marginTop: 8, backgroundColor: "#fff", padding: 16 }}
        >
          <Text style={{ color: colors.ink, fontWeight: "600" }}>{j.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>
            {j.status} · {[j.city, j.state].filter(Boolean).join(", ")}
          </Text>
        </Pressable>
      ))}
      <Pressable onPress={() => void signOut().then(() => router.replace("/login"))} style={{ marginTop: 32 }}>
        <Text style={{ color: colors.muted, textAlign: "center" }}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
