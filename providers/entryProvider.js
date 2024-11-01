import { drive, resolve, decode, encode } from 'app:drive'
import { tryCatch } from 'app:utils'
import { importJson, writeJson } from 'app:hecate'

export async function listCollections({ database }) {
    const folder = resolve(database._path, 'collections')

    if (!(await drive.get(folder))) {
        return []
    }

    const collections = []

    const entries = await drive.list(folder)

    for await (const e of entries) {
        const [json, error] = await tryCatch(() => importJson(resolve(e.path, 'config.json')))

        if (error) continue

        json._path = e.path
        json._id = e.name

        collections.push(json)
    }

    return collections
}

export async function listProperties({ collection }) {
    const properties = []

    const folder = resolve(collection._path, 'properties')

    if (!(await drive.get(folder))) {
        return properties
    }

    const entries = await drive.list(folder)

    for await (const e of entries) {
        const configEntry = await drive.get(resolve(e.path, 'config.json'))

        if (!configEntry) continue

        const json = await importJson(configEntry.path)

        json._path = e.path

        properties.push(json)
    }

    return properties
}

export async function list({ collection }) {
    const entries = await drive.list(collection.path)

    const items = []

    for await (const e of entries) {
        const json = await importJson(e.path)

        json._id = e.name.replace('.json', '')
        json._path = e.path

        items.push(json)
    }

    return items
}

export async function show({ collection, id }) {
    const filename = resolve(collection.path, `${id}.json`)

    const entry = await drive.get(filename)

    if (!entry) return null

    const json = await importJson(entry.path)

    json._id = entry.name.replace('.json', '')
    json._path = entry.path

    return json
}

export async function create({ collection, payload }) {
    const id = window.crypto.randomUUID()

    const filename = resolve(collection.path, id + '.json')

    await writeJson(filename, payload)

    return item
}

export async function update({ id, payload, collection }) {
    const item = await show({ collection, id })

    if (!item) return

    const filename = item._path

    Object.assign(item, payload, { _id: undefined, _path: undefined })

    // remove properties with _ prefix

    for (const key in item) {
        if (key.startsWith('_')) {
            delete item[key]
        }
    }

    await drive.write(filename, encode(JSON.stringify(item, null, 4)))
}

export async function destroy({ collection, id }) {
    const item = await show({ collection, id })

    await drive.destroy(item._path)
}
