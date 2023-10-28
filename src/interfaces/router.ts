import Context from '@hero-js/context';
import Router from '../class/Router';

export type GenericTypes<
  N = unknown,
  T extends Record<string, any> = Record<string, any>,
  R extends Record<string, any> = Record<string, any>
> = {
  T: T;
  R: R;
  N: N;
};

type Request<T = GenericTypes['T'], K extends keyof T = keyof T> = {
  [x in K]: T[x];
} & {
  user?: Record<string, any>;
  context?: Context;
};

export interface RequestHandlerParams<G extends GenericTypes> {
  request: Request<G['T']>;
  response: G['R'];
  next: G['N'];
}

export type RequestHandler<G extends GenericTypes> =
  | string
  | ((params: RequestHandlerParams<G>) => any);

export type AllowedMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'use';

// export interface RouteSettings<G extends GenericTypes> {
//   path: string;
//   method: AllowedMethod;
//   handler: RequestHandler<G> | string;
//   middlewares: (RequestHandler<G> | string)[];
// }

export interface RouteSettings<G extends GenericTypes>
  extends Map<
    string,
    {
      method: AllowedMethod;
      middlewares: (RequestHandler<G> | string)[];
    }
  > {}

export interface IRoute<G extends GenericTypes>
  extends Omit<Router<G>, 'middleware'> {}
