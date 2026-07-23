import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import updateDisplayName from "./tools/update-display-name";
import listMySessions from "./tools/list-my-sessions";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "pookie-and-i-mcp",
  title: "Pookie & I",
  version: "0.1.0",
  instructions:
    "Tools for the Pookie & I date-night app. Read the signed-in user's profile and session history, and update their display name.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfile, updateDisplayName, listMySessions],
});