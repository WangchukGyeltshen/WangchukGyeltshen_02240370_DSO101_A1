"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Fraunces, Space_Grotesk } from "next/font/google";
import styles from "./page.module.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000";

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setStatusType(null);

    if (!email.trim() || !password.trim()) {
      setStatus("Email and password are required.");
      setStatusType("error");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setStatus("Full name is required.");
        setStatusType("error");
        return;
      }

      if (password.trim() !== confirmPassword.trim()) {
        setStatus("Passwords do not match.");
        setStatusType("error");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isLogin
            ? { email: email.trim(), password: password.trim() }
            : {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
              }
        ),
      });

      const payload = (await response.json()) as {
        message?: string;
        data?: { id?: string; name?: string; email?: string; token?: string };
      };

      if (!response.ok) {
        setStatus(payload.message ?? "Authentication failed.");
        setStatusType("error");
        return;
      }

      const greeting = payload.data?.name
        ? `Welcome, ${payload.data.name}.`
        : "Authenticated successfully.";
      setStatus(greeting);
      setStatusType("success");
      if (payload.data) {
        localStorage.setItem("taskflow_user", JSON.stringify(payload.data));
        if (payload.data.token) {
          localStorage.setItem("taskflow_token", payload.data.token);
        }
      }
      router.push("/tasks");
    } catch (error) {
      setStatus("Unable to reach the server.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <main
      className={`${styles.page} ${headingFont.variable} ${bodyFont.variable}`}
    >
      <section className={styles.card}>
        <header className={styles.header}>
          <p className={styles.kicker}>TaskFlow</p>
          <h1 className={styles.title}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? "Sign in to keep your tasks in sync across devices."
              : "Set up your profile and start organizing your day."}
          </p>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Auth options">
          <button
            type="button"
            className={`${styles.tab} ${
              isLogin ? styles.activeTab : ""
            }`}
            onClick={() => setMode("login")}
            role="tab"
            aria-selected={isLogin}
          >
            Log in
          </button>
          <button
            type="button"
            className={`${styles.tab} ${
              !isLogin ? styles.activeTab : ""
            }`}
            onClick={() => setMode("signup")}
            role="tab"
            aria-selected={!isLogin}
          >
            Sign up
          </button>
        </div>

        <form className={styles.form} onSubmit={submitForm}>
          {!isLogin && (
            <label className={styles.field}>
              Full name
              <input
                type="text"
                name="name"
                placeholder="Wangchuk Gyeltshen"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}

          <label className={styles.field}>
            Email address
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            Password
            <input
              type="password"
              name="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {!isLogin && (
            <label className={styles.field}>
              Confirm password
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
          )}

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting
              ? "Submitting..."
              : isLogin
              ? "Log in"
              : "Create account"}
          </button>

          {status && (
            <p
              className={`${styles.status} ${
                (
                  {
                    success: styles.statusSuccess,
                    error: styles.statusError,
                  } as Record<string, string>
                )[statusType ?? ""] ?? ""
              }`}
            >
              {status}
            </p>
          )}
        </form>

        <footer className={styles.footer}>
          <p>
            {isLogin ? "New here?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setMode(isLogin ? "signup" : "login")}
              className={styles.switch}
            >
              {isLogin ? "Sign up instead" : "Log in instead"}
            </button>
          </p>
          <span className={styles.note}>
            Your data stays private. Add backend auth when ready.
          </span>
        </footer>
      </section>
    </main>
  );
}
