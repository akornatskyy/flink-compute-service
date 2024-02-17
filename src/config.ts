export type Config = {
  name: string;
  token: string;
};

export function getConfig(env: Record<string, string | undefined>): Config {
  const {
    FCS_NAME: name = 'flink-compute-service',
    FCS_API_AUTH_TOKEN: token = '',
  } = env;
  return {
    name,
    token,
  };
}
