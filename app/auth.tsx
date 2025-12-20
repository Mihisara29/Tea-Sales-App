// E:\tea-sales-app\app\auth.tsx
import { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login"); // toggle login/signup
  const [name, setName] = useState(""); // only used in signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user } = useContext(AuthContext);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleSignup = async () => {
    if (!name) {
      setError("Please enter your name");
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // Save extra info in Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role: "seller", // default role
      });

      router.replace("/"); // redirect to home
    } catch (err) {
      setError("Signup failed. Email might be in use or password too weak.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === "login" ? "Tea Sales Login" : "Signup"}</Text>

      {mode === "signup" && (
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={mode === "login" ? "Login" : "Signup"}
        onPress={mode === "login" ? handleLogin : handleSignup}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title={mode === "login" ? "Switch to Signup" : "Switch to Login"}
          onPress={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
});
