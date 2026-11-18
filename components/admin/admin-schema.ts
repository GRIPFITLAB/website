import { z } from "zod";

export const adminSignInSchema = z.object({
  email: z.string().trim().min(1).max(254),
  passcode: z.string().min(1).max(256),
});

export interface AdminSignInState {
  status: "idle" | "error";
  message: string;
  /** Echoed back so a failed attempt doesn't clear the email field. */
  email: string;
}

export const initialAdminSignInState: AdminSignInState = { status: "idle", message: "", email: "" };
