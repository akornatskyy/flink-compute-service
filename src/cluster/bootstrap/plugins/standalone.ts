import {PrimaryContext, ScriptPlugin} from '../types';
import {configOverrides} from './helpers';

export class StandaloneJobPlugin implements ScriptPlugin {
  primary(ctx: PrimaryContext): string {
    const {entrypoint, jobManager, taskManager} = ctx.req;
    const exposed = taskManager && taskManager.count > 0;
    return `/opt/flink/bin/standalone-job.sh start-foreground ${configOverrides(
      exposed
        ? {
            ...jobManager.config,
            'jobmanager.rpc.address': '${ip}',
            'jobmanager.bind-host': '${ip}',
          }
        : jobManager.config,
    )} --job-classname ${entrypoint}`;
  }
}
