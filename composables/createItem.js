import { showCollection } from './showCollection.js'
import { showProvider } from './showProvider.js'

export async function createItem(databaseId, collectionId, payload) {
    const collection = await showCollection(databaseId, collectionId)

    const provider = await showProvider(collection.provider)

    if (!provider) {
        throw new Error('Collection provider not found')
    }

    return provider.create({
        collection,
        payload,
    })
}
