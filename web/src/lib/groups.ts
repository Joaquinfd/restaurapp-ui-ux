/** Shared helpers for the group surface so the invite-link format stays identical
 *  across the creation wizard and the group detail view. */

const INVITE_BASE = "https://restaurapp-ui-ux.vercel.app";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build the (fictitious) shareable invite link for a group. Used everywhere a link
 *  is shown so the wizard and the detail view never drift apart. */
export function buildInviteLink(groupName: string, memberIds: string[]): string {
  const namePart = slugify(groupName) || "grupo";
  const friendPart = memberIds.join("-") || "sin-amigos";
  return `${INVITE_BASE}/${namePart}-${memberIds.length}-${friendPart}`;
}
