import { showDatabase } from './showDatabase.js'
import { showProvider } from './showProvider.js'

export async function listCollections(databaseId) {
    const database = await showDatabase(databaseId)

    const provider = await showProvider(database.provider)

    if (!provider?.listCollections) {
        return []
    }

    return provider.listCollections({ database })
}
