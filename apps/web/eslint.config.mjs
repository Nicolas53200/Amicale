import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    ignores: [".next/"],
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
];
