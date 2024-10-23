import { drive, resolve, decode } from 'app:drive'
import { tryCatch } from 'app:utils'
import { showCollection } from './showCollection.js'

export async function listProperties(databaseId, collectionId) {
    const collection = await showCollection(databaseId, collectionId)

    const properties = []

    const entries = await drive.list(resolve(collection._path, 'properties'))

    for await (const e of entries) {
        const configEntry = await drive.get(resolve(e.path, 'config.json'))

        if (!configEntry) continue

        const [json, error] = await tryCatch(async () => {
            const contents = await drive.read(configEntry.path)

            return JSON.parse(decode(contents))
        })

        if (error) continue

        json._path = e.path

        properties.push(json)
    }

    return properties
}
