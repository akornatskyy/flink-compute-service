import {PrimaryContext, ScriptPlugin, SecondaryContext} from '../types';

export class LifetimePlugin implements ScriptPlugin {
  primary(ctx: PrimaryContext): string {
    const {lifetimeSeconds} = ctx.req;
    return `(sleep ${lifetimeSeconds} ; poweroff)&`;
  }

  secondary(ctx: SecondaryContext): string {
    return this.primary(ctx);
  }
}
