import { createItem } from './composables/createItem.js'
import { destroyItem } from './composables/destroyItem.js'
import { listItems } from './composables/listItems.js'
import { updateItem } from './composables/updateItem.js'

export function useCollection(databaseId, collectionId) {
    function list() {
        return listItems(databaseId, collectionId)
    }

    function create(payload) {
        return createItem(databaseId, collectionId, payload)
    }

    function update(id, payload) {
        return updateItem(databaseId, collectionId, id, payload)
    }

    function destroy(id) {
        return destroyItem(databaseId, collectionId, id)
    }

    return {
        list,
        create,
        update,
        destroy,
    }
}
