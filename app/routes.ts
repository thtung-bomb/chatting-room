import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
	index("routes/home.tsx"),
	route("/chat", "routes/chat.tsx"),
	route("/register", "routes/register.tsx"),
	route("/login", "routes/login.tsx"),
] satisfies RouteConfig
