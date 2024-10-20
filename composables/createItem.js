import { showCollection } from './showCollection.js'
import { drive, resolve, encode } from 'app:drive'

export async function createItem(databaseId, collectionId, payload) {
    const collection = await showCollection(databaseId, collectionId)

    const id = window.crypto.randomUUID()

    const item = {
        id,
        ...payload,
    }

    const filename = resolve(collection.path, id + '.json')

    await drive.write(filename, encode(JSON.stringify(item, null, 4)))

    return item
}
