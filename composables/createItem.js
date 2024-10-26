import { listProperties } from './listProperties.js'
import { showCollection } from './showCollection.js'
import { showDatabase } from './showDatabase.js'
import { showProvider } from './showProvider.js'

export async function createItem(databaseId, collectionId, payload) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const properties = await listProperties(databaseId, collectionId)

    const provider = await showProvider(collection.provider)

    if (!provider) {
        throw new Error('Collection provider not found')
    }

    return provider.create({
        database,
        collection,
        properties,
        payload,
    })
}
