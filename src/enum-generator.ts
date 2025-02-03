// Convert OCSF schema to TypeScript enum
export function generateEnumType(
  name: string,
  values: (string | number)[],
  defs: Record<string, { caption: string; description?: string }>,
  isNumeric: boolean
): string {
  const lines: string[] = []

  // Add JSDoc for the enum type
  lines.push('/**')
  lines.push(` * ${name} enum values`)
  lines.push(' */')
  lines.push(`export const enum ${name}Values {`)

  // Add enum values with JSDoc comments
  values.forEach(v => {
    const def = defs[v.toString()]
    if (def) {
      lines.push('  /**')
      lines.push(`   * ${def.caption}`)
      if (def.description) lines.push(`   * ${def.description}`)
      lines.push('   */')
    }
    if (isNumeric) {
      const enumName = def?.caption?.replace(/[^\w\s]/g, '')?.replace(/\s+/g, '_')?.toUpperCase() || `VALUE_${v}`
      lines.push(`  ${enumName} = ${v},`)
    } else {
      const enumName = def?.caption?.replace(/[^\w\s]/g, '')?.replace(/\s+/g, '_')?.toUpperCase() || `VALUE_${v}`
      lines.push(`  ${enumName} = '${v}',`)
    }
  })
  lines.push('}')
  lines.push('')

  // Add type alias that uses the values
  const valueType = values.map(v => isNumeric ? `${v}` : `'${v}'`).join(' | ')
  lines.push(`export type ${name} = ${valueType}`)
  lines.push('')

  return lines.join('\n')
}
