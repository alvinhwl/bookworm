import { BookwormDB } from './schema'

let dbInstance: BookwormDB = new BookwormDB()

export function resetDb(name?: string): BookwormDB {
  dbInstance = new BookwormDB(name ?? 'bookworm')
  return dbInstance
}

export const db: BookwormDB = new Proxy({} as BookwormDB, {
  get(_target, prop) {
    const value = dbInstance[prop as keyof BookwormDB]
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(dbInstance)
    }
    return value
  },
})

export function createTestDb(name: string): BookwormDB {
  return new BookwormDB(name)
}