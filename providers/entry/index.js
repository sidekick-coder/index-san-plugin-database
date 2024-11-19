import * as _collection from './collection.js'
import * as _property from './property.js'
import * as _item from './item.js'

export const capabilities = [
    'collection.create',
    'collection.update',
    'collection.destroy',
    'property.create',
    'property.update',
    'property.destroy',
    'item.create',
    'item.update',
    'item.destroy',
]

export const collection = _collection
export const property = _property
export const item = _item
