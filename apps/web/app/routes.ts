import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("species/:id", "routes/species.$id.tsx"),
  route("s/:id", "routes/s.$id.tsx"),
  route(
    "fimbristylis-insignis",
    "routes/fimbristylis-insignis/route.tsx"
  ),
] satisfies RouteConfig;
