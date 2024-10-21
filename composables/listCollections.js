import { showDatabase } from './showDatabase.js'
import { drive, resolve, decode } from 'app:drive'
import { tryCatch } from 'app:utils'

export async function listCollections(databaseId) {
    const database = await showDatabase(databaseId)

    if (!database) {
        throw new Error('Database not found')
    }

    const collections = []

    const entries = await drive.list(resolve(database.path, 'collections'))

    for await (const e of entries) {
        const configEntry = await drive.get(resolve(e.path, 'config.json'))

        if (!configEntry) continue

        const [json, error] = await tryCatch(async () => {
            const contents = await drive.read(configEntry.path)

            return JSON.parse(decode(contents))
        })

        if (error) continue

        json.path = e.path

        collections.push(json)
    }

    return collections
}
