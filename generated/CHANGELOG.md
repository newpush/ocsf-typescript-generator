# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-03

### Added
- Initial release of OCSF TypeScript type definitions
- Complete set of OCSF object type definitions
- Base type definitions (boolean_t, datetime_t, etc.)
- Full TypeScript support with type exports
- Comprehensive README with usage examples
- MIT License

### Known Issues
- Type incompatibility in device.ts where OCSFDevice.name is optional but extends from OCSFEndpoint where name is required
