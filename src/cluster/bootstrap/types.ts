import {CreateClusterRequest} from '../types';

export type PrimaryContext = {
  id: string;
  req: CreateClusterRequest;
};

export type SecondaryContext = {
  id: string;
  req: CreateClusterRequest;
  primaryAddress: string;
};

export interface ScriptPlugin {
  primary(ctx: PrimaryContext): string;
  secondary?(ctx: SecondaryContext): string;
}
