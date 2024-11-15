import { drive, resolve, decode } from 'app:drive'
import { tryCatch } from 'app:utils'
import { showProvider } from './showProvider.js'

export async function listDatabases() {
    const folder = '.is/databases'

    const exists = await drive.get(folder)

    if (!exists) return []

    const entries = await drive.list(folder)
    const databases = []

    for await (const e of entries) {
        const configEntry = await drive.get(resolve(e.path, 'config.json'))

        if (!configEntry) continue

        const [json, error] = await tryCatch(async () => {
            const contents = await drive.read(configEntry.path)

            return JSON.parse(decode(contents))
        })

        if (error) continue

        json.id = e.name
        json._path = e.path

        const provider = await showProvider(json.provider)

        json.capabilities = provider.capabilities || []

        databases.push(json)
    }

    return databases
}
