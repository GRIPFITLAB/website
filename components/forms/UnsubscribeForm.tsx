"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { submitUnsubscribe } from "./unsubscribe-action";
import {
  initialUnsubscribeState,
  type UnsubscribeState,
} from "./unsubscribe-schema";

export interface UnsubscribeFormProps {
  email: string;
  code: string;
}

/**
 * Confirmation step for `/unsubscribe`.
 *
 * The removal happens on submit, never on page load: mail clients and
 * security scanners prefetch links, so a GET that unsubscribed would opt
 * people out without them ever clicking.
 */
export function UnsubscribeForm({ email, code }: UnsubscribeFormProps) {
  const [state, formAction, pending] = useActionState<
    UnsubscribeState,
    FormData
  >(submitUnsubscribe, initialUnsubscribeState);

  if (state.status === "done") {
    return (
      <p
        className="rounded-xl border border-state-success/30 bg-state-success/10 px-4 py-3 text-sm leading-[1.55] text-state-success"
        role="status"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="code" value={code} />

      <p className="text-[15px] leading-[1.7] text-text-secondary">
        Unsubscribe <strong className="text-text-primary">{email}</strong> from
        all GripFit email?
      </p>

      {state.status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 w-full sm:w-auto sm:self-start"
      >
        {pending ? "Removing…" : "Confirm unsubscribe"}
      </Button>
    </form>
  );
}
