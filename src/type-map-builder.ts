import { readdirSync, readFileSync } from 'fs'
import type { DictionaryAttribute, TypeInfo } from './types'

export async function buildTypeMap(dictionaryPath: string, schemaRoot: string): Promise<Map<string, TypeInfo>> {
  const typeMap = new Map<string, TypeInfo>()

  try {
    const dictionaryContent = readFileSync(dictionaryPath, 'utf8').toString()
    const dictionary = JSON.parse(dictionaryContent)

    if (dictionary.attributes && typeof dictionary.attributes === 'object') {
      for (const [key, attr] of Object.entries<DictionaryAttribute>(dictionary.attributes)) {
        const typeInfo: TypeInfo = {
          type: attr.type || 'string_t', // Default to string_t instead of string
          isOptional: attr.requirement !== 'required',
          description: attr.description || attr.caption
        }

        // Check if it's a reference to another OCSF object
        if (attr.type && readdirSync(schemaRoot).includes(`${attr.type}.json`)) {
          typeInfo.type = attr.type
        }

        if (attr.enum) {
          // For integer_t, convert enum keys to numbers
          if (attr.type === 'integer_t' || attr.type === 'number_t') {
            typeInfo.enumValues = Object.keys(attr.enum).map(Number)
          } else {
            typeInfo.enumValues = Object.keys(attr.enum)
          }
          // Store the enum definitions for JSDoc comments
          typeInfo.enumDefs = attr.enum
        }

        if (attr.is_array) {
          typeInfo.isArray = true
        }

        typeMap.set(key, typeInfo)
      }
    }
  } catch {
    // If dictionary file is not found or invalid, return empty map
    return new Map()
  }

  return typeMap
}
