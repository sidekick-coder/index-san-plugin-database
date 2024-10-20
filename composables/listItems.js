import { drive, decode } from 'app:drive'
import { showCollection } from './showCollection.js'

export async function listItems(databaseId, collectionId) {
    const collection = await showCollection(databaseId, collectionId)

    const entries = await drive.list(collection.path)
    const items = []

    for await (const e of entries) {
        const text = await drive.read(e.path).then(decode)
        const json = JSON.parse(text)

        json.id = e.name.replace('.json', '')

        items.push(json)
    }

    return items
}
