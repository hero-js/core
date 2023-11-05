# Changelog

All notable changes to the `@hero-js/core` package will be documented in this file.

## [0.1.1] - 2023-11-05

### Added

- Added `Middleware` as an abstraction class for controllers and middlewares.

## [0.1.0] - 2023-10-29

### Added

- Added support for dynamic middleware preloading using the `Router.preload` method.
- Introduced support for middleware class resolution and handler methods.
- Added a new `fullPreload` option to preload all middleware classes.
- Support for specifying the name of the router instance.
- Enabled creation of a new `Router` instance with a name.
- Enhanced middleware mounting with dynamic class resolution.

### Changed

- Modified the `Router` constructor to accept additional options like `name` and `fullPreload`.
- Updated the `Router.use` method to create a new instance of `Router`.
- Refined the error messages for middleware loading failures.
- Improved middleware class name resolution.

### Removed

- Removed the warning message about invalid paths in the `Router.use` method.

## [Unreleased]

### Added

- Added the `Router` class for managing generic routes.
- Introduced support for generic types for request, response, and "next" functions.
- Added methods for routing HTTP requests (`post`, `get`, `put`, `patch`, `delete`).
- Support for specifying middleware at the route level (`use`).
- Added the ability to apply a batch of middlewares to selected routes.
- Option to specify a custom context during instantiation or use a volatile context by default.
- Method to retrieve the last mounted route key.

## [0.0.9] - 2023-10-28

- Initial release of `@hero-js/core` package.
- Basic routing functionality with generic types support.
