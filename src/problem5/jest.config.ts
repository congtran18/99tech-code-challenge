import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
  // Unit tests: co-located next to source (*.test.ts inside src/)
  // Integration tests: in tests/ at root level
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/tests/**/*.test.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts", // exclude co-located test files from coverage source
    "!src/database/seed.ts",
    "!src/server.ts",
  ],
  clearMocks: true,
  restoreMocks: true,
};

export default config;
