import { showCollection } from './showCollection.js'
import { showProvider } from './showProvider.js'

export async function updateItem(databaseId, collectionId, itemId, payload) {
    const collection = await showCollection(databaseId, collectionId)

    const provider = await showProvider(collection.provider)

    if (!provider) {
        throw new Error('Collection provider not found')
    }

    const result = await provider.update({
        collection,
        id: itemId,
        payload,
    })

    console.debug('[database] update-item', {
        databaseId,
        collectionId,
        itemId,
        payload,
        result,
    })

    return result
}
