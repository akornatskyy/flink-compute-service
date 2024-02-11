export type Config = {
  token: string;
};

export function getConfig(env: Record<string, string | undefined>): Config {
  const {API_AUTH_TOKEN: token = ''} = env;
  return {
    token,
  };
}
