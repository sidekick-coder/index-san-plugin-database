import { showDatabase } from './database.js'
import { showProvider } from './provider.js'

export async function listCollections(databaseId) {
    const database = await showDatabase(databaseId)

    const provider = await showProvider(database.provider)

    if (!provider?.collection?.list) {
        console.error('[database] provider does have list method')
        return []
    }

    return provider.collection.list({ database })
}

export async function showCollection(databaseId, collectionId) {
    const collections = await listCollections(databaseId)

    const collection = collections.find((c) => c.id === collectionId)

    if (!collection) {
        throw new Error('Collection not found')
    }

    return collection
}

export async function createCollection(databaseId, payload) {
    const database = await showDatabase(databaseId)

    const provider = await showProvider(database.provider)

    if (!provider?.collection?.create) {
        throw new Error('[database] provider does not have create method')
    }

    return provider.collection.create({ database, payload })
}
