import { useEffect, useState } from "react";
import { isCurrentUserAdmin } from "../services/admin";
import { useSession } from "./useSession";

export function useAdmin() {
  const { session, loading: loadingSession } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingSession) return;
    if (!session) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    isCurrentUserAdmin().then((res) => {
      if (mounted) {
        setIsAdmin(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [loadingSession, session?.user?.id]);

  return { isAdmin, loading };
}
