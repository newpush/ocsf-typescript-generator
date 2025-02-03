export interface OCSFSchema {
  caption?: string
  description?: string
  extends?: string
  name: string
  attributes: Record<string, {
    caption?: string
    description?: string
    requirement?: 'optional' | 'recommended' | 'required'
    type?: string
    is_array?: boolean
    validation?: {
      pattern?: string
      enum?: string[]
      minLength?: number
      maxLength?: number
      minimum?: number
      maximum?: number
    }
    observable?: number
    sibling?: string
    enum?: Record<string, {
      caption: string
      description?: string
    }>
    $include?: string[] | string
  }>
  constraints?: {
    at_least_one?: string[]
    exactly_one?: string[]
    mutually_exclusive?: string[][]
  }
}

export interface DictionaryAttribute {
  caption?: string
  description?: string
  type?: string
  type_name?: string
  sibling?: string
  enum?: Record<string, {
    caption: string
    description?: string
  }>
  is_array?: boolean
  observable?: number
  regex?: string
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    minimum?: number
    maximum?: number
  }
  requirement?: 'optional' | 'recommended' | 'required'
}

export interface TypeInfo {
  type: string
  isArray?: boolean
  isOptional?: boolean
  description?: string
  enumValues?: (string | number)[]
  enumDefs?: Record<string, {
    caption: string
    description?: string
  }>
}

export interface OCSFType {
  caption: string
  description: string
  type?: string
  type_name?: string
  regex?: string
  values?: (string | number | boolean)[]
}
