import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
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
    },
  }
);
