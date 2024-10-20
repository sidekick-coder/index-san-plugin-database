import { drive, resolve } from 'app:drive'
import { emitHook } from 'app:hook'

export async function destroyDatabase(id) {
    const folder = '.is/databases'

    const filename = resolve(folder, id)

    if (!(await drive.get(filename))) {
        throw new Error('Database not found')
    }

    await drive.destroy(filename)

    emitHook('database:deleted', { id })
}
