<template>
  <view
    class="container"
    :style="containerStyle"
  >
    <canvas
      taro-env="weapp"
      :style="canvasStyle"
      :id="canvasId"
      :type="type"
      :canvasId="canvasId"
      :disableScroll="disableScroll"
    />
    <view
      taro-env="weapp"
      v-if="isQuizzing"
      class="blocker"
      :catchMove="true"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
      @touchcancel="touchEnd"
    />
  </view>
</template>

<script lang="ts">
import Taro from '@tarojs/taro'
import { eventify } from './utils'
import {
  ref,
  toRef,
  computed,
  onUnmounted,
  defineComponent,
  PropType,
} from 'vue'

import type { CSSProperties } from 'vue'
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

    const canvasStyle = computed<CSSProperties>(() => ({
      width: `${props.width}px`,
      height: `${props.height}px`
    }))

    const lineColor = encodeURIComponent(props.gridColor.toUpperCase())
    const gridSVG = computed(() => {
      if (props.gridType === '无') return ''

      const pathData: string[] = []
      const header = `%3Csvg xmlns='http://www.w3.org/2000/svg' width='${props.width}' height='${props.height}' %3E`
      const tail = `%3C/svg%3E`
      const square = `%3Cpath d='M0 0 V${props.height} M0 ${props.height} H${props.width} M0 0 H${props.width} M${props.width} 0 V${props.height} Z' stroke='${lineColor}' stroke-width='4' /%3E`
      const smallSquare = `%3Cpath d='M${+props.width / 4} ${+props.height / 4} V${+props.height * 3 / 4} M${+props.width / 4} ${+props.height * 3 / 4} H${+props.width * 3 / 4} M${+props.width / 4} ${+props.height / 4} H${+props.width * 3 / 4} M${+props.width * 3 / 4} ${+props.height / 4} V${+props.height * 3 / 4} Z' stroke='${lineColor}' /%3E`
      const field = `%3Cpath d='M0 ${+props.height / 2} H${props.width} M${+props.width / 2} 0 V${props.height} Z' stroke='${lineColor}' /%3E`
      const grid = `%3Cpath d='M0 ${+props.height / 3} H${props.width} M0 ${+props.height * 2 / 3} H${props.width} M${+props.width / 3} 0 V${props.height} M${+props.width * 2 / 3} 0 V${props.height} Z' stroke='${lineColor}' /%3E`
      const diagonal = `%3Cpath d='M0 0 L${props.width} ${props.height} M0 ${props.height} L${props.width} 0 Z' stroke='${lineColor}' /%3E`

      pathData.push(header)
      switch (props.gridType) {
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

      if (props.gridType !== '无') {
        style.backgroundImage = gridSVG.value
      }

      return style
    })


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
      type: toRef(props, 'type'),
      canvasId: toRef(props, 'canvasId'),
      disableScroll: toRef(props, 'disableScroll'),
      isQuizzing,
      canvasStyle,
      containerStyle,
      touchEnd,
      touchMove,
      touchStart,
      setIsQuizzing,
      connectContext,
      disconnectContext
    }
  }
})

export default HanziView
</script>

<style>
.container {
  position: relative;
  margin: 5px auto;
}

.blocker {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
</style>