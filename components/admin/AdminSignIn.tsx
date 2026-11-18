"use client";

import { LockKeyhole } from "lucide-react";
import { useActionState } from "react";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Surface } from "@/components/ui/surface";
import { Meta } from "@/components/ui/typography";

import { signInAdmin } from "./admin-actions";
import { initialAdminSignInState, type AdminSignInState } from "./admin-schema";

export function AdminSignIn({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState<AdminSignInState, FormData>(
    signInAdmin,
    initialAdminSignInState,
  );

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div aria-hidden className="bg-accent-wash pointer-events-none absolute inset-0" />
      <div aria-hidden className="bg-hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="mb-8 flex justify-center">
          <Logo asLink={false} size={20} />
        </div>

        <Surface padding="none" className="p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-bright">
              <LockKeyhole className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-display-sm text-text-primary">Restricted area</h1>
              <Meta>Sign in to continue.</Meta>
            </div>
          </div>

          <form action={formAction} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                defaultValue={state.email}
                required
                autoFocus={!state.email}
                className="h-11"
                disabled={!configured}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-passcode">Passcode</Label>
              <Input
                id="admin-passcode"
                name="passcode"
                type="password"
                autoComplete="current-password"
                required
                autoFocus={Boolean(state.email)}
                className="h-11"
                disabled={!configured}
              />
            </div>

            {state.status === "error" && (
              <p
                role="alert"
                className="rounded-lg border border-state-danger/30 bg-state-danger/10 px-3 py-2 text-sm text-state-danger"
              >
                {state.message}
              </p>
            )}
            {!configured && (
              <p className="rounded-lg border border-state-warning/30 bg-state-warning/10 px-3 py-2 text-sm text-state-warning">
                Sign-in is disabled on this deployment.
              </p>
            )}

            <Button type="submit" className="mt-2 h-11 w-full" disabled={pending || !configured}>
              {pending ? "Checking…" : "Sign in"}
            </Button>
          </form>
        </Surface>
      </div>
    </main>
  );
}
