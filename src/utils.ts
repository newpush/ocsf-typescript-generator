import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { OCSFSchema } from './types'

// Helper functions for type name formatting
export function formatTypeName(str: string, isBaseType = false): string {
  // Handle underscore-separated names and add OCSF prefix
  const parts = str.split('_')
  if (isBaseType && parts.length === 2 && parts[1] === 't') {
    // For base types like 'boolean_t', 'string_t', etc.
    return `OCSF${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}T`
  }
  const name = parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return `OCSF${name}`
}

export function formatType(type: string, isBaseType = false): string {
  // Map primitive types to their OCSF equivalents
  if (type === 'string') return formatTypeName('string_t', true)
  if (type === 'number') return formatTypeName('number_t', true)
  if (type === 'boolean') return formatTypeName('boolean_t', true)
  if (type === 'object') return 'Record<string, unknown>'

  // Don't prefix already prefixed types (like Record<string, unknown>)
  if (type.includes('<') || type.includes('{')) {
    return type
  }

  // Handle underscore-separated type names and add prefix
  return formatTypeName(type, isBaseType)
}

// Helper function to get parent type information
export function getParentTypeInfo(schemaRoot: string, schema: OCSFSchema): { parentType: string, grandParentType?: string } {
  const result = { parentType: '', grandParentType: undefined as string | undefined }

  if (schema.extends && schema.extends !== 'object') {
    result.parentType = formatTypeName(schema.extends)

    // Get parent's dependencies
    const parentFile = schema.extends + '.json'
    if (readdirSync(schemaRoot).includes(parentFile)) {
      const parentContent = readFileSync(join(schemaRoot, parentFile), 'utf8')
      const parentSchema = JSON.parse(parentContent) as OCSFSchema
      if (parentSchema.extends) {
        result.grandParentType = formatTypeName(parentSchema.extends)
      }
    }
  }

  return result
}

// Helper function to track type imports
export class TypeTracker {
  private imports = new Set<string>()
  private usedTypes = new Set<string>()

  addTypeImport(type: string, isUsed = true) {
    if (type.startsWith('OCSF') && !type.includes('{') && !type.includes('<')) {
      this.imports.add(type)
      if (isUsed) {
        this.usedTypes.add(type)
      }
    }
  }

  getImportLines(interfaceName: string, parentType: string): string[] {
    return Array.from(this.imports)
      .filter(type => {
        // Don't import self
        if (type === interfaceName) return false
        // Always include base types and parent types
        if (type.endsWith('T') || type === parentType) return true
        // For other types, check if they're actually used
        return this.usedTypes.has(type)
      })
      .sort() // Sort imports alphabetically
      .map(type => {
        // Check if it's a base type
        const isBaseType = type.endsWith('T')
        // Convert OCSFEntityName to entity_name, preserving any leading underscore
        let filename = type.replace('OCSF', '').split(/(?=[A-Z])/).join('_').toLowerCase()
        // Special case: entity should be _entity
        if (filename === 'entity') {
          filename = '_entity'
        }
        const importPath = isBaseType ? '../types/' + filename : './' + filename
        return `import type { ${type} } from '${importPath}'`
      })
  }
}
