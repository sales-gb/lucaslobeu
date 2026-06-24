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
    // External tooling dropped into the repo (ruflo / claude-code helpers) —
    // not part of the application source.
    ".claude/**",
    ".claude-flow/**",
  ]),
  {
    // Regras advisory do React Compiler (eslint-plugin-react-hooks v6). O projeto
    // NÃO usa o React Compiler; estes são padrões intencionais (ex.: fechar o menu
    // na navegação, ler getBoundingClientRect de um ref para posicionar popover).
    // Mantidas como warning para visibilidade, sem bloquear como erro.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      // Permite params/vars intencionalmente não usados quando prefixados com _
      // (ex.: assinaturas de interface — StorageAdapter.save(_, _, _mimeType)).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
