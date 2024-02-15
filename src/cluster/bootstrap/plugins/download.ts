import {PrimaryContext, ScriptPlugin, SecondaryContext} from '../types';

export class DownloadSourcePlugin implements ScriptPlugin {
  primary(ctx: PrimaryContext): string {
    const {sourceUrl: url} = ctx.req;
    return new URL(url).protocol === 's3:'
      ? `aws s3 cp "${url}" /usr/local/lib/app.jar`
      : `curl -s --retry 3 --retry-all-errors -o /usr/local/lib/app.jar "${url}"`;
  }

  secondary(ctx: SecondaryContext): string {
    return this.primary(ctx);
  }
}
