import { drive, resolve } from 'app:drive'
import { importJson, writeJson } from 'app:hecate'
import { tryCatch } from 'app:utils'
import { emitHook } from 'app:hook'

import { showCollection } from './collection.js'
import { showDatabase } from './database.js'

export async function listViews(databaseId, collectionId) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)

    const folder = resolve(database._path, 'collections', collection.id, 'views')

    if (!(await drive.get(folder))) {
        return []
    }

    const views = []

    const entries = await drive.list(folder)

    for await (const e of entries) {
        const [json, error] = await tryCatch(() => importJson(resolve(e.path, 'index.json')))

        if (error) continue

        json._path = e.path
        json.id = e.name

        views.push(json)
    }

    return views
}

export async function showView(databaseId, collectionId, viewId) {
    const all = await listViews(databaseId, collectionId)

    const view = all.find((c) => c.id === viewId)

    return view || null
}

export async function createView(databaseId, collectionId, payload) {
    const collection = await showCollection(databaseId, collectionId)
    const database = await showDatabase(databaseId)

    const viewId = window.crypto.randomUUID()

    const folder = resolve(database._path, 'collections', collection.id, 'views', viewId)

    const json = {
        label: payload.label || 'New View',
        component: payload.component || 'database-table',
        config: payload.config || {},
        properties: payload.properties || [],
    }

    await writeJson(resolve(folder, 'index.json'), json, {
        recursive: true,
    })

    const created = await showView(databaseId, collectionId, viewId)

    emitHook('view:created', { databaseId, collectionId, payload, viewId })

    return created
}

export async function updateView(databaseId, collectionId, viewId, payload) {
    const view = await showView(databaseId, collectionId, viewId)

    if (!view) {
        throw new Error('View not found')
    }

    await writeJson(resolve(view._path, 'index.json'), {
        label: payload.label || view.label,
        description: payload.description || view.description,
        icon: payload.icon || view.icon,
        component: payload.component || view.component,
        config: payload.config || view.config,
        properties: payload.properties || view.properties,
    })

    const updated = await showView(databaseId, collectionId, viewId)

    emitHook('view:updated', { databaseId, collectionId, viewId, payload })

    return updated
}

export async function destroyView(databaseId, collectionId, viewId) {
    const view = await showView(databaseId, collectionId, viewId)

    if (!view) {
        throw new Error('View not found')
    }

    await drive.destroy(view._path)

    emitHook('view:destroyed', { databaseId, collectionId, viewId })
}
