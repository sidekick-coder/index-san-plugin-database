import { drive, resolve, decode, encode } from 'app:drive'
import { api } from 'app:api'
import { get } from 'app:utils'

export function parse({ item, properties }) {
    const result = {}

    for (const p of properties) {
        const raw = p._raw
        const itemProperty = Object.values(item.properties).find((i) => i.id === raw.id)

        if (raw.type === 'title') {
            result[p.name] = get(itemProperty, `title[0].plain_text`)
            continue
        }

        if (raw.type === 'status') {
            result[p.name] = get(itemProperty, `status.name`)
            continue
        }

        if (raw.type === 'date') {
            result[p.name] = get(itemProperty, `date.start`)
            continue
        }

        if (raw.type === 'formula') {
            result[p.name] = get(itemProperty, `formula.${itemProperty.formula?.type}`)
            continue
        }

        if (raw.type === 'relation') {
            result[p.name] = get(itemProperty, 'relation', [])
                .map((r) => r.id)
                .join(', ')
            continue
        }

        result[p.name] = '[unsupported]'
    }

    return result
}

export async function list({ collection, database, properties }) {
    const response = await api(
        `/api/providers/${database.provider_id}/items?database_id=${collection.id}`
    )

    return response.data.map((i) => parse({ item: i, properties }))
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
