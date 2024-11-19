import { listProperties } from './property.js'
import { showCollection } from './collection.js'
import { showDatabase } from './database.js'
import { showProvider } from './provider.js'

export async function listItems(databaseId, collectionId, options = {}) {
    const database = await showDatabase(databaseId)
    const collection = await showCollection(databaseId, collectionId)

    const provider = await showProvider(database.provider)

    if (!provider?.item?.list) {
        throw new Error('[database] provider does not have item.list method')
    }

    return await provider.item.list({
        database,
        collection,
        limit: options.limit,
        page: options.page,
        where: options.where,
    })
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
