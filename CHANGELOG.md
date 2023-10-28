# Changelog

All notable changes to the `@hero-js/core` package will be documented in this file.

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
