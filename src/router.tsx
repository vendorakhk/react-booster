import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ({ error }) => (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    ),
  });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
