import pkg from "@lovable.dev/vite-tanstack-config";
const { defineConfig } = pkg;

export default defineConfig({
  tanstackStart: {
    router: {
      autoCodeSplitting: false,
    },
  },
  vite: {},
});
