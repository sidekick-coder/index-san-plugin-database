import { resolve } from 'app:drive'
import { importJS } from 'app:hecate'

export const providerFiles = [
    {
        id: 'entry',
        filename: resolve(__dirname, '../providers/entryProvider.js'),
    },
    {
        id: 'api',
        filename: resolve(__dirname, '../providers/apiProvider.js'),
    },
]

export async function listProviders() {
    const providers = []

    for await (const f of providerFiles) {
        const moduleDef = await importJS(f.filename)

        const provider = {
            id: f.id,
            ...moduleDef,
        }

        providers.push(provider)
    }

    return providers
}
