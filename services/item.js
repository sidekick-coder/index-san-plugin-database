import { listProperties } from './property.js'
import { showCollection } from './collection.js'
import { showDatabase } from './database.js'
import { showProvider } from './provider.js'

import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

export async function listItems(databaseId, collectionId) {
    const database = await showDatabase(databaseId)
    const collection = await showCollection(databaseId, collectionId)
    const properties = await listProperties(databaseId, collectionId)

    const provider = await showProvider(database.provider)

    if (!provider) {
        snackbar.error('Provider not found')
        return []
    }

    const [items, error] = await tryCatch(() => provider.list({ database, collection, properties }))

    if (error) {
        snackbar.error('Failed to list items')
        console.error('[database] Failed to list items', error)
        return []
    }

    return items
}

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

export async function destroyItem(databaseId, collectionId, itemId) {
    const collection = await showCollection(databaseId, collectionId)

    const provider = await showProvider(collection.provider)

    if (!provider) {
        throw new Error('Collection provider not found')
    }

    return provider.destroy({
        collection,
        id: itemId,
    })
}
