import { showDatabase } from './showDatabase.js'

export async function syncDatabase(databaseId) {
    const database = await showDatabase(databaseId)

    if (!database.type === 'notion') return

    const response = await fetch('http://localhost:3000/api/list-collections', {
        method: 'POST',
        body: JSON.stringify({
            type: 'notion',
            notion_key: database.notion_key,
        }),
    })

    const json = await response.json()

    console.log(json)
}
