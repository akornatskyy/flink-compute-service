export type Cluster = {
  id: string;
};

export type ClusterInstance = {
  id: string;
  role?: string;
  imageId?: string;
  instanceType?: string;
  launchTime?: Date;
  privateIpAddress?: string;
  state?: string;
  architecture?: string;
  lifecycle?: string | undefined;
};

export type ListClustersRequest = {
  namespace: string;
  nextToken?: string;
};

export type ListClustersResponse = {
  clusters: Cluster[];
  nextToken?: string;
};

export type ListClusterInstancesRequest = {
  namespace: string;
  id: string;
  nextToken?: string;
};

export type ListClusterInstancesResponse = {
  instances: ClusterInstance[];
  nextToken?: string;
};

export type ImageFilter = {
  name?: string;
  architecture?: string;
};

export type CreateJobManagerInstanceInput = {
  instanceType: string;
  marketType?: 'SPOT';
  startTaskManager?: boolean;
  config?: Record<string, string | number>;
};

export type CreateTaskManagerInstanceInput = {
  instanceType: string;
  marketType?: 'SPOT';
  count: number;
  config?: Record<string, string | number>;
};

export type CreateClusterRequest = {
  id?: string;
  namespace: string;
  lifetimeSeconds: number;
  entrypoint: string;
  sourceUrl: string;
  imageId?: string;
  imageFilter?: ImageFilter;
  jobManager: CreateJobManagerInstanceInput;
  taskManager?: CreateTaskManagerInstanceInput;
  tags?: Record<string, string>;
};

export type CreateClusterResponse = {
  id: string;
};

export enum ClusterTagName {
  NAMESPACE = 'fcs:namespace',
  CLUSTER_ID = 'fcs:cluster-id',
  ROLE = 'fcs:role',
}

export enum ClusterRole {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

export interface ClusterService {
  listClusters(req: ListClustersRequest): Promise<ListClustersResponse>;
  listClusterInstances(
    req: ListClusterInstancesRequest,
  ): Promise<ListClusterInstancesResponse>;

  createCluster(req: CreateClusterRequest): Promise<CreateClusterResponse>;
}
