import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { signInEmail } from "../src/auth";
import { apiBase, loadApiBase, saveApiBase, colors } from "../src/theme";

export default function Login() {
  const router = useRouter();
  const [shopUrl, setShopUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadApiBase().then((url) => setShopUrl(url || apiBase()));
  }, []);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await saveApiBase(shopUrl);
      await signInEmail(email, password);
      router.replace("/(tabs)/today");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  const field = {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    color: colors.cream,
    marginBottom: 16,
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, padding: 24, justifyContent: "center" }}>
      <Text style={{ color: colors.muted, letterSpacing: 2, fontSize: 11, textTransform: "uppercase" }}>
        Gangbox Field
      </Text>
      <Text style={{ color: colors.cream, fontSize: 32, marginTop: 8 }}>Sign in</Text>
      <Text style={{ color: colors.muted, marginTop: 8, marginBottom: 24 }}>
        Same shop account as the office. Texts still leave from your cell.
      </Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder="Shop URL (https://…)"
        placeholderTextColor={colors.muted}
        value={shopUrl}
        onChangeText={setShopUrl}
        style={field}
      />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
        style={field}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={colors.muted}
        value={password}
        onChangeText={setPassword}
        style={field}
      />
      {error ? <Text style={{ color: "#E8B4A8", marginBottom: 12 }}>{error}</Text> : null}
      <Pressable
        onPress={() => void submit()}
        disabled={busy}
        style={{ backgroundColor: colors.brass, height: 48, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: colors.ink, fontWeight: "600" }}>{busy ? "Signing in…" : "Open the shop"}</Text>
      </Pressable>
    </View>
  );
}
