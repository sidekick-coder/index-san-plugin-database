import { drive, resolve, decode, encode } from 'app:drive'
import { tryCatch } from 'app:utils'

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

        const [json, error] = await tryCatch(async () => {
            const contents = await drive.read(configEntry.path)

            return JSON.parse(decode(contents))
        })

        if (error) continue

        json._path = e.path

        properties.push(json)
    }

    return properties
}

export async function list({ collection }) {
    const entries = await drive.list(collection.path)

    const items = []

    for await (const e of entries) {
        const text = await drive.read(e.path).then(decode)
        const json = JSON.parse(text)

        json._id = e.name.replace('.json', '')
        json._filename = e.path

        items.push(json)
    }

    return items
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
