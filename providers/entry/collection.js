import { drive, resolve, decode, encode } from 'app:drive'
import { tryCatch } from 'app:utils'
import { importJson, writeJson } from 'app:hecate'

export const meta_fields = [
    {
        label: 'Path',
        description: 'The path to the collection',
        name: 'path',
    },
]

export async function list({ database }) {
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

export async function show({ database, collectionId }) {
    const all = await list({ database })

    const collection = all.find((c) => c._id === collectionId)

    return collection || null
}

export async function create({ database, payload }) {
    const collectionId = window.crypto.randomUUID()

    const folder = resolve(database._path, 'collections', collectionId)

    await drive.mkdir(folder)

    await writeJson(resolve(folder, 'config.json'), payload)

    return show({ database, collectionId })
}

export async function destroy({ database, collectionId }) {
    const folder = resolve(database._path, 'collections', collectionId)

    await drive.destroy(folder)
}
