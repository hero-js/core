import Context from '@hero-js/context';
import Router from '../class/Router';

/**
 * Generic types for the request, response, and "next" function.
 * @template N - Type for the "next" function.
 * @template T - Type for the request.
 * @template R - Type for the response.
 */
export type GenericTypes<
  N = unknown,
  T extends Record<string, any> = Record<string, any>,
  R extends Record<string, any> = Record<string, any>
> = {
  T: T;
  R: R & { statusCode?: number };
  N: N;
};

/**
 * Represents a request object.
 * @template T - Type for the request.
 * @template K - Keys of the request.
 */
type Request<T = GenericTypes['T'], K extends keyof T = keyof T> = {
  [x in K]: T[x];
} & {
  user?: Record<string, any>;
  context?: Context;
};

/**
 * Parameters for a request handler function.
 * @template G - Generic types for request, response, and "next" function.
 */
export interface RequestHandlerParams<G extends GenericTypes> {
  request: Request<G['T']>;
  response: G['R'];
  next: G['N'];
}

/**
 * Represents a request handler which can be a class name or a function.
 * @template G - Generic types for request, response, and "next" function.
 */
export type RequestHandler<G extends GenericTypes> =
  | string
  | ((params: RequestHandlerParams<G>) => any);

/**
 * Allowed HTTP methods for routing.
 */
export type AllowedMethod = 'post' | 'get' | 'put' | 'patch' | 'delete' | 'use';

export const HTTP_METHOD: { [x in Uppercase<AllowedMethod>]: Lowercase<x> } = {
  POST: 'post',
  GET: 'get',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
  USE: 'use',
  // HEAD: 'head',
  // OPTIONS: 'options',
  // CONNECT: 'connect',
  // TRACE: 'trace'
};

/**
 * Route settings for the router.
 * @template G - Generic types for request, response, and "next" function.
 */
export interface RouteSettings<G extends GenericTypes>
  extends Map<
    string,
    {
      method: AllowedMethod;
      middlewares: (RequestHandler<G> | string)[];
      // controllers: (RequestHandler<G> | string)[];
    }
  > {}

export interface RouteStore<G extends GenericTypes>
  extends Map<string, RouteSettings<G>> {}

export type RouteKey = `${string}::${string}`;

/**
 * Interface for a route.
 * @template G - Generic types for request, response, and "next" function.
 */
export interface IRoute<G extends GenericTypes>
  extends Omit<Router<G>, 'middleware'> {}
