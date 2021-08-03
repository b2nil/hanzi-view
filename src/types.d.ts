import RenderTarget from './RenderTarget'
import { Ref } from "vue"
import { CharacterJson, CharDataLoaderFn, OnCompleteFunction, StrokeData } from 'hanzi-writer'

export interface HanziViewProps {
  disableScroll?: boolean
  gridColor: string
  gridType: '米' | '田' | '井' | '回' | '口' | '米回' | '田回' | '无'
  canvasId: string
  type: string
  width: string | number
  height: string | number
}

export interface BoundingClientRect {
  id: string,
  dataset: any,
  top: number
  left: number
  right: number
  width: number
  height: number
  bottom: number
}

export type PickedContextOptions = Omit<
  ContextOptions,
  | 'elRef'
  | 'character'
>

export interface FuncParamOptions {
  duration?: number
  onComplete?: OnCompleteFunction
}

export type WriterOptions = PickedContextOptions & {
  rendererOverride: {
    createRenderTarget: () => RenderTarget
  }
}

export interface ContextOptions {
  /** Ref of the writer element */
  elRef: Ref<any>
  /** 汉字 */
  character?: string

  // 基本选项
  /** 渲染方式，h5 可选择 `canvas` 或 `svg`, 小程序只能使用 `canvas`
   * @default 'canvas'
  */
  renderer?: 'canvas' | 'svg'
  /** 显示轮廓。*/
  showOutline?: boolean
  /** 显示汉字。*/
  showCharacter?: boolean
  /** 笔画宽度。
   * @default 2 
   */
  strokeWidth?: number
  /** 轮廓宽度。
   * @default 2 
   */
  outlineWidth?: number

  // 汉字加载选项
  /** 汉字数据加载函数 */
  charDataLoader?: CharDataLoaderFn,
  /** 汉字数据加载错误回调函数 */
  onLoadCharDataError?: (error?: string | Error | undefined) => void,
  /** 汉字数据加载成功回调函数 */
  onLoadCharDataSuccess?: (data: CharacterJson) => void,

  // 定位选项
  width?: number
  height?: number
  padding?: number

  // 动画选项
  /** 笔画动画速度
   * @default 1
   */
  strokeAnimationSpeed?: number
  /** 笔画消退时长，ms
   * @default 400
   */
  strokeFadeDuration?: number
  /** 笔画提示速度
   * @default 2
   */
  strokeHighlightSpeed?: number
  /** 笔画提示时长，ms
   * @deprecated 使用 `strokeHighlightSpeed` 替代
   */
  strokeHighlightDuration?: number
  /** 笔画间延时间隔，ms
   * @default 1000
   */
  delayBetweenStrokes?: number
  /** 循环间延时间隔，ms
   * @default 2000
   */
  delayBetweenLoops?: number

  // 颜色
  /** 笔画颜色。
   * @default '#555'
  */
  strokeColor?: string
  /** 部首颜色，部首存在时适用。如未设置，则采用 `strokeColor`。
   * @default undefined
  */
  radicalColor?: string
  /** 测验时突出显示颜色。 
   * @default '#AAF'
  */
  highlightColor?: string
  /** 字体轮廓颜色。
   * @default '#DDD'
  */
  outlineColor?: string
  /** 手写画笔颜色。 
   * @default '#333'
  */
  drawingColor?: string
  /** 测验完成时突出显示字体的颜色。 
   * 如未设置，则采用 `highlightColor`。
   * 仅当 `highlightOnComplete` 为 `true` 时适用。
   * @default undefined
  */
  highlightCompleteColor?: string

  // 测验选项
  /** 手写画笔宽度 
   * @default 4
  */
  drawingWidth?: number
  /** 手写笔画消退时长，ms 
  * @default 300 
  */
  drawingFadeDuration?: number
  /** 手写笔画评分宽容度，越接近 0，评分越严格。
   * @default 1
  */
  leniency?: number
  /** 笔画错误次数，达到次数后提示正确笔画。
   *  设为 `false` 则不提示。
   * @default 3 
   */
  showHintAfterMisses?: number | false
  /** 成功完成测验时, 短暂闪烁汉字。 
   * @default true
  */
  highlightOnComplete?: boolean
  /** 测验笔画错误回调函数*/
  onMistake?: (strokeData: StrokeData) => void
  /** 测验笔画正确回调函数*/
  onCorrectStroke?: (strokeData: StrokeData) => void
  /** 测验完成回调函数 */
  onComplete?: (summary: {
    character: string
    totalMistakes: number
  }) => void
}