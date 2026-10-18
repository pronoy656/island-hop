"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

import { Button, Input } from "@/ui";
import { useResendVerificationMutation, useVerifyEmailMutation } from "@/hooks";

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const role = searchParams.get("role") || "passenger";

  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !isEditingEmail) {
      inputRefs.current[0].focus();
    }
  }, [isEditingEmail]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const nextDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // User pasted into a single box
      const chars = cleaned.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = chars[i] || "";
      }
      setOtpDigits(nextDigits);

      // Focus last filled or next empty box
      const targetFocus = Math.min(chars.length, 5);
      inputRefs.current[targetFocus]?.focus();

      if (chars.length === 6) {
        submitOtp(nextDigits.join(""));
      }
      return;
    }

    nextDigits[index] = cleaned;
    setOtpDigits(nextDigits);

    // Auto-advance to next box if character entered
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits are filled
    const fullOtp = nextDigits.join("");
    if (fullOtp.length === 6) {
      submitOtp(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        // Move to previous box if current is already empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setOtpDigits(nextDigits);

    const targetFocus = Math.min(pasted.length, 5);
    inputRefs.current[targetFocus]?.focus();

    if (pasted.length === 6) {
      submitOtp(pasted);
    }
  };

  const submitOtp = (codeToSubmit: string) => {
    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      setIsEditingEmail(true);
      return;
    }

    if (codeToSubmit.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    verifyMutation.mutate(
      { email: email.trim(), otp: codeToSubmit },
      {
        onSuccess: () => {
          setIsVerified(true);
          setTimeout(() => {
            router.push(`/login?email=${encodeURIComponent(email)}&role=${role}`);
          }, 1500);
        }
      }
    );
  };

  const handleResend = () => {
    if (!email.trim()) {
      toast.error("Please provide your email address first");
      setIsEditingEmail(true);
      return;
    }

    resendMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          setCooldown(60);
          setOtpDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      }
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Brand & Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
          {isVerified ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />
          ) : (
            <ShieldCheck className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            {isVerified ? "Email Verified!" : "Verify Your Account"}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto">
            {isVerified
              ? "Your account has been successfully verified. Redirecting to login..."
              : "We've sent a 6-digit verification OTP code to your registered email address."}
          </p>
        </div>

        {/* Email Display & Edit Pill */}
        {!isEditingEmail ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span>{email || "No email provided"}</span>
            <button
              type="button"
              onClick={() => setIsEditingEmail(true)}
              className="text-muted-foreground hover:text-primary transition-colors ml-1"
              title="Edit email address"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xs items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-9 text-xs"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (email.trim()) setIsEditingEmail(false);
              }}
              className="h-9 px-3 text-xs"
            >
              Set
            </Button>
          </div>
        )}
      </div>

      {/* 6-Digit OTP Box Grid */}
      {!isVerified && (
        <div className="space-y-6">
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={verifyMutation.isPending}
                className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border border-input bg-card text-center text-lg sm:text-xl font-black text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            ))}
          </div>

          {/* Action Button */}
          <Button
            type="button"
            onClick={() => submitOtp(otpDigits.join(""))}
            disabled={verifyMutation.isPending || otpDigits.join("").length < 6}
            className="h-12 w-full rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying OTP...
              </>
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Resend Cooldown Section */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs">
            <span className="text-muted-foreground">Didn't receive the email code?</span>
            {cooldown > 0 ? (
              <span className="text-muted-foreground font-semibold">
                Resend in <span className="text-primary font-bold">{cooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="flex items-center gap-1.5 font-bold text-primary hover:underline disabled:opacity-50"
              >
                {resendMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Resend Code
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Return to Login */}
      <div className="pt-2 text-center text-xs">
        <Link
          href={`/login?role=${role}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
