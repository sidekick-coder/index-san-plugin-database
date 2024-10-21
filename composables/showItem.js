import { showCollection } from './showCollection.js'
import { showProvider } from './showProvider.js'

export async function showItem(databaseId, collectionId, itemId) {
    const collection = await showCollection(databaseId, collectionId)

    const provider = await showProvider(collection.provider)

    if (!provider) {
        throw new Error('Collection provider not found')
    }

    return provider.show({
        collection,
        id: itemId,
    })
}
