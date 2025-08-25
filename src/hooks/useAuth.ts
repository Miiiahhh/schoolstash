import { useReducer, useCallback } from "react";
import { AppState, AppAction, User } from "@/types";
import { ensureAuthConfig, verifyAdminPassword, verifyProfessor } from "@/lib/authStore";

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

  // Garante que a config inicial existe no localStorage (seed)
  ensureAuthConfig();

  const handleLogin = useCallback((userType: "admin"|"professor", username: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: "" });
    try {
      if (userType === "admin") {
        const ok = verifyAdminPassword(password);
        if (!ok) throw new Error("Senha do admin inválida.");
        const user: User = { name: "Administrador", type: "admin" };
        dispatch({ type: "SET_CURRENT_USER", payload: user });
        dispatch({ type: "SET_USER_TYPE", payload: "admin" });
        dispatch({ type: "SET_AUTHENTICATED", payload: true });
        dispatch({ type: "SET_ACTIVE_TAB", payload: "dashboard" });
      } else {
        const prof = verifyProfessor(username, password);
        if (!prof) throw new Error("Usuário ou senha de professor inválidos.");
        const user: User = { name: prof.username, type: "professor" };
        dispatch({ type: "SET_CURRENT_USER", payload: user });
        dispatch({ type: "SET_USER_TYPE", payload: "professor" });
        dispatch({ type: "SET_AUTHENTICATED", payload: true });
        dispatch({ type: "SET_ACTIVE_TAB", payload: "my-requests" });
      }
    } catch (e: any) {
      dispatch({ type: "SET_ERROR", payload: e.message || "Falha no login" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  const openModal = useCallback((type: string) => {
    dispatch({ type: "SET_MODAL_TYPE", payload: type });
    dispatch({ type: "SET_SHOW_MODAL", payload: true });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: "SET_SHOW_MODAL", payload: false });
  }, []);

  return {
    state,
    dispatch,
    handleLogin,
    handleLogout,
    openModal,
    closeModal
  };
}
