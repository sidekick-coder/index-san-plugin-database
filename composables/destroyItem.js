import { showCollection } from './showCollection.js'
import { drive, resolve } from 'app:drive'
import { showItem } from './showItem.js'

export async function destroyItem(databaseId, collectionId, itemId) {
    const collection = await showCollection(databaseId, collectionId)
    const item = await showItem(databaseId, collectionId, itemId)

    const filename = resolve(collection.path, item.id + '.json')

    await drive.destroy(filename)
}
