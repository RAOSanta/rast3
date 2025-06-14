"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider);
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* Modal content */}
        <div className="text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>

          <div className="space-y-3">
            {/* Discord Sign In Button */}
            <button
              onClick={() => handleSignIn("discord")}
              disabled={isLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-[#5865F2] px-4 py-3 text-white transition hover:bg-[#4752C4] disabled:opacity-50"
            >
              {isLoading === "discord" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              )}
              <span className="font-medium">
                {isLoading === "discord" ? "Signing in..." : "Continue with Discord"}
              </span>
            </button>

            {/* GitHub Sign In Button */}
            <button
              onClick={() => handleSignIn("github")}
              disabled={isLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-[#24292F] px-4 py-3 text-white transition hover:bg-[#1b1f23] disabled:opacity-50"
            >
              {isLoading === "github" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.582 0-.288-.012-1.243-.018-2.25-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              <span className="font-medium">
                {isLoading === "github" ? "Signing in..." : "Continue with GitHub"}
              </span>
            </button>

            {/* Twitch Sign In Button */}
            <button
              onClick={() => handleSignIn("twitch")}
              disabled={isLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-[#9146FF] px-4 py-3 text-white transition hover:bg-[#772CE8] disabled:opacity-50"
            >
              {isLoading === "twitch" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
              )}
              <span className="font-medium">
                {isLoading === "twitch" ? "Signing in..." : "Continue with Twitch"}
              </span>
            </button>

            {/* Google Sign In Button */}
            <button
              onClick={() => handleSignIn("google")}
              disabled={isLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 transition hover:bg-gray-50 disabled:opacity-50 shadow-sm"
            >
              {isLoading === "google" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.2 3.2-4.2 5.5-7.8 5.5-4.7 0-8.5-3.8-8.5-8.5s3.8-8.5 8.5-8.5c2.1 0 4 .7 5.5 2l6.1-6.1C36.2 9.1 30.4 7 24 7 13.5 7 5 15.5 5 26s8.5 19 19 19 19-8.5 19-19c0-1.3-.1-2.5-.4-3.5z"/>
                    <path fill="#34A853" d="M24 45c5.4 0 9.9-1.8 13.2-4.8l-6.1-6.1c-1.7 1.2-3.9 2-6.1 2-4.7 0-8.5-3.8-8.5-8.5H5v5.3C8.3 40.2 15.5 45 24 45z"/>
                    <path fill="#FBBC05" d="M15.5 27.6c-.4-1.2-.6-2.5-.6-3.6s.2-2.5.6-3.6V15H5c-1.1 2.2-1.7 4.7-1.7 7.5s.6 5.3 1.7 7.5l10.5-7.4z"/>
                    <path fill="#EA4335" d="M24 14.5c2.6 0 4.9.9 6.7 2.6l5-5C33.9 9.1 29.2 7 24 7c-8.5 0-15.7 4.8-19 11.7l10.5 7.4c1.2-3.7 4.7-6.6 8.5-6.6z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </g>
                </svg>
              )}
              <span className="font-medium">
                {isLoading === "google" ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            {/* Reddit Sign In Button */}
            <button
              onClick={() => handleSignIn("reddit")}
              disabled={isLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-[#FF4500] px-4 py-3 text-white transition hover:bg-[#d93a00] disabled:opacity-50"
            >
              {isLoading === "reddit" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="#FF4500"/>
                  <ellipse cx="8.5" cy="13.5" rx="1.5" ry="1" fill="#fff"/>
                  <ellipse cx="15.5" cy="13.5" rx="1.5" ry="1" fill="#fff"/>
                  <circle cx="8.5" cy="13.5" r="0.5" fill="#000"/>
                  <circle cx="15.5" cy="13.5" r="0.5" fill="#000"/>
                  <path d="M8.5 16c1.5 1 3.5 1 5 0" stroke="#000" strokeWidth=".5" fill="none"/>
                  <circle cx="12" cy="9.5" r="1.5" fill="#fff" stroke="#000" strokeWidth=".3"/>
                  <circle cx="17" cy="7" r="1" fill="#fff" stroke="#000" strokeWidth=".2"/>
                  <circle cx="17" cy="7" r=".4" fill="#FF4500"/>
                  <path d="M13.5 8l2-2" stroke="#000" strokeWidth=".2"/>
                </svg>
              )}
              <span className="font-medium">
                {isLoading === "reddit" ? "Signing in..." : "Continue with Reddit"}
              </span>
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            By signing in, you agree to our terms of service and{" "}
            <Link
              href="/privacy"
              className="text-red-600 hover:text-red-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
