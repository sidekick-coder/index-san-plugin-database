import { emitHook } from 'app:hook'

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
    const database = await showDatabase(databaseId)
    const collection = await showCollection(databaseId, collectionId)
    const provider = await showProvider(database.provider)

    if (!provider?.item.show) {
        throw new Error('[database] provider does not have item.show method')
    }

    return provider.item.show({
        database,
        collection,
        itemId,
    })
}
export async function createItem(databaseId, collectionId, payload) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const properties = await listProperties(databaseId, collectionId)

    const provider = await showProvider(database.provider)

    if (!provider?.item?.create) {
        throw new Error('[database] provider does not have item.create method')
    }

    const result = await provider.item.create({
        database,
        collection,
        properties,
        payload,
    })

    emitHook('item:created', {
        databaseId,
        collectionId,
        payload: result,
    })

    return result
}

export async function updateItem(databaseId, collectionId, itemId, payload) {
    const database = await showDatabase(databaseId)
    const collection = await showCollection(databaseId, collectionId)

    const provider = await showProvider(database.provider)

    if (!provider?.item?.update) {
        throw new Error('[database] provider does not have item.update method')
    }

    const result = await provider.item.update({
        database,
        collection,
        itemId,
        payload,
    })

    emitHook('item:updated', {
        databaseId,
        collectionId,
        itemId,
        payload: result,
    })

    return result
}

export async function destroyItem(databaseId, collectionId, itemId) {
    const database = await showDatabase(databaseId)
    const collection = await showCollection(databaseId, collectionId)

    const provider = await showProvider(database.provider)

    if (!provider?.item?.destroy) {
        throw new Error('[database] provider does not have item.destroy method')
    }

    const result = await provider.item.destroy({
        database,
        collection,
        itemId,
    })

    emitHook('item:destroyed', {
        databaseId,
        collectionId,
        itemId,
    })

    return result
}
