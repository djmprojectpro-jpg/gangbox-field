import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { draftSms, getJob, markSmsOpened, setJobStatus, uploadPhoto, type FieldJob } from "../../src/api";
import { enqueue } from "../../src/queue";
import { colors } from "../../src/theme";

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<FieldJob | null>(null);
  const [photos, setPhotos] = useState<{ id: string; tag: string; data_url: string }[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    const data = await getJob(id);
    setJob(data.job);
    setPhotos(data.photos);
  }

  useEffect(() => {
    void load().catch((e) => setStatus(e instanceof Error ? e.message : "Could not load"));
  }, [id]);

  async function shoot() {
    if (!id) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setStatus("Camera permission is required.");
      return;
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true });
    if (shot.canceled || !shot.assets[0]?.base64) return;
    const dataUrl = `data:image/jpeg;base64,${shot.assets[0].base64}`;
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      await enqueue({
        id: `${Date.now()}`,
        projectId: id,
        tag: "during",
        caption: "during",
        dataUrl,
        createdAt: new Date().toISOString(),
      });
      setStatus("No signal. Photo queued on this phone.");
      return;
    }
    await uploadPhoto({ projectId: id, tag: "during", caption: "during", dataUrl });
    await load();
    setStatus("Photo on the job.");
  }

  async function textClient() {
    if (!id) return;
    const draft = await draftSms({ kind: "photo", projectId: id });
    if (draft.toPhone) {
      const digits = draft.toPhone.replace(/[^\d+]/g, "");
      await Linking.openURL(`sms:${digits}?body=${encodeURIComponent(draft.body)}`);
      await markSmsOpened(draft.id);
    } else {
      setStatus("No phone on file.");
    }
  }

  if (!job) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, padding: 16 }}>
        <Text style={{ color: colors.muted }}>{status ?? "Loading job…"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ fontSize: 24, color: colors.ink }}>{job.name}</Text>
      <Text style={{ color: colors.muted, marginTop: 6 }}>{job.status}</Text>
      <Text style={{ color: colors.muted, marginTop: 6 }}>
        {[job.address_line1, job.city, job.state, job.zip].filter(Boolean).join(", ")}
      </Text>
      <Text style={{ marginTop: 12, color: colors.ink }}>{job.scope_text}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
        {(["in_progress", "completed"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() =>
              void setJobStatus(job.id, s)
                .then(() => load())
                .catch((e) => setStatus(e instanceof Error ? e.message : "Status failed"))
            }
            style={{
              flex: 1,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: job.status === s ? colors.brass : colors.paper2,
            }}
          >
            <Text style={{ color: colors.ink }}>{s === "in_progress" ? "In progress" : "Completed"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
        <Pressable
          onPress={() => void shoot()}
          style={{ flex: 1, height: 52, backgroundColor: colors.brass, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Camera</Text>
        </Pressable>
        <Pressable
          onPress={() => void textClient()}
          style={{ flex: 1, height: 52, backgroundColor: colors.paper2, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Text client</Text>
        </Pressable>
      </View>
      {status ? <Text style={{ marginTop: 12, color: colors.warn }}>{status}</Text> : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
        {photos.slice(0, 9).map((p) => (
          <Image key={p.id} source={{ uri: p.data_url }} style={{ width: "31%", aspectRatio: 1, backgroundColor: colors.paper2 }} />
        ))}
      </View>
    </ScrollView>
  );
}
