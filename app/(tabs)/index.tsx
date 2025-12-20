// E:\tea-sales-app\app\(tabs)\index.tsx
import { useState, useEffect, useContext } from "react";
import { View, Text, Button } from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [userName, setUserName] = useState("");

  // Fetch user name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserName(docSnap.data().name);
      }
    };
    fetchUserName();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth"); // redirect to combined login/signup
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Welcome, {userName || "User"}!
      </Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
