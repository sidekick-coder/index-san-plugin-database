import { drive, encode, resolve } from 'app:drive'
import { emitHook } from 'app:hook'

export async function updateDatabase(id, payload) {
    const folder = '.is/databases'

    const filename = resolve(folder, id)

    if (!(await drive.get(filename))) {
        throw new Error('Database not found')
    }

    const configFilename = resolve(filename, 'config.json')

    await drive.write(configFilename, encode(JSON.stringify(payload, null, 4)))

    emitHook('database:updated', payload)
}
