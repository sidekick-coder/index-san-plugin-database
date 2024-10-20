import { listCollections } from './listCollections.js'

export async function showCollection(databaseId, collectionId) {
    const collections = await listCollections(databaseId)

    const collection = collections.find((c) => c.id === collectionId)

    if (!collection) {
        throw new Error('Collection not found')
    }

    return collection
}
