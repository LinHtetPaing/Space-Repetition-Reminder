"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import { register } from "../../lib/auth";
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setPending(true);
    try {
      await register(email, password, confirmPassword);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={pageShell}>
      <form style={panel} onSubmit={onSubmit}>
        <h1 style={title}>Register</h1>
        <p style={subtitle}>Create an account to start your review calendar.</p>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label style={label}>
          Confirm Password
          <input
            style={input}
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        {error ? <p style={errorText}>{error}</p> : null}

        <button style={button} type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>

        <p style={{ ...linkRow, margin: 0 }}>
          <Link href="/login">Already have an account? Log in</Link>
        </p>
      </form>
    </main>
  );
}
