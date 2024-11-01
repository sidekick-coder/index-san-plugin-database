import { importJS } from 'app:hecate'

function wrap(method) {
    return async (options) => {
        const customProvider = await importJS(options.database.filename)

        if (!customProvider[method]) {
            throw new Error(
                `Method ${method} not found in custom provider: ${options.database.filename}`
            )
        }

        return customProvider[method](options)
    }
}

export const listCollections = wrap('listCollections')

export const listProperties = wrap('listProperties')

export const list = wrap('list')

export const show = wrap('show')

export const create = wrap('create')

export const update = wrap('update')

export const destroy = wrap('destroy')
