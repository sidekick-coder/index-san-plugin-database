import * as _collection from './collection.js'
import * as _property from './property.js'

export const capabilities = [
    'collection.create',
    'collection.update',
    'collection.destroy',
    'property.create',
    'property.update',
    'property.destroy',
]

export const collection = _collection
export const property = _property
