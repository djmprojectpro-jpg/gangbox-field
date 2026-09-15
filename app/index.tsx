import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "../src/auth";
import { colors } from "../src/theme";

export default function Gate() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    void getToken().then((t) => {
      setAuthed(Boolean(t));
      setReady(true);
    });
  }, []);
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink }}>
        <ActivityIndicator color={colors.brass} />
      </View>
    );
  }
  return <Redirect href={authed ? "/(tabs)/today" : "/login"} />;
}
