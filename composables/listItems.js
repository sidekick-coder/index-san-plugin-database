import { listProperties } from './listProperties.js'
import { showCollection } from './showCollection.js'
import { showDatabase } from './showDatabase.js'
import { showProvider } from './showProvider.js'

import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

export async function listItems(databaseId, collectionId) {
    const database = await showDatabase(databaseId)
    const collection = await showCollection(databaseId, collectionId)
    const properties = await listProperties(databaseId, collectionId)

    const provider = await showProvider(database.provider)

    if (!provider) {
        snackbar.error('Provider not found')
        return []
    }

    const [items, error] = await tryCatch(() => provider.list({ database, collection, properties }))

    if (error) {
        snackbar.error('Failed to list items')
        console.error('[database] Failed to list items', error)
        return []
    }

    return items
}
