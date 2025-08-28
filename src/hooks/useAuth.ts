import { useEffect, useReducer, useCallback } from "react";
import { AppState, AppAction, User } from "@/types";
import { supabase } from "@/lib/supabase";
import { getOrCreateMyProfile, getSessionUser } from "@/lib/profilesApi";

const initialState: AppState = {
  isAuthenticated: false,
  userType: "",
  currentUser: null,
  password: "",
  isLoading: false,
  error: "",
  activeTab: "dashboard",
  showModal: false,
  modalType: ""
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_AUTHENTICATED": return { ...state, isAuthenticated: action.payload };
    case "SET_USER_TYPE": return { ...state, userType: action.payload };
    case "SET_CURRENT_USER": return { ...state, currentUser: action.payload };
    case "SET_PASSWORD": return { ...state, password: action.payload };
    case "SET_LOADING": return { ...state, isLoading: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload };
    case "SET_ACTIVE_TAB": return { ...state, activeTab: action.payload };
    case "SET_SHOW_MODAL": return { ...state, showModal: action.payload };
    case "SET_MODAL_TYPE": return { ...state, modalType: action.payload };
    case "RESET_STATE": return initialState;
    default: return state;
  }
}

export function useAuth() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // carrega sessão ao montar
  useEffect(() => {
    (async () => {
      const u = await getSessionUser();
      if (!u) return;
      const profile = await getOrCreateMyProfile();
      const user: User = { name: profile.display_name, type: profile.role };
      dispatch({ type: "SET_CURRENT_USER", payload: user });
      dispatch({ type: "SET_USER_TYPE", payload: profile.role });
      dispatch({ type: "SET_AUTHENTICATED", payload: true });
      dispatch({ type: "SET_ACTIVE_TAB", payload: profile.role === "admin" ? "dashboard" : "my-requests" });
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (evt) => {
      if (evt === "SIGNED_OUT") {
        dispatch({ type: "RESET_STATE" });
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const handleLogin = useCallback(async (_ignoredType: "admin"|"professor", email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: "" });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const profile = await getOrCreateMyProfile();
      const user: User = { name: profile.display_name, type: profile.role };
      dispatch({ type: "SET_CURRENT_USER", payload: user });
      dispatch({ type: "SET_USER_TYPE", payload: profile.role });
      dispatch({ type: "SET_AUTHENTICATED", payload: true });
      dispatch({ type: "SET_ACTIVE_TAB", payload: profile.role === "admin" ? "dashboard" : "my-requests" });
    } catch (e: any) {
      dispatch({ type: "SET_ERROR", payload: e.message || "Falha no login" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: "RESET_STATE" });
  }, []);

  const openModal = useCallback((type: string) => {
    dispatch({ type: "SET_MODAL_TYPE", payload: type });
    dispatch({ type: "SET_SHOW_MODAL", payload: true });
  }, []);
  const closeModal = useCallback(() => {
    dispatch({ type: "SET_SHOW_MODAL", payload: false });
  }, []);

  return { state, dispatch, handleLogin, handleLogout, openModal, closeModal };
}
