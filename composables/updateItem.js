import { showCollection } from './showCollection.js'
import { drive, resolve, encode } from 'app:drive'
import { showItem } from './showItem.js'

export async function updateItem(databaseId, collectionId, itemId, payload) {
    const collection = await showCollection(databaseId, collectionId)
    const item = await showItem(databaseId, collectionId, itemId)

    Object.assign(item, payload, { id: itemId })

    const filename = resolve(collection.path, itemId + '.json')

    await drive.write(filename, encode(JSON.stringify(item, null, 4)))
}
