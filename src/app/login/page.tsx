"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPortalMounted, setIsPortalMounted] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        setShowSuccessModal(true);
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="flex flex-col items-center mb-10 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-container rounded-[24px] flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[40px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <h1 className="font-display-lg text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/60 text-center leading-none">
            Shop Credit<br />Manager
          </h1>
          <p className="font-body-md text-sm font-medium text-on-surface-variant/80 text-center mt-4 max-w-[280px]">
            Digitize your khata book and manage customer udhar seamlessly.
          </p>
        </div>

        <form onSubmit={handleAuth} className="bg-gradient-to-br from-surface-container-lowest to-surface-container/30 p-8 rounded-[32px] shadow-xl shadow-black/5 border border-outline-variant/30 relative overflow-hidden backdrop-blur-xl">
          <h2 className="font-headline-sm text-xl font-bold text-on-surface mb-8 text-center">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-error-container/50 border border-error/20 text-on-error-container rounded-[16px] text-xs font-bold uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant opacity-70">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-container/50 border-2 border-outline-variant/30 rounded-[20px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold text-on-surface shadow-inner"
                  placeholder="shop@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant opacity-70">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-container/50 border-2 border-outline-variant/30 rounded-[20px] focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold text-on-surface shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-on-primary rounded-[20px] font-bold text-[13px] uppercase tracking-widest shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:active:scale-100 cursor-pointer"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              isSignUp ? "Sign Up" : "Log In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[12px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all hover:bg-primary/5 px-4 py-2 rounded-full cursor-pointer"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>

      {/* Registration Success Modal */}
      {isPortalMounted && typeof document !== 'undefined' && showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 pointer-events-auto">
          <div
            className="fixed inset-0 bg-black/50 z-[120] transition-opacity duration-300 backdrop-blur-sm opacity-100"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 z-[121] transition-all duration-300 transform scale-100 opacity-100 text-center">
            <div className="w-16 h-16 bg-jama-success/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-jama-success/20 text-jama-success">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-2">Registration Successful!</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Your account for <span className="font-bold text-primary">{email}</span> has been created. You can now log in and digitize your shop&apos;s khata.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-on-primary shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer uppercase tracking-widest"
            >
              Log In Now
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
