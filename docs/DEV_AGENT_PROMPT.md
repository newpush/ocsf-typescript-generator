# OCSF TypeScript Generator - Development Agent Prompt

You are an AI development agent working on the **OCSF TypeScript Generator**, a code generation tool that automatically produces TypeScript type definitions from OCSF (Open Cybersecurity Schema Framework) schema definitions. Your task is to maintain code quality, improve generation logic, and extend schema coverage while adhering to TypeScript best practices.

## Project Overview

**OCSF TypeScript Generator** is a TypeScript-based code generation tool that:
- Parses OCSF schema definitions (JSON format)
- Generates TypeScript interfaces from OCSF object schemas
- Creates type-safe enums from OCSF enumerated values
- Produces base types for common OCSF structures
- Maintains type mapping consistency between OCSF and TypeScript
- Outputs comprehensive, documented TypeScript code

The goal is to ensure type safety when working with OCSF data in TypeScript projects.

### Core Technologies
- **TypeScript 5.6.3** (language and type system)
- **tsx 4.19.2** (TypeScript execution without build step)
- **Node.js LTS** runtime
- **OCSF Schema** (input source, typically JSON format)

## File Structure

```
ocsf-typescript-generator/
├── src/
│   ├── index.ts                 # Main entry point, orchestration
│   ├── types.ts                 # Core TypeScript type definitions
│   ├── utils.ts                 # Utility functions (parsing, formatting)
│   ├── config.ts                # Configuration settings & paths
│   ├── enum-generator.ts        # Enum generation from OCSF enums
│   ├── base-type-generator.ts   # Base type generation for common structures
│   ├── interface-generator.ts   # Interface generation from OCSF objects
│   └── type-map-builder.ts      # Type mapping & OCSF->TS conversion
├── generated/                   # Output directory (generated types)
│   └── objects/                 # Generated TypeScript interfaces
├── scripts/
│   └── update-schema.sh          # Bash script to fetch/update schema
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Project documentation
└── docs/
    └── DEV_AGENT_PROMPT.md     # This file
```

## Architecture & Design Patterns

### 1. Generation Pipeline

The generator follows a multi-stage pipeline:

```
Input Schema (OCSF JSON)
       ↓
   Parser (types.ts)
       ↓
   Type Mappers (type-map-builder.ts)
       ↓
   ├─→ Enum Generator
   ├─→ Base Type Generator
   └─→ Interface Generator
       ↓
   Formatter (utils.ts)
       ↓
Output (TypeScript files in generated/)
```

### 2. Core Classes/Functions

**types.ts** - Core type definitions:
```typescript
interface OCSFObject {
  id: string;
  name: string;
  description?: string;
  attributes: Map<string, OCSFAttribute>;
  base?: string;  // Inheritance
}

interface OCSFAttribute {
  type: string;
  description?: string;
  enum?: string[];
  required?: boolean;
}

interface OCSFEnum {
  id: string;
  name: string;
  values: Map<string, string>;  // value -> label
}
```

**interface-generator.ts** - Interface generation:
```typescript
export class InterfaceGenerator {
  generate(object: OCSFObject): string {
    // Convert OCSF object to TypeScript interface
    // Handle inheritance (extends)
    // Add JSDoc comments
  }
}
```

**enum-generator.ts** - Enum generation:
```typescript
export class EnumGenerator {
  generate(ocsfEnum: OCSFEnum): string {
    // Convert OCSF enum to TypeScript enum
    // Add value mappings
    // Add JSDoc documentation
  }
}

**type-map-builder.ts** - Type mapping:
```typescript
export class TypeMapBuilder {
  mapOCSFTypeToTS(ocsfType: string): string {
    // Map OCSF type names to TypeScript types
    // Examples:
    // "integer" → "number"
    // "string" → "string"
    // "object" → "any" or custom interface ref
    // "array" → "[]"
  }
}
```

### 3. Configuration (config.ts)

```typescript
export const config = {
  inputDir: './schemas',           // OCSF schema directory
  outputDir: './generated',        // Output directory
  objectsDir: './generated/objects', // Generated interfaces
  includeJSDoc: true,              // Add JSDoc comments
  validateTypes: true,             // Type validation
  baseTypePrefix: 'Base',          // Prefix for base types
  enumNameStyle: 'UPPER_SNAKE',    // Enum naming convention
};
```

## Development Rules & Patterns

### 1. TypeScript Strict Typing

Use strict TypeScript in all code:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "lib": ["ES2020"],
    "target": "ES2020",
    "module": "ES2020",
    "declaration": true,
    "outDir": "./dist"
  }
}
```

### 2. Generator Class Pattern

All generators follow this pattern:

```typescript
export class MyGenerator {
  private config: typeof config;

  constructor(config: typeof config = defaultConfig) {
    this.config = config;
  }

  generate(input: OCSFInput): string {
    // Validate input
    this.validate(input);

    // Transform input
    const transformed = this.transform(input);

    // Format output
    return this.format(transformed);
  }

  private validate(input: OCSFInput): void {
    if (!input || !input.id) {
      throw new Error('Invalid input: missing id');
    }
  }

  private transform(input: OCSFInput): any {
    // Main generation logic
  }

  private format(output: any): string {
    // Format to TypeScript code
  }
}
```

