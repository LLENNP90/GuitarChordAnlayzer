"use client"

import { useState } from 'react'
import { setAuthToken } from '../../../lib/auth'
import { api } from '../../../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/dist/client/link'
import { Music, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function page() {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
	const [errorCode, setErrorCode] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setErrorCode(null)
		try{
			const data = await api.login({ username, password })
			setAuthToken(data.token)

			router.push("/")
		} catch (error) {
			setErrorCode(error instanceof Error ? error.message : "API_ERROR");

		}	

	}

return (
    <main className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
        {/* Background Pattern */}
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
            Master the fretboard.
            <br />
            <span className="text-primary">Unlock your potential.</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md">
            Build chords, explore scales, and understand music theory with our
            interactive guitar learning platform.
          </p>

          {/* Feature highlights */}
          <div className="mt-12 space-y-4">
            {[
              "Interactive chord & scale builder",
              "CAGED system visualization",
              "AI-powered progression analysis",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to continue your musical journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
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
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary/50"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold rounded-lg px-4 py-3 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
					{errorCode && (
						<p className="rounded border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 mt-4">
							{errorCode === "INVALID_CREDENTIALS"
								? "Invalid username or password."
								: "Something went wrong. Please try again."}
						</p>
        	)}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">
                  New to Fretboard Studio?
                </span>
              </div>
            </div>

            <Link
              href="/signup"
              className="mt-4 w-full border border-border text-foreground font-medium rounded-lg px-4 py-3 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center justify-center gap-2"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
