"use client";

import { useState } from 'react'
import { setAuthToken } from '../../../lib/auth'
import { api } from '../../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/dist/client/link'
import { ArrowRight, Check, Eye, EyeOff, Music } from 'lucide-react';

export default function page() {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [name, setName] = useState<string>('')
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setIsLoading(true);
      setErrorCode(null);

      try {
        const data = await api.signup({ username, password, email, name });
        setAuthToken(data.token);
        router.push("/");
      } catch (error) {
        setErrorCode(error instanceof Error ? error.message : "API_ERROR");
      } finally {
        setIsLoading(false);
      }
    }

    const errorMessage =
      errorCode === "USERNAME_TAKEN"
        ? "That username is already taken."
        : errorCode === "EMAIL_TAKEN"
        ? "That email is already registered."
        : errorCode === "MISSING_FIELDS"
        ? "Please fill in all required fields."
        : errorCode === "INVALID_EMAIL"
        ? "Please enter a valid email address."
        : errorCode
        ? "Something went wrong. Please try again."
        : null;

  return (
    <main className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Fretboard Studio</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create account</h2>
            <p className="text-muted-foreground">
              Start your musical journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                placeholder="johndoe"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold rounded-lg px-4 py-3 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            {errorMessage && (
              <p className="rounded border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="mt-4 w-full border border-border text-foreground font-medium rounded-lg px-4 py-3 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center justify-center gap-2"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
        {/* Background Pattern - Guitar strings */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={15 + i * 14}
                x2="100"
                y2={15 + i * 14}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary"
              />
            ))}
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={`fret-${i}`}
                x1={4 + i * 4}
                y1="10"
                x2={4 + i * 4}
                y2="90"
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-muted-foreground"
              />
            ))}
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">Fretboard Studio</span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Join thousands of
            <br />
            <span className="text-primary">guitar learners.</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md mb-12">
            Create your free account and start exploring chords, scales, and
            music theory like never before.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              "Save your favorite chord voicings",
              "Track your learning progress",
              "Access AI-powered theory explanations",
              "Personalized practice recommendations",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
