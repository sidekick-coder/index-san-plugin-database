import { drive, resolve } from 'app:drive'
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
        const [json, error] = await tryCatch(() => importJson(resolve(e.path, 'index.json')))

        if (error) continue

        json._path = e.path
        json.id = e.name

        collections.push(json)
    }

    return collections
}

export async function show({ database, collectionId }) {
    const all = await list({ database })

    const collection = all.find((c) => c.id === collectionId)

    return collection || null
}

export async function create({ database, payload }) {
    const collectionId = window.crypto.randomUUID()

    const folder = resolve(database._path, 'collections', collectionId)

    const config = {
        label: payload.label,
        description: payload.description,
        icon: payload.icon,
        metadata: payload.metadata,
    }

    await drive.mkdir(folder, { recursive: true })

    if (payload.metadata.path) {
        await drive.mkdir(payload.metadata.path, { recursive: true })
    }

    await writeJson(resolve(folder, 'index.json'), config)

    return show({ database, collectionId })
}

export async function update({ database, collectionId, payload }) {
    const folder = resolve(database._path, 'collections', collectionId)

    const config = {
        label: payload.label,
        description: payload.description,
        icon: payload.icon,
        metadata: payload.metadata,
    }

    await writeJson(resolve(folder, 'index.json'), config)

    return show({ database, collectionId })
}

export async function destroy({ database, collectionId }) {
    const folder = resolve(database._path, 'collections', collectionId)

    await drive.destroy(folder)
}
