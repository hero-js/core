import Middleware from '../class/Middleware';
import { GenericTypes } from './router';

export type MiddlewareInstance<G extends GenericTypes> = InstanceType<
  typeof Middleware<G>
>;
