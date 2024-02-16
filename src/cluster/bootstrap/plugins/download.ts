import {PrimaryContext, ScriptPlugin, SecondaryContext} from '../types';

export class DownloadSourcePlugin implements ScriptPlugin {
  primary(ctx: PrimaryContext): string {
    const {sourceUrl: url} = ctx.req;
    return new URL(url).protocol === 's3:'
      ? `aws s3 cp "${url}" /opt/flink/lib/app.jar`
      : `curl -s --retry 3 --retry-all-errors -o /opt/flink/lib/app.jar "${url}"`;
  }

  secondary(ctx: SecondaryContext): string {
    return this.primary(ctx);
  }
}
