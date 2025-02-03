import { join } from 'path'

// Root paths
export const SCHEMA_ROOT = join(process.cwd(), './schema/objects')
export const DICTIONARY_PATH = join(process.cwd(), './schema/dictionary.json')

// Output paths
export const BASE_OUTPUT_DIR = join(process.cwd(), './generated/types')
export const OBJECTS_OUTPUT_DIR = join(process.cwd(), './generated/objects')
