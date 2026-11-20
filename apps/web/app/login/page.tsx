"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import { login } from "../../lib/auth";
import {
  button,
  errorText,
  input,
  label,
  linkRow,
  pageShell,
  panel,
  subtitle,
  title,
} from "../styles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={pageShell}>
      <form style={panel} onSubmit={onSubmit}>
        <h1 style={title}>Log in</h1>
        <p style={subtitle}>Continue where you left off.</p>

        <label style={label}>
          Email
          <input
            style={input}
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label style={label}>
          Password
          <input
            style={input}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p style={errorText}>{error}</p> : null}

        <button style={button} type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>

        <p style={{ ...linkRow, margin: 0 }}>
          <Link href="/register">Need an account? Register</Link>
        </p>
      </form>
    </main>
  );
}
