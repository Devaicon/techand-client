import { redirect } from "next/navigation";

// Team merged into Users — it held a read-only copy of the same member list plus
// invitations, and both now live on one page. Kept as a redirect rather than
// deleted outright: this was a bookmarked nav entry, and a 404 on it would read
// as the panel having lost the team rather than moved it.
export default function TeamPageRedirect() {
  redirect("/admin/users");
}
