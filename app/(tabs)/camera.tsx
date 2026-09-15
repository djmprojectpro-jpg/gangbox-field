import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { getToday, uploadPhoto, type FieldJob } from "../../src/api";
import { enqueue } from "../../src/queue";
import { colors } from "../../src/theme";

const TAGS = ["before", "during", "after", "defect", "hero", "safety"] as const;

export default function Camera() {
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  const [projectId, setProjectId] = useState("");
  const [tag, setTag] = useState<(typeof TAGS)[number]>("during");
  const [status, setStatus] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getToday().then((d) => {
        setJobs(d.jobs);
        if (!projectId && d.jobs[0]) setProjectId(d.jobs[0].id);
      });
    }, [projectId]),
  );

  async function shoot() {
    if (!projectId) {
      setStatus("Pick a job first.");
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setStatus("Camera permission is required.");
      return;
    }
    const shot = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
      allowsEditing: false,
    });
    if (shot.canceled || !shot.assets[0]?.base64) return;
    const dataUrl = `data:image/jpeg;base64,${shot.assets[0].base64}`;
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      await enqueue({
        id: `${Date.now()}`,
        projectId,
        tag,
        caption: tag,
        dataUrl,
        createdAt: new Date().toISOString(),
      });
      setStatus("No signal. Photo queued on this phone.");
      return;
    }
    await uploadPhoto({ projectId, tag, caption: tag, dataUrl });
    setStatus("Photo on the job.");
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, color: colors.ink }}>Camera</Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>
        Tagged site photos. Offline they sit on this phone until you have signal.
      </Text>
      <View style={{ marginTop: 16, gap: 8 }}>
        {jobs.map((j) => (
          <Pressable
            key={j.id}
            onPress={() => setProjectId(j.id)}
            style={{
              padding: 14,
              backgroundColor: projectId === j.id ? colors.ink : "#fff",
            }}
          >
            <Text style={{ color: projectId === j.id ? colors.cream : colors.ink }}>{j.name}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {TAGS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTag(t)}
            style={{
              height: 44,
              paddingHorizontal: 12,
              justifyContent: "center",
              backgroundColor: tag === t ? colors.ink : colors.paper2,
            }}
          >
            <Text style={{ color: tag === t ? colors.cream : colors.ink }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => void shoot()}
        style={{ marginTop: 24, height: 56, backgroundColor: colors.brass, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: colors.ink, fontWeight: "600", fontSize: 16 }}>Open camera</Text>
      </Pressable>
      {status ? <Text style={{ marginTop: 12, color: colors.muted }}>{status}</Text> : null}
    </ScrollView>
  );
}
