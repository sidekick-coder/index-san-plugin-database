import { drive, resolve } from 'app:drive'
import { emitHook } from 'app:hook'
import { importJson, writeJson } from 'app:hecate'

import { showProvider } from './provider.js'

export async function listDatabases() {
    const folder = '.is/databases'

    const exists = await drive.get(folder)

    if (!exists) return []

    const entries = await drive.list(folder)
    const databases = []

    for await (const e of entries) {
        const json = await importJson(resolve(e.path, 'index.json'))

        const provider = await showProvider(json.provider)

        json._id = e.name
        json._path = e.path
        json._provider = provider
        json._capabilities = provider?.capabilities || []

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

    if (!(await drive.get(folder))) {
        await drive.mkdir(folder)
    }

    const id = window.crypto.randomUUID()

    const config = {
        label: payload.label,
        description: payload.description,
        provider: payload.provider,
        icon: payload.icon,
    }

    const dbPath = resolve(folder, id)

    await drive.mkdir(dbPath)
    await drive.mkdir(resolve(dbPath, 'collections'))
    await writeJson(resolve(dbPath, 'index.json'), config)

    emitHook('database:created', { id, ...payload })

    return showDatabase(id)
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
        icon: payload.icon || old.icon,
    }

    await writeJson(resolve(filename, 'index.json'), config)

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
