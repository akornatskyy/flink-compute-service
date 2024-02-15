import {EC2Client} from '@aws-sdk/client-ec2';
import {TokenAuthorizer} from './authorizer/services';
import {Authorizer} from './authorizer/types';
import {DefaultBootstrap} from './cluster/bootstrap';
import {DownloadSourcePlugin} from './cluster/bootstrap/plugins/download';
import {HostAddressPlugin} from './cluster/bootstrap/plugins/hostaddress';
import {LifetimePlugin} from './cluster/bootstrap/plugins/lifetime';
import {StandaloneJobPlugin} from './cluster/bootstrap/plugins/standalone';
import {TaskManagerPlugin} from './cluster/bootstrap/plugins/taskmanager';
import {DefaultClusterService} from './cluster/services';
import {ClusterService} from './cluster/types';
import {Config} from './config';
import {DefaultImageService} from './image/services';
import {ImageService} from './image/types';

export class Factory {
  readonly authorizer: Authorizer;
  readonly imageService: ImageService;
  readonly clusterService: ClusterService;

  constructor(config: Config) {
    this.authorizer = new TokenAuthorizer(config.token);
    const client = new EC2Client();
    this.imageService = new DefaultImageService(client, {
      owner: 'self',
    });
    this.clusterService = new DefaultClusterService(
      this.imageService,
      new DefaultBootstrap({
        plugins: [
          new LifetimePlugin(),
          new DownloadSourcePlugin(),
          new HostAddressPlugin(),
          new TaskManagerPlugin(),
          new StandaloneJobPlugin(),
        ],
      }),
      client,
    );
  }
}
