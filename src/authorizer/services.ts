import {Authorizer} from './types';

export class TokenAuthorizer implements Authorizer {
  constructor(private readonly token: string) {}

  async authorize(token: string): Promise<boolean> {
    return token === this.token;
  }
}
