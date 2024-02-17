import {PrimaryContext, ScriptPlugin, SecondaryContext} from '../types';

export class CloudWatchAgentPlugin implements ScriptPlugin {
  constructor(private readonly name: string) {}

  primary(ctx: PrimaryContext): string {
    const {namespace, jobManager} = ctx.req;
    const {instanceProfile} = jobManager;
    if (!instanceProfile || (!instanceProfile.arn && !instanceProfile.name)) {
      return '# WARN: CloudWatch Agent requires jobManager.instanceProfile.';
    }

    return this.configure(
      '/' + this.name + '/' + namespace,
      ctx.id + '-primary-{instance_id}',
    );
  }

  secondary(ctx: SecondaryContext): string {
    const {namespace, taskManager} = ctx.req;
    if (
      !taskManager ||
      !taskManager.instanceProfile ||
      (!taskManager.instanceProfile.arn && !taskManager.instanceProfile.name)
    ) {
      return '# WARN: CloudWatch Agent requires taskManager.instanceProfile.';
    }

    return this.configure(
      '/' + this.name + '/' + namespace,
      ctx.id + '-secondary-{instance_id}',
    );
  }

  private configure(logGroupName: string, logStreamName: string): string {
    return `\
cat <<EOF > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.d/config.json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/cloud-init-output.log",
            "log_group_name": "${logGroupName}",
            "log_stream_name": "${logStreamName}"
          }
        ]
      }
    }
  }
}
EOF
systemctl start amazon-cloudwatch-agent`;
  }
}
