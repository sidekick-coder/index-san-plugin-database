import { resolve } from 'app:drive'
import { importJS } from 'app:hecate'

export const providerFiles = [
    {
        id: 'entry',
        label: 'Entry',
        filename: resolve(__dirname, '../providers/entry/index.js'),
    },
    {
        id: 'api',
        label: 'API',
        filename: resolve(__dirname, '../providers/apiProvider.js'),
    },
    {
        id: 'custom',
        label: 'Custom',
        filename: resolve(__dirname, '../providers/custom/index.js'),
    },
]

export async function listProviders() {
    const providers = []

    for await (const f of providerFiles) {
        const moduleDef = await importJS(f.filename)

        const provider = {
            ...f,
            ...moduleDef,
        }

        providers.push(provider)
    }

    return providers
}
