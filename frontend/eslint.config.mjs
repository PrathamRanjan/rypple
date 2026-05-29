import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/ui/background-ripple-effect.tsx",
    "src/components/ui/keyboard.tsx",
    "src/components/keyboard-with-preview-demo.tsx",
    "src/components/ui/water-ripple-effect.tsx",
  ]),
]);

export default eslintConfig;
