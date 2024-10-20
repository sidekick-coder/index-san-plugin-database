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

    const filename = resolve(folder, payload.id)

    if (await drive.get(filename)) {
        throw new Error('Database id alredy in use')
    }

    await drive.write(filename, encode(JSON.stringify(payload, null, 4)))

    emitHook('database:created', payload)

    return payload
}
