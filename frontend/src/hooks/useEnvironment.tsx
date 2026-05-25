import { useMemo } from "react";

// Define the possible environments
export enum EnvironmentEnum {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
  CORPORATE = "corporate",
}

export function getEnvironment(): EnvironmentEnum {
  const hostname = window.location.hostname;

  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.includes("dev")
  ) {
    return EnvironmentEnum.DEVELOPMENT;
  }

  return EnvironmentEnum.PRODUCTION;
}

const useEnvironment = () => {
  const environment = useMemo(() => getEnvironment(), []);

  return {
    environment,
    isCorporate: environment === EnvironmentEnum.CORPORATE,
  };
};

export default useEnvironment;
