import { listProperties } from './listProperties.js'
import { showCollection } from './showCollection.js'
import { showDatabase } from './showDatabase.js'
import { showProvider } from './showProvider.js'

export async function listItems(databaseId, collectionId) {
    const database = await showDatabase(databaseId)
    const collection = await showCollection(databaseId, collectionId)
    const properties = await listProperties(databaseId, collectionId)

    const provider = await showProvider(collection.provider)

    if (!provider) {
        throw new Error('Collection provider not found')
    }

    return provider.list({
        database,
        collection,
        properties,
    })
}
