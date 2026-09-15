import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { draftSms, getToday, listMessages, markSmsOpened, type FieldJob } from "../../src/api";
import { colors } from "../../src/theme";

function smsUrl(phone: string, body: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return `sms:${digits}?body=${encodeURIComponent(body)}`;
}

export default function Messages() {
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  const [projectId, setProjectId] = useState("");
  const [drafts, setDrafts] = useState<{ id: string; body: string; opened_composer_at: string | null }[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const today = await getToday();
    setJobs(today.jobs);
    if (!projectId && today.jobs[0]) setProjectId(today.jobs[0].id);
    const msgs = await listMessages();
    setDrafts(msgs.messages);
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      void load().catch((e) => setStatus(e instanceof Error ? e.message : "Could not load"));
    }, [load]),
  );

  async function textClient() {
    if (!projectId) {
      setStatus("Pick a job first.");
      return;
    }
    const draft = await draftSms({ kind: "photo", projectId });
    if (draft.toPhone) {
      await Linking.openURL(smsUrl(draft.toPhone, draft.body));
      await markSmsOpened(draft.id);
    } else {
      setStatus("No phone on file. Draft saved in the shop.");
    }
    await load();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, color: colors.ink }}>Text client</Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>
        Opens your phone’s SMS so the homeowner sees your cell. Not a platform number.
      </Text>
      <View style={{ marginTop: 16, gap: 8 }}>
        {jobs.map((j) => (
          <Pressable
            key={j.id}
            onPress={() => setProjectId(j.id)}
            style={{ padding: 14, backgroundColor: projectId === j.id ? colors.ink : "#fff" }}
          >
            <Text style={{ color: projectId === j.id ? colors.cream : colors.ink }}>{j.name}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => void textClient()}
        style={{ marginTop: 20, height: 56, backgroundColor: colors.brass, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: colors.ink, fontWeight: "600", fontSize: 16 }}>Text client</Text>
      </Pressable>
      {status ? <Text style={{ marginTop: 12, color: colors.warn }}>{status}</Text> : null}
      {drafts.slice(0, 8).map((d) => (
        <View key={d.id} style={{ marginTop: 12, backgroundColor: "#fff", padding: 14 }}>
          <Text style={{ color: colors.muted, fontSize: 11, textTransform: "uppercase" }}>
            {d.opened_composer_at ? "composer opened" : "draft"}
          </Text>
          <Text style={{ marginTop: 6, color: colors.ink }}>{d.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
