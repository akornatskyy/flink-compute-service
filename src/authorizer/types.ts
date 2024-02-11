export interface Authorizer {
  authorize(token: string): Promise<boolean>;
}
