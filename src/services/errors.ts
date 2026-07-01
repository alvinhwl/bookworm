export type BookwormErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'IMPORT_INVALID'
  | 'DB_ERROR'

export class BookwormError extends Error {
  code: BookwormErrorCode

  constructor(code: BookwormErrorCode, message: string) {
    super(message)
    this.name = 'BookwormError'
    this.code = code
  }
}