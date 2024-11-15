import { importJS } from 'app:hecate'
import { get } from 'app:utils'

export const capabilities = ['collection.list']

function wrap(key) {
    return async (options) => {
        const customProvider = await importJS(options.database.filename)

        const method = get(customProvider, key)

        if (!method) {
            throw new Error(
                `Method ${method} not found in custom provider: ${options.database.filename}`
            )
        }

        return method(options)
    }
}

export const collection = {
    list: wrap('collection.list'),
    create: wrap('collection.create'),
}
