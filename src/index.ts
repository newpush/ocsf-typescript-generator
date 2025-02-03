import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { SCHEMA_ROOT, DICTIONARY_PATH, BASE_OUTPUT_DIR, OBJECTS_OUTPUT_DIR } from './config'
import { generateBaseTypes } from './base-type-generator'
import { buildTypeMap } from './type-map-builder'
import { generateInterface } from './interface-generator'

async function generateTypes(): Promise<void> {
  try {
    // Create output directories
    mkdirSync(BASE_OUTPUT_DIR, { recursive: true })
    mkdirSync(OBJECTS_OUTPUT_DIR, { recursive: true })

    // Read dictionary for base types
    const dictionaryContent = readFileSync(DICTIONARY_PATH, 'utf8').toString()
    const dictionary = JSON.parse(dictionaryContent)

    // Generate base types first
    const baseTypes = await generateBaseTypes(BASE_OUTPUT_DIR, dictionary.types?.attributes || {})

    // Build type map from dictionary
    const typeMap = await buildTypeMap(DICTIONARY_PATH, SCHEMA_ROOT)

    // First pass: Generate base types (_entity.json, etc.)
    const baseFiles = readdirSync(SCHEMA_ROOT)
      .filter(file => file.startsWith('_') && file.endsWith('.json'))

    for (const file of baseFiles) {
      const content = readFileSync(join(SCHEMA_ROOT, file), 'utf8').toString()
      const schema = JSON.parse(content)
      const ts = generateInterface(schema, typeMap, baseTypes, SCHEMA_ROOT, dictionaryContent)
      writeFileSync(join(OBJECTS_OUTPUT_DIR, file.replace('.json', '.ts')), ts)
      console.log(`Generated base type: ${schema.name}`)
    }

    // Second pass: Generate other types
    const files = readdirSync(SCHEMA_ROOT)
      .filter(file => !file.startsWith('_') && file.endsWith('.json'))

    for (const file of files) {
      const content = readFileSync(join(SCHEMA_ROOT, file), 'utf8').toString()
      const schema = JSON.parse(content)
      const ts = generateInterface(schema, typeMap, baseTypes, SCHEMA_ROOT, dictionaryContent)
      writeFileSync(join(OBJECTS_OUTPUT_DIR, file.replace('.json', '.ts')), ts)
      console.log(`Generated type: ${schema.name}`)
    }

    // Generate index file for objects
    const allFiles = [...baseFiles, ...files]
    const indexContent = allFiles
      .map(file => {
        const basename = file.replace('.json', '')
        return `export * from './${basename}'`
      })
      .join('\n')

    writeFileSync(join(OBJECTS_OUTPUT_DIR, 'index.ts'), indexContent + '\n')

  } catch (err) {
    console.error('Error generating types:', err)
    process.exit(1)
  }
}

// Run the generator
generateTypes().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
