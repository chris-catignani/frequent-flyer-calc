import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});
const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
};
const asyncConfig = createJestConfig(customJestConfig);

const createCustomJestConfig = async () => {
  const config = await asyncConfig();
  config.transformIgnorePatterns = ["^.+\\.module\\.(css|sass|scss)$", "/node_modules/(?!(uuid)/)"];
  return config;
};

export default createCustomJestConfig;
