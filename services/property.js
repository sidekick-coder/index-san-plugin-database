import { showCollection } from './collection.js'
import { showDatabase } from './database.js'
import { showProvider } from './provider.js'

import { emitHook } from 'app:hook'

export const properTypes = [
    {
        id: 'string',
        label: 'String',
    },
    {
        id: 'number',
        label: 'Number',
    },
    {
        id: 'boolean',
        label: 'Boolean',
    },
]

export async function listProperties(databaseId, collectionId) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const provider = await showProvider(database.provider)

    if (!provider?.property?.list) {
        throw new Error('[database] provider does not have list method')
    }

    return provider.property.list({ database, collection })
}

export async function showProperty(databaseId, collectionId, propertyId) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const provider = await showProvider(database.provider)

    if (!provider?.property?.show) {
        throw new Error('[database] provider does not have show method')
    }

    return provider.property.show({ database, collection, propertyId })
}

export async function createProperty(databaseId, collectionId, payload) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const provider = await showProvider(database.provider)

    if (!provider?.property?.create) {
        throw new Error('[database] provider does not have create method')
    }

    const result = await provider.property.create({ database, collection, payload })

    emitHook('property:created', { databaseId, collectionId, payload, propertyId: result.id })

    return result
}

export async function updateProperty(databaseId, collectionId, propertyId, payload) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const provider = await showProvider(database.provider)

    if (!provider?.property?.update) {
        throw new Error('[database] provider does not have update method')
    }

    const result = await provider.property.update({ database, collection, propertyId, payload })

    emitHook('property:updated', { databaseId, collectionId, propertyId, payload })

    return result
}

export async function destroyProperty(databaseId, collectionId, propertyId) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)
    const provider = await showProvider(database.provider)

    if (!provider?.property?.destroy) {
        throw new Error('[database] provider does not have destroy method')
    }

    await provider.property.destroy({ database, collection, propertyId })

    emitHook('property:destroyed', { databaseId, collectionId, propertyId })
}
