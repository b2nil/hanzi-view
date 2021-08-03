import Taro from '@tarojs/taro'
import { eventify } from './utils'
import {
  h,
  ref,
  computed,
  onUnmounted,
  defineComponent,
  resolveComponent,
  PropType,
} from 'vue'

import './style.css'

import type { CSSProperties, VNode } from 'vue'
import type { ITouchEvent } from '@tarojs/components/types/common'
import type { HanziWriterContext } from './context'
import type { HanziViewProps, BoundingClientRect } from './types'

const HanziView = defineComponent({
  name: 'HanziView',
  props: {
    disableScroll: Boolean,
    type: {
      type: String,
      default: '2d'
    },
    canvasId: {
      type: String,
      default: 'writer-canvas'
    },
    width: {
      type: [Number, String],
      default: 300
    },
    height: {
      type: [Number, String],
      default: 300
    },
    gridColor: {
      type: String,
      default: '#ffbaba'
    },
    gridType: {
      type: String as PropType<HanziViewProps['gridType']>,
      default: '米'
    },
  },
  setup (props: HanziViewProps) {
    const context = ref<HanziWriterContext | null>(null)
    const isQuizzing = ref(false)

    function connectContext (ctx: HanziWriterContext) {
      context.value = ctx
    }

    function disconnectContext (_ctx: HanziWriterContext) {
      if (context.value) context.value = null
    }

    function setIsQuizzing (val: boolean) {
      isQuizzing.value = val
    }

    function getBoundingClientRect () {
      return new Promise(resolve => {
        Taro
          .createSelectorQuery()
          .select(`#${props.canvasId}`)
          .boundingClientRect(resolve)
          .exec()
      })
    }

    function touchStart (e: ITouchEvent) {
      getBoundingClientRect().then((rect: BoundingClientRect) => {
        Taro.eventCenter.trigger('pointerStart', eventify(e, rect))
      })
    }

    function touchMove (e: ITouchEvent) {
      getBoundingClientRect().then((rect: BoundingClientRect) => {
        Taro.eventCenter.trigger('pointerMove', eventify(e, rect))
      })
    }

    function touchEnd (e: ITouchEvent) {
      getBoundingClientRect().then((rect: BoundingClientRect) => {
        Taro.eventCenter.trigger('pointerEnd', eventify(e, rect))
      })
    }

    onUnmounted(() => {
      if (context.value) context.value.destroy()
    })

    return {
      context,
      isQuizzing,
      touchEnd,
      touchMove,
      touchStart,
      setIsQuizzing,
      connectContext,
      disconnectContext
    }
  },

  render () {
    const {
      type,
      width,
      height,
      canvasId,
      disableScroll,
      gridColor,
      gridType,
    } = this.$props

    const children: VNode[] = []
    const View: any = process.env.TARO_ENV !== 'h5' ? 'view' : resolveComponent('taro-view')

    const canvasStyle = computed<CSSProperties>(() => ({
      width: `${width}px`,
      height: `${height}px`
    }))

    const lineColor = encodeURIComponent(gridColor.toUpperCase())
    const gridSVG = computed(() => {
      if (gridType === '无') return ''

      const pathData: string[] = []
      const header = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' %3E`
      const tail = `%3C/svg%3E`
      const square = `%3Cpath d='M0 0 V${height} M0 ${height} H${width} M0 0 H${width} M${width} 0 V${height} Z' stroke='${lineColor}' stroke-width='4' /%3E`
      const smallSquare = `%3Cpath d='M${+width / 4} ${+height / 4} V${+height * 3 / 4} M${+width / 4} ${+height * 3 / 4} H${+width * 3 / 4} M${+width / 4} ${+height / 4} H${+width * 3 / 4} M${+width * 3 / 4} ${+height / 4} V${+height * 3 / 4} Z' stroke='${lineColor}' /%3E`
      const field = `%3Cpath d='M0 ${+height / 2} H${width} M${+width / 2} 0 V${height} Z' stroke='${lineColor}' /%3E`
      const grid = `%3Cpath d='M0 ${+height / 3} H${width} M0 ${+height * 2 / 3} H${width} M${+width / 3} 0 V${height} M${+width * 2 / 3} 0 V${height} Z' stroke='${lineColor}' /%3E`
      const diagonal = `%3Cpath d='M0 0 L${width} ${height} M0 ${height} L${width} 0 Z' stroke='${lineColor}' /%3E`

      pathData.push(header)
      switch (gridType) {
        case '口':
          pathData.push(square, tail)
          break
        case '田':
          pathData.push(square, field, tail)
          break
        case '米':
          pathData.push(square, field, diagonal, tail)
          break
        case '井':
          pathData.push(square, grid, tail)
          break
        case '回':
          pathData.push(square, smallSquare, tail)
          break
        case '米回':
          pathData.push(square, field, diagonal, smallSquare, tail)
          break
        case '田回':
          pathData.push(square, field, smallSquare, tail)
          break
      }

      return `url("data:image/svg+xml,${pathData.join(' ')}")`
    })

    const containerStyle = computed(() => {
      const style: CSSProperties = { ...canvasStyle.value }

      if (gridType !== 'none') {
        style.backgroundImage = gridSVG.value
      }

      return style
    })

    const canvasVNode = h('canvas', {
      style: canvasStyle.value,
      id: canvasId,
      type: type,
      canvasId: canvasId,
      disableScroll: disableScroll
    })

    const quizVNode = h(View, {
      class: 'blocker',
      catchMove: true,
      onTouchstart: this.touchStart,
      onTouchmove: this.touchMove,
      onTouchend: this.touchEnd,
      onTouchcancel: this.touchEnd
    })

    // No need to add canvas and quiz nodes in h5
    // HanziWriter may create a canvas or svg during initiation
    if (process.env.TARO_ENV !== 'h5') {
      children.push(canvasVNode)
      if (this.isQuizzing) children.push(quizVNode)
    }

    return (
      h(View, {
        class: 'container',
        style: containerStyle.value
      }, { default: () => children })
    )
  }
})

export { HanziWriterContext, createHanziWriterContext } from './context'
export default HanziView