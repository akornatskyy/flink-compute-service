import {CreateClusterRequest} from './types';

export function makePrimaryNodeScript(req: CreateClusterRequest) {
  const {sourceUrl, jobManager, taskManager, lifetimeSeconds, entrypoint} = req;
  const {startTaskManager, config = {}} = jobManager;
  const exposeIp = taskManager && taskManager.count > 0;
  return `#!/usr/bin/env sh
set +e
(sleep ${lifetimeSeconds} ; poweroff)&
curl -s --retry 3 --retry-all-errors -o /usr/local/lib/app.jar "${sourceUrl}"
${exposeIp ? 'ip=$(hostname -I)' : '# localhost only'}
${
  startTaskManager
    ? `taskmanager.sh start-foreground ${configOverrides(
        exposeIp
          ? {
              ...config,
              'jobmanager.rpc.address': '${ip}',
            }
          : config,
      )} &`
    : '# no task manager'
}
standalone-job.sh start-foreground ${configOverrides(
    exposeIp
      ? {
          ...config,
          'jobmanager.rpc.address': '${ip}',
          'jobmanager.bind-host': '${ip}',
        }
      : config,
  )}\
  --job-classname ${entrypoint}
poweroff`;
}

export function makeSecondaryNodeScript(req: CreateClusterRequest, ip: string) {
  const {sourceUrl, taskManager, lifetimeSeconds} = req;
  if (!taskManager) {
    return '';
  }

  const {config = {}} = taskManager;
  return `#!/usr/bin/env sh
set +e
(sleep ${lifetimeSeconds} ; poweroff)&
curl -s --retry 3 --retry-all-errors -o /usr/local/lib/app.jar "${sourceUrl}"
taskmanager.sh start-foreground ${configOverrides({
    'taskmanager.registration.timeout': '1m',
    ...config,
    'jobmanager.rpc.address': ip,
  })}
poweroff`;
}

function configOverrides(config?: Record<string, string | number>): string {
  if (!config) {
    return '';
  }

  return Object.entries(config)
    .map(([key, value]) => `-D ${key}=${value}`)
    .join(' ');
}
