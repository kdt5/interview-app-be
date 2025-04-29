import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    files: ["**/*.ts"],
    plugins: {
      import: importPlugin
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      {
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
          },
        },
      },
    ],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["strictCamelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["strictCamelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
        {
          selector: "function",
          format: ["strictCamelCase", "PascalCase"],
        },
        {
          selector: "import",
          format: ["strictCamelCase"],
        },
      ],
      "import/extensions": ["error", "always", { "js": "always", "ts": "never" }]
    },
  }
);
