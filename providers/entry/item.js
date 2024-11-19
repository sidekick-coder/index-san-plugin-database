import { drive } from 'app:drive'
import { importJson } from 'app:hecate'

export async function list({ collection, limit = 20, page = 1 }) {
    const entries = await drive.list(collection.metadata.path)

    const items = []

    for await (const e of entries) {
        const json = await importJson(e.path)

        json._id = e.name.replace('.json', '')
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
