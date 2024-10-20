import { listDatabases } from './listDatabases.js'

export async function showDatabase(id) {
    const databases = await listDatabases()

    const db = databases.find((d) => d.id === id)

    return db || null
}
