import { showDatabase } from './showDatabase.js'
import { drive, resolve, encode } from 'app:drive'
import { api, isLogged } from 'app:api'

export async function syncDatabase(databaseId) {
    const database = await showDatabase(databaseId)

    if (!database.type === 'api-provider') {
        throw new Error('Database type is not supported')
    }

    if (!isLogged.value) {
        throw new Error('You need to be logged in to sync databases')
    }

    const { data: notionDatabases } = await api(
        `/api/providers/${database.provider_id}/collections`
    )

    for await (db of notionDatabases) {
        const folder = resolve(database._path, 'collections', db.id)

        if (!(await drive.get(folder))) {
            await drive.mkdir(folder)
        }

        const config = {
            provider: 'api',
            id: db.id,
            name: db.title[0].plain_text,
        }

        await drive.write(resolve(folder, 'config.json'), encode(JSON.stringify(config, null, 4)))
        await drive.write(resolve(folder, 'notion.json'), encode(JSON.stringify(db, null, 4)))

        const propertiesFolder = resolve(folder, 'properties')

        if (!(await drive.get(propertiesFolder))) {
            await drive.mkdir(propertiesFolder)
        }

        for await (property of Object.values(db.properties)) {
            const hexId = Array.from(property.id)
                .map((char) => char.charCodeAt(0).toString(16))
                .join('')

            const propertyFolder = resolve(propertiesFolder, hexId)

            if (!(await drive.get(propertyFolder))) {
                await drive.mkdir(propertyFolder)
            }

            const propertyConfig = {
                id: property.id,
                name: property.name,
                label: property.name,
                _path: propertyFolder,
                _raw: property,
            }

            await drive.write(
                resolve(propertyFolder, 'config.json'),
                encode(JSON.stringify(propertyConfig, null, 4))
            )
        }
    }
}
