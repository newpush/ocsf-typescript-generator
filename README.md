# OCSF TypeScript Generator

A robust TypeScript code generator for creating strongly-typed interfaces and types from OCSF (Open Cybersecurity Schema Framework) schema definitions.

## Overview

The OCSF TypeScript Generator is a tool designed to automatically generate TypeScript interfaces, types, and enums from OCSF schema definitions. This ensures type safety and consistency when working with OCSF data structures in TypeScript projects.

## Features

- Generates TypeScript interfaces from OCSF object schemas
- Creates type-safe enums from OCSF enumerated values
- Produces base types for common OCSF structures
- Maintains type mapping between OCSF and TypeScript types
- Supports custom configuration for type generation
- Generates comprehensive type documentation

## Project Structure

```
ocsf-typescript-generator/
├── src/
│   ├── index.ts           # Main entry point
│   ├── types.ts           # Core type definitions
│   ├── utils.ts           # Utility functions
│   ├── enum-generator.ts  # Enum generation logic
│   ├── base-type-generator.ts    # Base type generation
│   ├── interface-generator.ts    # Interface generation
│   ├── type-map-builder.ts      # Type mapping logic
│   └── config.ts          # Configuration settings
├── generated/             # Output directory for generated types
│   └── objects/          # Generated TypeScript interfaces and types
└── README.md             # This documentation
```

## Installation

```bash
npm install
```

## Usage

1. Configure the generator in `src/config.ts`:

```typescript
// Example configuration
export const config = {
  inputDir: './schemas',
  outputDir: './generated'
  // Additional configuration options...
}
```

2. Run the generator:

```bash
npm run generate
```

## Generated Output

The generator creates several types of TypeScript files:

1. Interface Definitions:

```typescript
// Example generated interface
export interface Device {
  id: string
  type: string
  name?: string
  // Additional properties...
}
```

2. Enum Types:

```typescript
// Example generated enum
export enum DeviceType {
  WORKSTATION = 'workstation',
  SERVER = 'server'
  // Additional enum values...
}
```

3. Base Types:

```typescript
// Example generated base type
export type BaseAsset = {
  uid: string
  metadata: AssetMetadata
  // Common properties...
}
```

## Development

### Adding New Generators

1. Create a new generator class in `src/generators/`
2. Implement the generator interface
3. Register the generator in `src/index.ts`

### Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Best Practices

- Follow TypeScript best practices for type definitions
- Maintain backward compatibility when updating generators
- Add comprehensive documentation for generated types
- Include examples for complex type structures

## License

[License details here]

## Related Documentation

- [OCSF Schema Adoption Notes](../../docs/ocsf-schema-adoption-notes.md)
- [OCSF Schema Implementation](../../docs/ocsf-schema-implementation.md)
- [OCSF Schema Adoption](../../docs/ocsf-schema-adoption.md)
