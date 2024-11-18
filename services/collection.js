import { showDatabase } from './database.js'
import { showProvider } from './provider.js'
import { emitHook } from 'app:hook'

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

    const result = await provider.collection.create({ database, payload })

    emitHook('collection:created', { databaseId, payload, collectionId: result.id })

    return result
}

export async function updateCollection(databaseId, collectionId, payload) {
    const database = await showDatabase(databaseId)

    const provider = await showProvider(database.provider)

    if (!provider?.collection?.update) {
        throw new Error('[database] provider does not have update method')
    }

    const result = await provider.collection.update({ database, collectionId, payload })

    emitHook('collection:updated', { databaseId, collectionId, payload })

    return result
}

export async function destroyCollection(databaseId, collectionId) {
    const database = await showDatabase(databaseId)

    const provider = await showProvider(database.provider)

    if (!provider?.collection?.destroy) {
        throw new Error('[database] provider does not have destroy method')
    }

    const result = await provider.collection.destroy({ database, collectionId })

    emitHook('collection:destroyed', { databaseId, collectionId })

    return result
}
