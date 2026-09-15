import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { getToday, type FieldJob } from "../../src/api";
import { colors } from "../../src/theme";

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  useFocusEffect(
    useCallback(() => {
      void getToday()
        .then((d) => setJobs(d.jobs))
        .catch(() => setJobs([]));
    }, []),
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, color: colors.ink }}>Jobs</Text>
      {jobs.map((j) => (
        <Pressable
          key={j.id}
          onPress={() => router.push(`/job/${j.id}`)}
          style={{ marginTop: 10, backgroundColor: "#fff", padding: 16 }}
        >
          <Text style={{ fontWeight: "600", color: colors.ink }}>{j.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>
            {j.status} · {[j.address_line1, j.city, j.state].filter(Boolean).join(", ")}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
