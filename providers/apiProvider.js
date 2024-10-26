import { drive, resolve, decode, encode } from 'app:drive'
import { api } from 'app:api'
import {
    parseDatabaseItemToNotionPage,
    parseNotionPageToDatabaseItem,
    parseNotionPropertyToDatabaseProperty,
} from '../parsers/notionParser.js'

export async function listProperties({ database, collection }) {
    const response = await api(
        `/api/providers/${database.provider_id}/collections/${collection.id}/properties`
    )

    return response.data.map((payload) => parseNotionPropertyToDatabaseProperty({ payload }))
}

export async function list({ collection, database, properties }) {
    const response = await api(
        `/api/providers/${database.provider_id}/collections/${collection.id}/items`
    )

    return response.data.map((payload) => parseNotionPageToDatabaseItem({ payload, properties }))
}

export async function show({ collection, database, id }) {
    const response = await api(
        `/api/providers/${database.provider_id}/collections/${collection.id}/items/${id}`
    )

    return response.data
}

export async function create({ collection, database, properties, payload }) {
    const serializedPayload = parseDatabaseItemToNotionPage({
        properties,
        database,
        collection,
        payload,
    })

    const response = await api(
        `/api/providers/${database.provider_id}/collections/${collection.id}/items`,
        {
            method: 'POST',
            body: serializedPayload,
        }
    )

    return response.data
}

export async function update({ id, payload, collection }) {
    const response = await api(
        `/api/providers/${collection.provider_id}/collections/${collection.id}/items/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }
    )

    return response.data
}

export async function destroy({ collection, id }) {
    const response = await api(
        `/api/providers/${collection.provider_id}/collections/${collection.id}/items/${id}`,
        {
            method: 'DELETE',
        }
    )

    return response.data
}
