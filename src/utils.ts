import { WriterOptions } from './types'
import type { ITouchEvent } from '@tarojs/components/types/common'
import type { BoundingClientRect } from './types'

export function removeEmptyKeys (obj: WriterOptions) {
  const newObj = {}

  Object.keys(obj).forEach((key) => {
    const val = obj[key]
    if (val !== undefined && val !== null) {
      newObj[key] = val
    }
  })

  return newObj
}

export function eventify (evt: ITouchEvent, boundingRect: BoundingClientRect) {
  const getPoint = () => {
    const x = evt.touches[0].clientX - boundingRect.left
    const y = evt.touches[0].clientY - boundingRect.top
    return { x, y }
  }

  return { preventDefault: () => { }, getPoint }
}