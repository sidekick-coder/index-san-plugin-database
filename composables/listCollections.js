import { showDatabase } from './showDatabase.js'

export async function listCollections(databaseId) {
    const database = await showDatabase(databaseId)

    if (!database) {
        throw new Error('Database not found')
    }

    return database.collections || []
}
