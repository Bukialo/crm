import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useAuthStore } from "./store/auth.store";
import { PrivateRoute } from "./routes/PrivateRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import ContactsPage from  "./pages/contacts/ContactsPage";
import ContactDetail from "./pages/contacts/ContactDetail";
import { AiChat } from "./components/ai/AiChat";
import { AiChatButton } from "./components/ai/AiChatButton";

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the ID token
          const token = await firebaseUser.getIdToken();

          // Set user in store
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            firebaseUid: firebaseUser.uid,
            // These will be fetched from the backend
            firstName: "",
            lastName: "",
            role: "AGENT",
          });

          // Store token for API calls
          localStorage.setItem("token", token);
        } catch (error) {
          console.error("Error setting up user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem("token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/trips" element={<div>Trips</div>} />
            <Route path="/campaigns" element={<div>Campaigns</div>} />
            <Route path="/calendar" element={<div>Calendar</div>} />
            <Route path="/settings" element={<div>Settings</div>} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* AI Chat Components - Solo en rutas privadas */}
      {useAuthStore.getState().user && (
        <>
          <AiChatButton />
          <AiChat />
        </>
      )}
    </BrowserRouter>
  );
}

export default App;
