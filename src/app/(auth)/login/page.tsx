"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/layout/brand-logo";
import { loginAction } from "@/actions/auth.actions";
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.statusCode === 500) {
      setError(result.statusMessage);
      toast.error(result.statusMessage);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #1d4a7a 0%, #0f4c81 35%, #12263a 70%, #0a1628 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(15,76,129,0.15)_0%,transparent_45%,rgba(18,38,58,0.4)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-md">
        <Card className="border-white/15 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-md">
          <CardHeader className="space-y-4 pb-2 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl bg-primary/5 p-2">
              <BrandLogo size={96} priority className="drop-shadow-md" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">MTO Command Center</CardTitle>
              <CardDescription className="mt-1.5 text-base">
                Motor Transport Office — Hyderabad Police
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {searchParams.get("from") && (
                <div className="rounded-md bg-[color-mix(in_srgb,var(--warning)_14%,white)] p-3 text-sm text-[var(--warning)]">
                  Please login to continue
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="user_email">Email</Label>
                <Input
                  id="user_email"
                  name="user_email"
                  type="email"
                  placeholder="admin@gmail.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_password">Password</Label>
                <Input
                  id="user_password"
                  name="user_password"
                  type="password"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Default: admin@gmail.com / 123456
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-[#12263a]"
        >
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
