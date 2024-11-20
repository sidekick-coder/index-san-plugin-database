import { drive, resolve } from 'app:drive'
import { importJson, writeJson } from 'app:hecate'

export async function list({ collection, limit = 20, page = 1 }) {
    const entries = await drive.list(collection.metadata.path)

    const items = []

    for await (const e of entries) {
        const json = await importJson(e.path)

        json.id = e.name.replace('.json', '')
        json._path = e.path

        items.push(json)
    }

    const data = items.slice((page - 1) * limit, page * limit)

    const meta = {
        total: items.length,
        last_page: Math.ceil(items.length / limit),
        page,
        limit,
    }

    return {
        meta,
        data,
    }
}

export async function show({ collection, itemId }) {
    const filename = resolve(collection.metadata.path, `${itemId}.json`)

    const entry = await drive.get(filename)

    if (!entry) return null

    const json = await importJson(entry.path)

    json.id = entry.name.replace('.json', '')
    json._path = entry.path

    return json
}

export async function create({ collection, payload }) {
    const itemId = window.crypto.randomUUID()

    const filename = resolve(collection.metadata.path, itemId + '.json')

    if (await drive.get(filename)) {
        throw new Error('[database] item already exists')
    }

    await writeJson(filename, payload)

    return show({ collection, itemId })
}

export async function update({ collection, itemId, payload }) {
    const item = await show({ collection, itemId })

    if (!item) {
        throw new Error('[database] item not found')
    }

    await writeJson(item._path, {
        ...item,
        ...payload,

        _path: undefined,
    })

    return show({ collection, itemId })
}

export async function destroy({ collection, itemId }) {
    const filename = resolve(collection.metadata.path, `${itemId}.json`)

    await drive.destroy(filename)
}
