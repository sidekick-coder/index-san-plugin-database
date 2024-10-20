import { drive, decode } from 'app:drive'

export async function listDatabases() {
    const folder = '.is/databases'

    const exists = await drive.get(folder)

    if (!exists) return []

    const entries = await drive.list(folder)
    const databases = []

    for await (const e of entries) {
        const text = await drive.read(e.path).then(decode)
        const json = JSON.parse(text)

        databases.push(json)
    }

    return databases
}
