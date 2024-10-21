import { listProviders } from './listProviders.js'

export async function showProvider(providerId) {
    const providers = await listProviders()

    const provider = providers.find((p) => p.id === providerId)

    return provider || null
}
