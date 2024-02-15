import {PrimaryContext, ScriptPlugin, SecondaryContext} from './types';

export interface Bootstrap {
  primary(ctx: PrimaryContext): string;
  secondary(ctx: SecondaryContext): string;
}

export type DefaultBootstrapOptions = {
  plugins: ScriptPlugin[];
};

export class DefaultBootstrap implements Bootstrap {
  private readonly primaryPlugins: Pick<ScriptPlugin, 'primary'>[];
  private readonly secondaryPlugins: Pick<ScriptPlugin, 'secondary'>[];

  constructor(options: DefaultBootstrapOptions) {
    this.primaryPlugins = options.plugins;
    this.secondaryPlugins = options.plugins.filter((p) => !!p.secondary);
  }

  primary(ctx: PrimaryContext): string {
    return `#!/usr/bin/env sh
set +e
${this.primaryPlugins.map((p) => p.primary(ctx)).join('\n')}
poweroff`;
  }

  secondary(ctx: SecondaryContext): string {
    return `#!/usr/bin/env sh
set +e
${this.secondaryPlugins.map((p) => p.secondary!(ctx)).join('\n')}
poweroff`;
  }
}
