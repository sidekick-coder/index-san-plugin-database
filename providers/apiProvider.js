import { drive, resolve, decode, encode } from 'app:drive'
import { api } from 'app:api'
import {
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

export async function show({ collection, id }) {
    const filename = resolve(collection.path, `${id}.json`)

    const entry = await drive.get(filename)

    if (!entry) return null

    const contents = await drive.read(filename)

    const json = JSON.parse(decode(contents))

    json._id = entry.name.replace('.json', '')
    json._filename = entry.path

    return json
}

export async function create({ collection, payload }) {
    const id = window.crypto.randomUUID()

    const item = {
        id,
        ...payload,
    }

    const filename = resolve(collection.path, id + '.json')

    await drive.write(filename, encode(JSON.stringify(item, null, 4)))

    return item
}

export async function update({ id, payload, collection }) {
    const item = await show({ collection, id })
    const filename = item.path

    Object.assign(item, payload, { _id: id, _filename: filename })

    await drive.write(filename, encode(JSON.stringify(item, null, 4)))
}

export async function destroy({ collection, id }) {
    const item = await show({ collection, id })

    await drive.destroy(item._filename)
}
