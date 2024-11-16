import { drive, encode, decode, resolve } from 'app:drive'
import { emitHook } from 'app:hook'
import { tryCatch } from 'app:utils'

import { showProvider } from './provider.js'

export async function listDatabases() {
    const folder = '.is/databases'

    const exists = await drive.get(folder)

    if (!exists) return []

    const entries = await drive.list(folder)
    const databases = []

    for await (const e of entries) {
        const configEntry = await drive.get(resolve(e.path, 'config.json'))

        if (!configEntry) continue

        const [json, error] = await tryCatch(async () => {
            const contents = await drive.read(configEntry.path)

            return JSON.parse(decode(contents))
        })

        if (error) continue

        const provider = await showProvider(json.provider)

        json._id = e.name
        json._path = e.path
        json._provider = provider
        json._capabilities = provider.capabilities || []

        databases.push(json)
    }

    return databases
}

export async function showDatabase(id) {
    const databases = await listDatabases()

    const db = databases.find((d) => d._id === id)

    return db || null
}

export async function createDatabase(payload) {
    const folder = '.is/databases'

    if (/[^\w\s-]/.test(payload.id)) {
        throw new Error('Id can not have special chars')
    }

    const exists = await drive.get(folder)

    if (!exists) {
        await drive.mkdir(folder)
    }

    const config = {
        label: payload.label,
        description: payload.description,
        provider: payload.provider,
    }

    await drive.mkdir(resolve(folder, payload.id))
    await drive.mkdir(resolve(folder, payload.id, 'collections'))
    await drive.write(
        resolve(folder, payload.id, 'config.json'),
        encode(JSON.stringify(config, null, 4))
    )

    emitHook('database:created', payload)

    return showDatabase(payload.id)
}

export async function updateDatabase(id, payload) {
    const folder = '.is/databases'

    const filename = resolve(folder, id)

    if (!(await drive.get(filename))) {
        throw new Error('Database not found')
    }

    const old = await showDatabase(id)

    const config = {
        label: payload.label || old.label,
        description: payload.description || old.description,
        provider: old.provider,
    }

    const configFilename = resolve(filename, 'config.json')

    await drive.write(configFilename, encode(JSON.stringify(config, null, 4)))

    emitHook('database:updated', {
        id,
        payload,
    })
}

export async function destroyDatabase(id) {
    const database = await showDatabase(id)

    if (!database) {
        throw new Error('Database not found')
    }

    await drive.destroy(database._path)

    emitHook('database:deleted', { id })
}
