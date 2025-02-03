import { readFileSync } from 'fs'
import { join } from 'path'
import type { OCSFSchema, TypeInfo } from './types'
import { TypeTracker, formatType, getParentTypeInfo } from './utils'
import { generateEnumType } from './enum-generator'

export function generateInterface(
  schema: OCSFSchema,
  typeMap: Map<string, TypeInfo>,
  baseTypes: Map<string, string>,
  schemaRoot: string,
  dictionaryContent: string
): string {
  const dictionary = JSON.parse(dictionaryContent)
  const enumTypes: string[] = []
  const lines: string[] = []
  const typeTracker = new TypeTracker()

  // Add JSDoc comment
  if (schema.description || schema.caption) {
    lines.push('/**')
    if (schema.caption) lines.push(` * ${schema.caption}`)
    if (schema.description) lines.push(` * ${schema.description}`)
    lines.push(' */')
  }

  // Start interface definition
  const interfaceName = formatType(schema.name)
  const { parentType, grandParentType } = getParentTypeInfo(schemaRoot, schema)

  // Track parent types
  if (parentType) {
    typeTracker.addTypeImport(parentType, true)
  }
  if (grandParentType) {
    typeTracker.addTypeImport(grandParentType, true)
  }

  // Process all attributes first to collect potential imports
  for (const [key, attr] of Object.entries(schema.attributes)) {
    if (key === '$include') continue

    const typeInfo = typeMap.get(key)
    const type = typeInfo?.type || attr.type
    if (type) {
      const formattedType = formatType(type, true)
      if (formattedType.startsWith('OCSF')) {
        // For non-base types (references to other OCSF objects), mark as used immediately
        if (!formattedType.endsWith('T')) {
          typeTracker.addTypeImport(formattedType, true)
          // Also check if the type exists as a file
          const typeFile = `${type}.json`
          const refContent = readFileSync(join(schemaRoot, typeFile), 'utf8').toString()
          const refSchema = JSON.parse(refContent) as OCSFSchema
          if (refSchema.extends) {
            const refParentType = formatType(refSchema.extends)
            typeTracker.addTypeImport(refParentType, true)
          }
        } else {
          // For base types, collect but don't mark as used yet
          typeTracker.addTypeImport(formattedType, false)
        }
      }
    }
  }

  // Add properties
  lines.push(`export interface ${interfaceName}${parentType ? ` extends ${parentType}` : ''} {`)

  for (const [key, attr] of Object.entries(schema.attributes)) {
    if (key === '$include') continue

    // Start building JSDoc
    const jsdocLines: string[] = []
    const dictionaryAttr = dictionary.attributes?.[key]
    if (dictionaryAttr?.caption || dictionaryAttr?.description || attr.description || attr.caption) {
      if (dictionaryAttr?.caption) jsdocLines.push(`   * ${dictionaryAttr.caption}`)
      if (dictionaryAttr?.description) jsdocLines.push(`   * ${dictionaryAttr.description}`)
      // Fallback to schema attributes if not in dictionary
      if (!dictionaryAttr?.caption && attr.caption) jsdocLines.push(`   * ${attr.caption}`)
      if (!dictionaryAttr?.description && attr.description) jsdocLines.push(`   * ${attr.description}`)
    }

    // Determine property type
    let type = formatType('string_t', true) // Default to OCSFStringT
    const typeInfo = typeMap.get(key)

    if (typeInfo) {
      // Get the mapped type (e.g., integer_t -> OCSFIntegerT)
      type = formatType(typeInfo.type, true)
      // Mark the type as actually used
      if (type.startsWith('OCSF')) {
        typeTracker.addTypeImport(type, true)
      }
      if (typeInfo.enumValues && typeInfo.enumDefs) {
        // For integer_t or number_t with enum, keep values as numbers
        if (typeInfo.type === 'integer_t' || typeInfo.type === 'number_t') {
          // Add JSDoc for each enum value
          const enumComments = typeInfo.enumValues
            .map(v => {
              const enumValue = typeInfo.enumDefs![v.toString()]
              const caption = enumValue?.caption || v
              const description = enumValue?.description ? `: ${enumValue.description}` : ''
              return `   * ${v} = ${caption}${description}`
            })
            .join('\n')
          if (enumComments) {
            if (jsdocLines.length > 0) jsdocLines.push('   *')
            jsdocLines.push('   * Possible values:')
            jsdocLines.push(enumComments)
          }
          // Generate enum type
          const enumName = `${formatType(key)}Enum`
          const enumType = generateEnumType(enumName, typeInfo.enumValues!, typeInfo.enumDefs!, true)
          enumTypes.push(enumType)
          type = `${enumName}`
        } else {
          // For other types, wrap enum values in quotes
          type = typeInfo.enumValues.map(v => `'${v}'`).join(' | ')
        }
      }
      if (typeInfo.isArray) {
        type = `${type}[]`
      }
    } else if (attr.type && baseTypes.has(attr.type)) {
      type = formatType(attr.type || 'string_t', true)
      // Mark base types as used
      typeTracker.addTypeImport(type, true)
    } else if (attr.enum) {
      const enumValues = Object.keys(attr.enum)
      // For integer_t with enum, keep values as numbers
      if (attr.type === 'integer_t' || attr.type === 'number_t') {
        // Add JSDoc for each enum value
        const enumComments = enumValues
          .map(v => {
            const enumValue = attr.enum![v]
            const caption = enumValue?.caption || v
            const description = enumValue?.description ? `: ${enumValue.description}` : ''
            return `   * ${v} = ${caption}${description}`
          })
          .join('\n')
        if (enumComments) {
          if (jsdocLines.length > 0) jsdocLines.push('   *')
          jsdocLines.push('   * Possible values:')
          jsdocLines.push(enumComments)
        }
        // Generate enum type
        const enumName = `${formatType(key)}Enum`
        const enumType = generateEnumType(enumName, enumValues.map(Number), attr.enum!, true)
        enumTypes.push(enumType)
        type = `${enumName}`
      } else {
        // For other types, wrap enum values in quotes
        type = enumValues.map(v => `'${v}'`).join(' | ')
      }
    } else if (attr.is_array) {
      // For arrays of strings, use OCSFStringT[]
      const baseType = formatType('string_t', true)
      type = `${baseType}[]`
      // Mark array base type as used
      typeTracker.addTypeImport(baseType, true)
    }

    // Add JSDoc if we have any documentation
    if (jsdocLines.length > 0) {
      lines.push('  /**')
      lines.push(...jsdocLines)
      lines.push('   */')
    }

    // Add property with optional modifier if needed
    let optional = attr.requirement !== 'required' ? '?' : ''

    // If this type extends another type, check if this property is required in the parent
    if (parentType && attr.requirement !== 'required') {
      const parentFile = schema.extends + '.json'
      if (schema.extends) {
        const parentContent = readFileSync(join(schemaRoot, parentFile), 'utf8').toString()
        const parentSchema = JSON.parse(parentContent) as OCSFSchema
        if (parentSchema.attributes[key]?.requirement === 'required') {
          optional = '' // Make it required if it's required in the parent
        }
      }
    }
    lines.push(`  ${key}${optional}: ${type}`)
  }

  lines.push('}')

  // Add imports at the top
  const importLines = typeTracker.getImportLines(interfaceName, parentType)
  if (importLines.length > 0) {
    lines.unshift(...importLines, '')
  }

  // Add enum types after imports but before interface
  if (enumTypes.length > 0) {
    const insertIndex = importLines.length > 0 ? importLines.length + 1 : 0
    lines.splice(insertIndex, 0, ...enumTypes)
  }

  return lines.join('\n')
}
