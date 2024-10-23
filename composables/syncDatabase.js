import { showDatabase } from './showDatabase.js'
import { drive, resolve, encode } from 'app:drive'

export async function syncDatabase(databaseId) {
    const database = await showDatabase(databaseId)

    if (!database.type === 'notion') return

    const response = await fetch('http://localhost:3000/api/list-collections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'notion',
            notion_key: database.notion_key,
        }),
    })

    const json = await response.json()

    if (!json.data) return

    const colletionsFolder = resolve(database._path, 'collections')

    if (!(await drive.get(colletionsFolder))) {
        await drive.mkdir(colletionsFolder)
    }

    for await (notionDB of json.data) {
        const folder = resolve(colletionsFolder, notionDB.id)

        if (!(await drive.get(folder))) {
            await drive.mkdir(folder)
        }

        const config = {
            type: 'notion',
            id: notionDB.id,
            name: notionDB.title[0].plain_text,
        }

        await drive.write(resolve(folder, 'config.json'), encode(JSON.stringify(config, null, 4)))
        await drive.write(resolve(folder, 'notion.json'), encode(JSON.stringify(notionDB, null, 4)))

        const propertiesFolder = resolve(folder, 'properties')

        if (!(await drive.get(propertiesFolder))) {
            await drive.mkdir(propertiesFolder)
        }

        for await (property of Object.values(notionDB.properties)) {
            const propertyFolder = resolve(propertiesFolder, property.id)

            if (!(await drive.get(propertyFolder))) {
                await drive.mkdir(propertyFolder)
            }

            const propertyConfig = {
                id: property.id,
                name: property.name,
                label: property.name,
            }

            await drive.write(
                resolve(propertyFolder, 'config.json'),
                encode(JSON.stringify(propertyConfig, null, 4))
            )

            await drive.write(
                resolve(propertyFolder, 'notion.json'),
                encode(JSON.stringify(property, null, 4))
            )
        }
    }
}
