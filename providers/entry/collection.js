import { drive, resolve, decode, encode } from 'app:drive'
import { tryCatch } from 'app:utils'
import { importJson, writeJson } from 'app:hecate'

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

export async function show() {}

export async function create() {}
