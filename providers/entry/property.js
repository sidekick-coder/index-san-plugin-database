import { drive, resolve } from 'app:drive'
import { tryCatch } from 'app:utils'
import { importJson, writeJson } from 'app:hecate'

export async function list({ database, collection }) {
    const folder = resolve(collection._path, 'properties')

    if (!(await drive.get(folder))) {
        return []
    }

    const properties = []

    const entries = await drive.list(folder)

    for await (const e of entries) {
        const [json, error] = await tryCatch(() => importJson(resolve(e.path, 'config.json')))

        if (error) continue

        json._path = e.path
        json.id = e.name

        properties.push(json)
    }

    return properties
}

export async function show({ database, collection, propertyId }) {
    const all = await list({ database, collection })

    const property = all.find((c) => c.id === propertyId)

    return property || null
}

export async function create({ database, collection, payload }) {
    const propertyId = window.crypto.randomUUID()

    const folder = resolve(collection._path, 'properties', propertyId)

    const config = {
        name: payload.name,
        label: payload.label,
        description: payload.description,
        icon: payload.icon,
        metadata: payload.metadata,
    }

    await drive.mkdir(folder)

    await writeJson(resolve(folder, 'config.json'), config)

    return show({ database, collection, propertyId })
}

export async function destroy({ database, collection, propertyId }) {
    const property = await show({ database, collection, propertyId })

    if (!property) {
        throw new Error('Property not found')
    }

    await drive.destroy(property._path)
}
