import { drive } from 'app:drive'
import { emitHook } from 'app:hook'
import { showDatabase } from './showDatabase.js'

export async function destroyDatabase(id) {
    const database = await showDatabase(id)

    if (!database) {
        throw new Error('Database not found')
    }

    await drive.destroy(database._path)

    emitHook('database:deleted', { id })
}
