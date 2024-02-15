import {PrimaryContext, ScriptPlugin} from '../types';

export class HostAddressPlugin implements ScriptPlugin {
  primary(ctx: PrimaryContext): string {
    const {taskManager} = ctx.req;
    const exposed = taskManager && taskManager.count > 0;
    return exposed ? 'ip=$(hostname -I)' : '# localhost only';
  }
}
