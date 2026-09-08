"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { submitContact } from "./contact-action";
import {
  initialContactState,
  type ContactFormState,
} from "./contact-schema";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<
    ContactFormState,
    FormData
  >(submitContact, initialContactState);

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors?.name)}
          aria-describedby={fieldErrors?.name ? "contact-name-error" : undefined}
          required
        />
        {fieldErrors?.name && (
          <p
            id="contact-name-error"
            className="text-xs text-destructive"
          >
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors?.email)}
          aria-describedby={
            fieldErrors?.email ? "contact-email-error" : undefined
          }
          required
        />
        {fieldErrors?.email && (
          <p
            id="contact-email-error"
            className="text-xs text-destructive"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          aria-invalid={Boolean(fieldErrors?.message)}
          aria-describedby={
            fieldErrors?.message ? "contact-message-error" : undefined
          }
          required
        />
        {fieldErrors?.message && (
          <p
            id="contact-message-error"
            className="text-xs text-destructive"
          >
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot — visually hidden but accessible to bots. */}
      <div
        aria-hidden
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="contact-website">
          Don&apos;t fill this out if you&apos;re human
        </label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={pending} className="px-8">
          {pending ? "Sending…" : "Send message"}
        </Button>

        {state.status !== "idle" && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={cn(
              "text-sm",
              state.status === "success"
                ? "text-state-success"
                : "text-destructive",
            )}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
