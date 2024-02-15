import {CreateClusterRequest} from '../types';

export type PrimaryContext = {
  req: CreateClusterRequest;
};

export type SecondaryContext = {
  req: CreateClusterRequest;
  primaryAddress: string;
};

export interface ScriptPlugin {
  primary(ctx: PrimaryContext): string;
  secondary?(ctx: SecondaryContext): string;
}
