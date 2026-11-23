import { db } from "@/lib/api";

export interface MySociety {
  membership: { number: string; tier: number; tier_name: string; benefits: string; joined_at: string; missed: number; launch_code: string | null; card_dispatched_at: string | null; package_dispatched_at: string | null } | null;
  lapsed: boolean;
  queue: { tier: number; tier_name: string; since: string }[];
  history: { at: string; from: number | null; to: number | null; reason: string; number: string | null }[];
}
export const fetchMySociety = async (): Promise<MySociety | null> => { const { data, error } = await db.rpc("my_society"); return error ? null : (data as MySociety); };

const MSG: Record<string, string> = { reason_required: "A reason is required.", invalid_input: "Please check the values.", not_found: "Not found.", already_processed: "This launch has already been processed.", launch_not_finished: "The launch must be closed or completed first.", not_eligible: "This launch is not Society-eligible.", not_waiting: "This customer is not on the Tier 1 list.", already_member: "This customer is already an active member.", tier_full: "Tier 1 is full. Raise the cap or wait for a place.", forbidden: "You do not have permission for this." };
export const societyError = (m?: string) => (m && MSG[m]) || "Something went wrong. Please try again.";
