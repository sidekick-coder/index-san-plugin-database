import { showCollection } from './collection.js'
import { showDatabase } from './database.js'
import { showProvider } from './provider.js'

export async function listProperties(databaseId, collectionId) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const provider = await showProvider(database.provider)

    if (!provider?.property?.list) {
        throw new Error('Collection provider not found')
    }

    return provider.property.list({ database, collection })
}
