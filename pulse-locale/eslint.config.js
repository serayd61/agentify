import parser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules/**"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