### 3. Type Mapping

Maintain centralized type mapping:

```typescript
const OCSFToTSTypeMap: Record<string, string> = {
  'integer': 'number',
  'string': 'string',
  'boolean': 'boolean',
  'float': 'number',
  'timestamp_t': 'Date | number',
  'object_t': 'any',  // Or specific interface reference
  'array_t': '[]',
  'json_t': 'any',
};

function mapType(ocsfType: string, context?: OCSFContext): string {
  const baseType = OCSFToTSTypeMap[ocsfType];
  if (!baseType) {
    console.warn(`Unknown OCSF type: ${ocsfType}`);
    return 'any';
  }
  return baseType;
}
```

### 4. JSDoc Documentation

All generated interfaces must include JSDoc:

```typescript
/**
 * Device object representing a network-connected device.
 * 
 * @example
 * const device: Device = {
 *   id: 'abc123',
 *   name: 'WORKSTATION-01',
 *   type: 'workstation'
 * };
 */
export interface Device {
  /**
   * Unique identifier for the device.
   * @type {string}
   */
  id: string;

  /**
   * Device name or hostname.
   * @type {string}
   */
  name: string;

  /**
   * Device type (workstation, server, etc).
   * @type {DeviceType}
   */
  type: DeviceType;
}
```

### 5. Error Handling

All generators must handle errors gracefully:

```typescript
try {
  const schema = loadSchema(inputPath);
  const result = generator.generate(schema);
  writeFile(outputPath, result);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Schema validation failed:', error.message);
    process.exit(1);
  }
  throw error;
}
```

### 6. Unit Testing (if applicable)

```typescript
// Example test for type mapping
describe('TypeMapBuilder', () => {
  const builder = new TypeMapBuilder();

  it('maps OCSF integer to TypeScript number', () => {
    expect(builder.mapOCSFTypeToTS('integer')).toBe('number');
  });

  it('maps OCSF string to TypeScript string', () => {
    expect(builder.mapOCSFTypeToTS('string')).toBe('string');
  });

  it('throws error for unknown types', () => {
    expect(() => builder.mapOCSFTypeToTS('unknown_type')).toThrow();
  });
});
```

## Workflow: Adding a New Generator

1. **Create file** in `src/{new-generator}.ts`
2. **Define input schema** (what OCSF structure it processes)
3. **Implement validation** logic
4. **Implement transformation** logic
5. **Implement formatting** logic
6. **Register in index.ts** main orchestration
7. **Add tests** if applicable
8. **Update README.md** with usage

## Workflow: Extending Schema Coverage

1. **Update OCSF schema** (typically via `scripts/update-schema.sh`)
2. **Add type mappings** for new OCSF types in `type-map-builder.ts`
3. **Update generators** to handle new object types
4. **Run generation** via `npm run schema:generate`
5. **Validate output** in `generated/objects/`
6. **Update tests** with new test cases

## Build & Execution

**Scripts:**
```bash
npm run schema:generate   # Generate types from current schema
npm run schema:update     # Fetch latest OCSF schema and generate
```

**Manual Execution (for development):**
```bash
# Run with tsx (no build step needed)
npx tsx src/index.ts --config ./src/config.ts

# Or compile first
npx tsc
node dist/index.js
```

## Key Dependencies

- **typescript** (5.6.3): Language and type system
- **tsx** (4.19.2): TypeScript execution runtime

## Common Tasks

### Update OCSF Schema
1. Run `npm run schema:update` (fetches latest schema)
2. Review changes in `generated/objects/`
3. Commit generated types

### Add Support for New OCSF Type
1. Add mapping in `type-map-builder.ts`
2. Update relevant generator if needed
3. Run `npm run schema:generate`
4. Test output

### Customize Generated Output Format
1. Modify `format()` methods in generators
2. Update JSDoc template if needed
3. Adjust enum naming style in config
4. Re-generate and verify

## Known Patterns

1. **Inheritance**: Generated interfaces extend base types when applicable
2. **Enum Naming**: Use UPPER_SNAKE_CASE for enum members by default
3. **Optional Fields**: Mark optional OCSF attributes with `?` in TypeScript
4. **Type References**: Reference other generated interfaces by name

## Notes for Agents

- This is a **code generator tool** — focus on generation logic and quality
- **Type safety is critical** — all generated code must be valid, strict TypeScript
- **OCSF schema is the source of truth** — changes there drive generation
- **Backward compatibility is important** — existing generated interfaces may be imported
- **Documentation is essential** — JSDoc helps users understand generated types
- Check existing generators for patterns before adding new ones
- Test with actual OCSF schema data to ensure correctness
- Generated files should be readable and maintainable (not obfuscated)
- Update scripts/update-schema.sh if schema source location changes
