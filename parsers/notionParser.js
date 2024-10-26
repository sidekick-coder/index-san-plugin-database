import { get } from 'app:utils'

export function parseNotionPropertyToDatabaseProperty({ payload }) {
    const result = {
        id: payload.id,
        label: payload.name,
        name: payload.name,
        type: payload.type,
        order: payload.type === 'title' ? 1 : undefined,
    }

    return result
}

export function parseNotionPageToDatabaseItem({ payload, properties }) {
    const result = {}

    for (const p of properties) {
        const itemProperty = Object.values(payload.properties).find((i) => i.id === p.id)

        if (p.type === 'title') {
            result[p.name] = get(itemProperty, `title[0].plain_text`)
            continue
        }

        if (p.type === 'status') {
            result[p.name] = get(itemProperty, `status.name`)
            continue
        }

        if (p.type === 'date') {
            result[p.name] = get(itemProperty, `date.start`)
            continue
        }

        if (p.type === 'formula') {
            result[p.name] = get(itemProperty, `formula.${itemProperty.formula?.type}`)
            continue
        }

        if (p.type === 'relation') {
            result[p.name] = get(itemProperty, 'relation', [])
                .map((r) => r.id)
                .join(', ')
            continue
        }

        result[p.name] = '[unsupported]'
    }

    return result
}
