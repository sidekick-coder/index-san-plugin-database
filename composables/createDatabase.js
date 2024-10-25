import { drive, encode, resolve } from 'app:drive'
import { emitHook } from 'app:hook'

export async function createDatabase(payload) {
    const folder = '.is/databases'

    if (/[^\w\s-]/.test(payload.id)) {
        throw new Error('Id can not have special chars')
    }

    const exists = await drive.get(folder)

    if (!exists) {
        await drive.mkdir(folder)
    }

    await drive.mkdir(resolve(folder, payload.id))
    await drive.mkdir(resolve(folder, payload.id, 'collections'))
    await drive.write(
        resolve(folder, payload.id, 'config.json'),
        encode(JSON.stringify(payload, null, 4))
    )

    emitHook('database:created', payload)

    return payload
}
