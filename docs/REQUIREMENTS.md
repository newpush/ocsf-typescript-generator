# OCSF TypeScript Generator — Requirements

## 1. Overview

The OCSF TypeScript Generator is a code generation tool that produces TypeScript type definitions from [OCSF (Open Cybersecurity Schema Framework)](https://github.com/ocsf/ocsf-schema) schema definitions. It enables TypeScript projects to consume OCSF data structures with full type safety, comprehensive JSDoc documentation, and consistent naming conventions.

### 1.1 Objectives

- Automate the creation of TypeScript interfaces, enums, and base types from OCSF JSON schema files.
- Ensure generated code is strict-mode compliant, well-documented, and immediately consumable by downstream TypeScript projects.
- Provide a repeatable pipeline that can be re-run whenever the upstream OCSF schema is updated.

## 2. Functional Requirements

### 2.1 Schema Ingestion

| ID | Requirement | Status |
|----|-------------|--------|
| FR-01 | The tool shall fetch the latest OCSF schema from the official ocsf/ocsf-schema GitHub repository via scripts/update-schema.sh. | Implemented |
| FR-02 | The tool shall read OCSF object definitions from schema/objects/*.json. | Implemented |
| FR-03 | The tool shall read the OCSF dictionary from schema/dictionary.json to resolve attribute types, descriptions, and enum definitions. | Implemented |
| FR-04 | The tool shall process base-type files (prefixed with _, e.g. _entity.json) before regular object files to ensure correct inheritance resolution. | Implemented |

### 2.2 Type Generation

| ID | Requirement | Status |
|----|-------------|--------|
| FR-05 | For every OCSF object schema the tool shall generate a corresponding TypeScript interface in generated/objects/. | Implemented |
| FR-06 | Generated interfaces shall use the OCSF prefix naming convention (e.g. OCSF object device becomes OCSFDevice). | Implemented |
| FR-07 | When an OCSF object extends another object, the generated interface shall use TypeScript extends to model that inheritance. | Implemented |
| FR-08 | Attributes marked required in the schema shall be non-optional properties; all other attributes shall use the ?: optional modifier. | Implemented |
| FR-09 | If a parent type marks an attribute as required, child types shall preserve that requirement even when the child's own definition does not repeat it. | Implemented |

### 2.3 Base Type Generation

| ID | Requirement | Status |
|----|-------------|--------|
| FR-10 | The tool shall generate branded base types (e.g. OCSFStringT, OCSFIntegerT, OCSFBooleanT) from the dictionary's types.attributes section and write them to generated/types/. | Implemented |
| FR-11 | Base types with constrained values (e.g. boolean_t) shall be generated as union literal types. | Implemented |
| FR-12 | Base types that reference another underlying type (e.g. datetime_t based on string_t) shall resolve to the correct TypeScript primitive. | Implemented |
| FR-13 | A barrel index.ts shall be generated in generated/types/ to re-export all base types. | Implemented |

### 2.4 Enum Generation

| ID | Requirement | Status |
|----|-------------|--------|
| FR-14 | Integer-typed attributes with enum definitions shall produce a const enum with numeric values and a companion union type alias. | Implemented |
| FR-15 | String-typed attributes with enum definitions shall produce a string-literal union type. | Implemented |
| FR-16 | Enum members shall derive their names from the OCSF caption field, converted to UPPER_SNAKE_CASE. | Implemented |

### 2.5 Documentation Generation

| ID | Requirement | Status |
|----|-------------|--------|
| FR-17 | Every generated interface shall include a JSDoc block with the OCSF object's caption and description. | Implemented |
| FR-18 | Every generated property shall include a JSDoc block sourced from the dictionary attribute's caption and description, falling back to the schema attribute if the dictionary entry is absent. | Implemented |
| FR-19 | Enum-typed properties shall list all possible values and their descriptions in the JSDoc block. | Implemented |
| FR-20 | Base types with a regex constraint shall include a @pattern JSDoc tag. | Implemented |

### 2.6 Import Management

| ID | Requirement | Status |
|----|-------------|--------|
| FR-21 | Generated files shall include only the imports they actually use (no unused imports). | Implemented |
| FR-22 | Imports shall be sorted alphabetically. | Implemented |
| FR-23 | Self-imports shall be excluded. | Implemented |
| FR-24 | A barrel index.ts shall be generated in generated/objects/ to re-export all object interfaces. | Implemented |

### 2.7 Type Mapping

| ID | Requirement | Status |
|----|-------------|--------|
| FR-25 | OCSF primitive types shall map to TypeScript as follows: string_t to string, integer_t to number, number_t to number, boolean_t to boolean, json_t to Record<string, unknown>, object_t to Record<string, unknown>. | Implemented |
| FR-26 | When a dictionary attribute's type field matches the filename of an existing OCSF object (e.g. device), the generated property type shall reference that object's interface instead of a primitive. | Implemented |
| FR-27 | Array-typed attributes (is_array: true) shall append [] to the resolved type. | Implemented |

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-01 | Full generation from a complete OCSF schema shall complete in under 30 seconds on a standard developer machine. |
| NFR-02 | The tool shall process files sequentially (base types first, then regular objects) to guarantee deterministic output ordering for clean git diffs. |

### 3.2 Compatibility

| ID | Requirement |
|----|-------------|
| NFR-03 | Generated code shall compile without errors under strict: true in tsconfig.json. |
| NFR-04 | The generator itself shall run on Node.js LTS (currently v20+) using tsx for direct TypeScript execution. |
| NFR-05 | Generated code shall target ES2020 or later. |

### 3.3 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-06 | Each generator concern (interfaces, enums, base types, type mapping) shall reside in its own module following the single-responsibility principle. |
| NFR-07 | Configuration constants (paths, feature flags) shall be centralized in src/config.ts. |
| NFR-08 | The codebase shall use ESM (type: module in package.json). |

### 3.4 Error Handling

| ID | Requirement |
|----|-------------|
| NFR-09 | Unknown OCSF types shall emit a console warning and fall back to string rather than causing a hard failure. |
| NFR-10 | Schema parse failures shall terminate the process with exit code 1 and a descriptive error message. |
| NFR-11 | Missing dictionary or schema files shall be reported clearly at startup before any generation begins. |

## 4. Integration Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| IR-01 | The pnpm run schema:update script shall clone the upstream ocsf/ocsf-schema repository into ./schema/ and then trigger generation. | Implemented |
| IR-02 | The pnpm run schema:generate script shall regenerate all types from the local ./schema/ directory. | Implemented |
| IR-03 | The scripts/update-schema.sh script shall refuse to overwrite an existing ./schema/ directory and instruct the user to remove it first. | Implemented |

## 5. Future / Planned Requirements

The following items are not yet implemented and represent potential enhancements:

| ID | Requirement | Priority |
|----|-------------|----------|
| FUT-01 | Add a test suite (e.g. Vitest or Node.js built-in test runner) that validates generated output against known-good snapshots. | High |
| FUT-02 | Support OCSF event class generation in addition to objects. | Medium |
| FUT-03 | Add CLI flags for selective generation (e.g. --only-objects, --only-enums). | Medium |
| FUT-04 | Publish generated types as an npm package for downstream consumption. | Medium |
| FUT-05 | Add CI workflow to run generation and verify no diff in generated/ on every PR. | High |
| FUT-06 | Support configurable output formatting (e.g. Prettier integration). | Low |
| FUT-07 | Generate type guards / runtime validators alongside static types. | Low |

## 6. Acceptance Criteria

A pull request modifying the generator is considered acceptable when:

1. pnpm run schema:generate completes without errors.
2. All generated TypeScript files compile under strict: true with zero errors.
3. No unused imports exist in generated output.
4. JSDoc comments are present on every exported interface, property, and enum.
5. Inheritance (extends) is correctly modelled for all objects that declare a parent.
6. Enum values match the upstream OCSF schema definitions exactly.
7. The PR includes updated documentation if new features or configuration options are introduced.
