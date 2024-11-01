import { showCollection } from './showCollection.js'
import { showDatabase } from './showDatabase.js'
import { showProvider } from './showProvider.js'

export async function listProperties(databaseId, collectionId) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const provider = await showProvider(database.provider)

    if (!provider) {
        throw new Error('Collection provider not found')
    }

    return provider.listProperties({ database, collection })
}
