"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Guitar, LogOut, Save, User } from "lucide-react";
import { api } from "../../../lib/api";
import { getAuthToken, removeAuthToken } from "../../../lib/auth";

type ProfileUser = {
  id: string;
  username: string;
  email: string;
  name?: string | null;
  createdAt: string;
};

function getErrorMessage(code: string) {
  if (code === "USERNAME_TAKEN") return "That username is already taken.";
  if (code === "EMAIL_TAKEN") return "That email is already in use.";
  if (code === "MISSING_FIELDS") return "Username and email are required.";
  if (code === "UNAUTHORISED" || code === "UNAUTHORISED_TOKEN") {
    return "Your session expired. Please log in again.";
  }

  return "Something went wrong. Please try again.";
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!getAuthToken()) {
          router.replace("/login");
          return;
        }

        const data = await api.getMe();
        const loadedUser = data.user as ProfileUser;

        setUser(loadedUser);
        setUsername(loadedUser.username);
        setEmail(loadedUser.email);
        setName(loadedUser.name ?? "");
      } catch (err) {
        removeAuthToken();
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const handleReset = () => {
    if (!user) return;

    setUsername(user.username);
    setEmail(user.email);
    setName(user.name ?? "");
    setError(null);
    setSuccess(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const nextUsername = username.trim();
    const nextEmail = email.trim();
    const nextName = name.trim();

    if (!nextUsername || !nextEmail) {
      setError("Username and email are required.");
      return;
    }

    try {
      setIsSaving(true);
      const data = await api.updateMe({
        username: nextUsername,
        email: nextEmail,
        name: nextName,
      });

      const updatedUser = data.user as ProfileUser;
      setUser(updatedUser);
      setUsername(updatedUser.username);
      setEmail(updatedUser.email);
      setName(updatedUser.name ?? "");
      setSuccess("Profile updated.");
    } catch (err) {
      const code = err instanceof Error ? err.message : "API_ERROR";
      setError(getErrorMessage(code));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Guitar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Fretboard Studio</h1>
              <p className="text-xs text-muted-foreground">Profile settings</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm font-semibold text-red-600 hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to studio
        </Link>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
                <p className="text-sm text-muted-foreground">
                  Update the details shown on your account.
                </p>
              </div>
            </div>

            {error && (
              <p className="mb-4 rounded border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="mb-4 flex items-center gap-2 rounded border border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700">
                <Check className="h-4 w-4" />
                {success}
              </p>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Display Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </form>

          <aside className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold text-primary">Account</h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Signed in as</p>
                <p className="font-semibold text-foreground">
                  {user?.name || user?.username}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="break-all font-semibold text-foreground">{user?.email}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-semibold text-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
