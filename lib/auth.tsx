"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User } from "firebase/auth";
import { fb } from "./firebase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  error: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(fb().auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = useCallback(async () => {
    setError("");
    const { auth } = fb();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, provider);
      } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // user closed the window
      } else if (code === "auth/operation-not-allowed") {
        setError("Google sign-in is not enabled for this Firebase project yet.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This website's domain is not authorised in Firebase (Authentication → Settings → Authorized domains).");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(fb().auth);
  }, []);

  const getToken = useCallback(async () => (user ? user.getIdToken() : null), [user]);

  const value = useMemo(() => ({ user, loading, error, signIn, signOut, getToken }), [user, loading, error, signIn, signOut, getToken]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
