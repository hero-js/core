import Router from '../class/Router'; // Adjust the import path as needed
import { GenericTypes, RequestHandler } from '../interfaces/router';

type G = GenericTypes<() => string>;

describe('Router', () => {
  it('should create an instance of Router', () => {
    const router = Router.create<G>();
    expect(router).toBeInstanceOf(Router);
  });

  it('should add a "use" route with middleware', () => {
    const router = Router.create<G>();
    router.use(({request, response, next}) => {
      // Middleware logic
      next();
    });
    const route = router['routes'].get('use::*');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "post" route', () => {
    const router = Router.create<G>();
    router.post('/api', 'ControllerName.create');
    const route = router['routes'].get('post::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "get" route', () => {
    const router = Router.create<G>();
    router.get('/api', 'ControllerName.one');
    const route = router['routes'].get('get::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "put" route', () => {
    const router = Router.create<G>();
    router.put('/api', 'ControllerName.update');
    const route = router['routes'].get('put::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "patch" route', () => {
    const router = Router.create<G>();
    router.patch('/api', 'ControllerName.patch');
    const route = router['routes'].get('patch::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "delete" route', () => {
    const router = Router.create<G>();
    router.delete('/api', 'ControllerName.delete');
    const route = router['routes'].get('delete::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add middleware to the last mounted route', () => {
    const router = Router.create<G>();
    router.use(({request, response, next}) => {
      // Middleware logic
      next();
    });
    router.use(({request, response, next}) => {
      // Another middleware logic
      next();
    });
    router.middleware([({request, response, next}) => {
      // Additional middleware
      next();
    }]);

    const route = router['routes'].get('use::*');
    expect(route?.middlewares).toHaveLength(3);
  });

  it('should apply batch middlewares to selected routes', () => {
    const router = Router.create<G>();
    router.use(({request, response, next}) => {
      // Middleware logic
      next();
    });
    router.use(({request, response, next}) => {
      // Another middleware logic
      next();
    });
    router.post('/api', 'ControllerName.create').middleware([({next}) => next()]);
    router.get('/api', 'ControllerName.one').middleware([({ next }) => next()]);

    const routeKeys = ['use::*', 'post::/api', 'get::/api'];
    const middlewares: RequestHandler<G>[] = [({request, response, next}) => {
      // Batch middleware logic
      next();
    }];

    router.batchMiddlewares(middlewares)(routeKeys);

    for (const routeKey of routeKeys) {
      const route = router['routes'].get(routeKey);
      expect(route?.middlewares).toHaveLength(3); // 1 original + 1 middleware + 1 batch middleware
    }
  });
});
