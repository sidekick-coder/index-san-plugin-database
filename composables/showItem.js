import { listItems } from './listItems.js'

export async function showItem(databaseId, collectionId, itemId) {
    const items = await listItems(databaseId, collectionId)

    const item = items.find((i) => i.id === itemId)

    if (!item) {
        throw new Error('Item not found')
    }

    return item
}
