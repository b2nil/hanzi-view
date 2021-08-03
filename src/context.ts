import Taro from '@tarojs/taro'
import HanziWriter from 'hanzi-writer'
import RenderTarget from './RenderTarget'
import dataLoader from './dataLoader'
import { removeEmptyKeys } from './utils'

import type { Ref } from 'vue'
import type { ITouchEvent } from '@tarojs/components/types/common'
import type { ColorOptions, DimensionOptions, QuizOptions } from 'hanzi-writer'
import type { ContextOptions, FuncParamOptions, PickedContextOptions } from './types'

export function createHanziWriterContext (
  elRef: Ref<any>,
  options: Omit<ContextOptions, 'elRef'> = {}
) {
  return new HanziWriterContext({ elRef, ...options })
}

export class HanziWriterContext {
  el: any
  writer: HanziWriter
  isDestroyed: boolean

  constructor (options: ContextOptions) {

    if (!options.elRef) {
      throw new Error('parameter elRef is required')
    }

    this.el = options.elRef.value
    this.isDestroyed = false

    options.width = this.el.width
    options.height = this.el.height
    options.charDataLoader = options.charDataLoader || dataLoader

    if (process.env.TARO_ENV === 'h5') {
      //use web renderer target
      this.writer = HanziWriter.create(this.el.$el, options.character!, {
        ...(options as PickedContextOptions),
        renderer: options.renderer || 'canvas'
      })

      this.el.connectContext(this)
    } else {
      // override web renderer target and use miniapp canvas renderer
      Taro.nextTick(() => {
        options.renderer = 'canvas'
        const canvasID = options.elRef.value?.$props.canvasId

        this.writer = new HanziWriter(this.el.$el, removeEmptyKeys({
          ...(options as PickedContextOptions),
          rendererOverride: { createRenderTarget: RenderTarget.init(canvasID) }
        }))

        if (options.character) {
          this.setCharacter(options.character)
        }

        this.el.connectContext(this)
      })
    }
  }

  _ensureNotDestroyed () {
    if (this.isDestroyed)
      throw new Error('This context has already been destroyed')
  }

  /** Show the character if it's currently hidden.
   * @param options `{ onComplete: Function, duration?: number }`
   */
  showCharacter (options: FuncParamOptions = {}) {
    this._ensureNotDestroyed()
    return this.writer.showCharacter(options)
  }

  /** Hide the character if it's currently shown.
   * @param options `{ onComplete: Function, duration?: number }`
   */
  hideCharacter (options: FuncParamOptions = {}) {
    this._ensureNotDestroyed()
    return this.writer.hideCharacter(options)
  }

  /** Returns a promise containing the parsed character data after it's loaded.
   * The returned data contains stroke data needed to render the character.
   */
  getCharacterData () {
    this._ensureNotDestroyed()
    return this.writer.getCharacterData()
  }

  /** Show the outline if it's currently hidden.
   * @param options `{ onComplete: Function, duration?: number }`
   */
  showOutline (options: FuncParamOptions = {}) {
    this._ensureNotDestroyed()
    return this.writer.showOutline(options)
  }

  /** Hide the outline if it's currently shown.
   * @param options `{ onComplete: Function, duration?: number }`
   */
  hideOutline (options: FuncParamOptions = {}) {
    this._ensureNotDestroyed()
    return this.writer.hideOutline(options)
  }

  /** Animate the strokes of the character in order */
  animateCharacter (options: Omit<FuncParamOptions, 'duration'> = {}) {
    this._ensureNotDestroyed()
    this.el.setIsQuizzing(false)
    return this.writer.animateCharacter(options)
  }

  /** Animate a single stroke */
  animateStroke (
    strokeNum: number,
    options: Omit<FuncParamOptions, 'duration'> = {}
  ) {
    this._ensureNotDestroyed()
    this.el.setIsQuizzing(false)
    return this.writer.animateStroke(strokeNum, options)
  }

  /** Pause animation of the character */
  pauseAnimation () {
    this._ensureNotDestroyed()
    return this.writer.pauseAnimation()
  }

  /** Resume animation of the character */
  resumeAnimation () {
    this._ensureNotDestroyed()
    return this.writer.resumeAnimation()
  }

  /** Highlight a single stroke */
  highlightStroke (
    strokeNum: number,
    options: Omit<FuncParamOptions, 'duration'> = {}
  ) {
    this._ensureNotDestroyed()
    this.el.setIsQuizzing(false)
    return this.writer.highlightStroke(strokeNum, options)
  }

  /** Animate the strokes of the character in order, 
   * and then restart the animation after it finishes forever.
   */
  loopCharacterAnimation () {
    this._ensureNotDestroyed()
    this.el.setIsQuizzing(false)
    return this.writer.loopCharacterAnimation()
  }

  /** Update the size of the writer instance
   * @param options `{ width?: number, height?: number, padding?: number }`
   */
  updateDimensions (options: Partial<DimensionOptions> = {}) {
    this._ensureNotDestroyed()
    return this.writer.updateDimensions(options)
  }

  /** Update a color setting.
   * @param colorName One of 'strokeColor', 'radicalColor', 'outlineColor', 'highlightColor', or 'drawingColor'.
   * @param colorVal A CSS color string like '#AA9913' or 'rgba(255, 255, 10, 0.7)'.
   * @param options Additional configuration options, `{ onComplete: Function, duration?: number }`
   */
  updateColor (
    colorName: keyof ColorOptions,
    colorVal: string | null,
    options: FuncParamOptions = {}
  ) {
    this._ensureNotDestroyed()
    return this.writer.updateColor(colorName, colorVal, options)
  }

  /** Start a quiz. */
  quiz (quizOptions: Partial<QuizOptions> = {}) {
    this._ensureNotDestroyed()

    // enable quizzing element to catch user strokes in miniapp 
    if (process.env.TARO_ENV !== 'h5') {
      this.el.setIsQuizzing(true)
    }

    return this.writer.quiz(quizOptions)
  }

  /** Cancel the quiz currently in progress */
  cancelQuiz () {
    this._ensureNotDestroyed()
    this.el.setIsQuizzing(false)
    return this.writer.cancelQuiz()
  }

  /** Replace the currently drawn character with a new one. 
   * This will reset any quizzes or animations in progress.
  */
  setCharacter (character: string) {
    this._ensureNotDestroyed()
    this.el.setIsQuizzing(false)
    return this.writer.setCharacter(character)
  }

  trigger (evtName: string, evt: ITouchEvent) {
    //@ts-ignore
    this.writer.target.trigger(evtName, evt)
  }

  destroy () {
    if (this.isDestroyed) return
    this.el.disconnectContext()

    if (process.env.TARO_ENV !== 'h5') {
      //@ts-ignore
      this.writer.target.removeAllListeners()
    }

    this.writer.cancelQuiz()
    this.writer.hideCharacter()
    this.writer.hideOutline()
    this.isDestroyed = true
  }
}