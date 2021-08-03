import Taro from '@tarojs/taro'
import { eventify } from './utils'
import type { BoundingClientRect } from './types'

class RenderTarget {
  _ctx: any
  canvas: Taro.Canvas
  _canvasID: string
  eventEmitter: Taro.Events
  static init: (id: string) => () => RenderTarget

  constructor (canvasID: string) {
    this._canvasID = canvasID
    this.eventEmitter = Taro.eventCenter

    Taro.createSelectorQuery()
      .select('#' + canvasID)
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        this.canvas = res[0].node
        this._ctx = this.canvas.getContext('2d')

        const dpr = Taro.getSystemInfoSync().pixelRatio
        this.canvas.width = res[0].width * dpr
        this.canvas.height = res[0].height * dpr
        this._ctx.scale(dpr, dpr)
      })
  }

  addPointerStartListener (callback: (args: any) => void) {
    this.eventEmitter.on('pointerStart', callback)
  }

  addPointerMoveListener (callback: (args: any) => void) {
    this.eventEmitter.on('pointerMove', callback)
  }

  addPointerEndListener (callback: (args: any) => void) {
    this.eventEmitter.on('pointerEnd', callback)
  }

  trigger (eventName: string, evt: any) {
    this.getBoundingClientRect().then((rect: BoundingClientRect) => {
      this.eventEmitter.trigger(eventName, eventify(evt, rect))
    })
  }

  removeAllListeners () {
    return this.eventEmitter.off()
  }

  getContext () {
    return this._ctx
  }

  getBoundingClientRect () {
    const page: any = Taro.getCurrentInstance()?.page
    return new Promise(resolve => {
      page
        .createSelectorQuery()
        .select('#' + this._canvasID)
        .boundingClientRect(resolve)
        .exec()
    })
  }
}

RenderTarget.init = (id: string) => () => new RenderTarget(id)

export default RenderTarget