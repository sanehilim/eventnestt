import nextVitals from "eslint-config-next/core-web-vitals"

const config = [
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      "cache/**",
      "lib/openzeppelin-contracts/**",
      "out/**",
    ],
  },
]

export default config
