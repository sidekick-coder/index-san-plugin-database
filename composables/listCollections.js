import { showDatabase } from './showDatabase.js'
import { showProvider } from './showProvider.js'

export async function listCollections(databaseId) {
    const database = await showDatabase(databaseId)

    const provider = await showProvider(database.provider)

    if (!provider?.collection?.list) {
        console.error('[database] provider does not support listing collections')
        return []
    }

    return provider.collection.list({ database })
}
