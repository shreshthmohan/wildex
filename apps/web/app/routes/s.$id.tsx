import { redirect } from "react-router";
import type { Route } from "./+types/s.$id";

export async function loader({ params }: Route.LoaderArgs) {
  // Redirect /s/:id to /species/:id
  return redirect(`/species/${params.id}`);
}
