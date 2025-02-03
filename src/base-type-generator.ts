import { writeFileSync } from 'fs'
import { join } from 'path'
import type { OCSFType } from './types'
import { formatTypeName } from './utils'

export async function generateBaseTypes(baseOutputDir: string, types: Record<string, OCSFType>): Promise<Map<string, string>> {
  const typeMap = new Map<string, string>()

  // Generate each base type in its own file
  for (const [typeName, typeInfo] of Object.entries(types)) {
    const lines: string[] = []
    let baseType: string

    // Add JSDoc
    lines.push('/**')
    lines.push(` * ${typeInfo.caption}`)
    lines.push(` * ${typeInfo.description}`)
    if (typeInfo.regex) {
      lines.push(` * @pattern ${typeInfo.regex}`)
    }
    lines.push(' */')

    const formattedName = formatTypeName(typeName, true)

    if (typeInfo.values) {
      // For types with specific values (like boolean_t)
      const valueType = typeInfo.values.map(v => typeof v === 'string' ? `'${v}'` : v).join(' | ')
      lines.push(`export type ${formattedName} = ${valueType}`)
      baseType = formattedName
    } else if (typeInfo.type) {
      // For types based on other types (like datetime_t based on string_t)
      const underlyingType = typeInfo.type === 'string_t' ? 'string'
        : typeInfo.type === 'integer_t' ? 'number'
          : typeInfo.type === 'number_t' ? 'number'
            : typeInfo.type === 'boolean_t' ? 'boolean'
              : 'string'
      lines.push(`export type ${formattedName} = ${underlyingType}`)
      baseType = formattedName
    } else {
      // Default mappings for basic types
      baseType = typeName === 'string_t' ? 'string'
        : typeName === 'integer_t' ? 'number'
          : typeName === 'number_t' ? 'number'
            : typeName === 'boolean_t' ? 'boolean'
              : typeName === 'json_t' ? 'Record<string, unknown>'
                : typeName === 'object_t' ? 'Record<string, unknown>'
                  : 'string'
      lines.push(`export type ${formattedName} = ${baseType}`)
    }

    // Write the type to its own file
    writeFileSync(join(baseOutputDir, `${typeName}.ts`), lines.join('\n') + '\n')
    typeMap.set(typeName, baseType)
  }

  // Generate index file for base types
  const indexContent = Object.keys(types)
    .map(typeName => `export * from './${typeName}'`)
    .join('\n')
  writeFileSync(join(baseOutputDir, 'index.ts'), indexContent + '\n')

  return typeMap
}
