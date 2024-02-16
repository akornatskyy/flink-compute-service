import {PrimaryContext, ScriptPlugin, SecondaryContext} from '../types';
import {configOverrides} from './helpers';

export class TaskManagerPlugin implements ScriptPlugin {
  primary(ctx: PrimaryContext): string {
    if (!ctx.req.jobManager.startTaskManager) {
      return '# no task manager';
    }

    const {taskManager} = ctx.req;
    const exposed = taskManager && taskManager.count > 0;
    return `/opt/flink/bin/taskmanager.sh start-foreground ${configOverrides(
      exposed
        ? {
            ...ctx.req.jobManager.config,
            'jobmanager.rpc.address': '${ip}',
          }
        : ctx.req.jobManager.config,
    )} &`;
  }

  secondary(ctx: SecondaryContext): string {
    return `/opt/flink/bin/taskmanager.sh start-foreground ${configOverrides({
      'taskmanager.registration.timeout': '1m',
      ...ctx.req.taskManager!.config,
      'jobmanager.rpc.address': ctx.primaryAddress,
    })}`;
  }
}
