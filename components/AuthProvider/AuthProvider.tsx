"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import css from "./AuthProvider.module.css";

import { checkSession, logout } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

const PRIVATE_PREFIXES = ["/profile", "/notes"];

function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);

      const user = await checkSession();

      if (!isMounted) return;

      if (user) {
        setUser(user);
        setIsLoading(false);
        return;
      }

      if (isPrivatePath(pathname)) {
        await logout();
        clearIsAuthenticated();
        router.push("/sign-in");
        return;
      }

      clearIsAuthenticated();
      setIsLoading(false);
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, setUser, clearIsAuthenticated]);

  if (isLoading) {
    return (
      <div className={css.loaderWrapper}>
        <p className={css.loaderText}>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
