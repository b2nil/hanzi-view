<template>
  <view class="index">
    <hanzi-view
      :width="size"
      :height="size"
      :grid-color="gridColor"
      :grid-type="gridType"
      :ref="el => elRef = el"
    ></hanzi-view>
    <view class="flex-view">
      <button
        @tap="animateCharacter"
        type="primary"
        class="btn"
      >笔顺</button>
      <button
        @tap="startQuiz"
        type="primary"
        class="btn"
      >描红</button>
    </view>
    <view class="flex-view">
      <button
        @tap="animateStroke"
        type="primary"
        class="btn"
      >演示笔画</button>
      <input
        class="input"
        type="digit"
        v-model="strokeNum"
      >
    </view>
    <view class="flex-view">
      <button
        type="primary"
        class="btn"
        @tap="switchOutline(true)"
      >显示轮廓</button>
      <button
        type="primary"
        class="btn"
        @tap="switchOutline(false)"
      >隐藏轮廓</button>
    </view>
    <view class="flex-view">
      <button
        type="primary"
        class="btn"
        @tap="updateColor('strokeColor')"
      >设置字体颜色</button>
      <input
        class="input"
        :style="{backgroundColor: strokeColor}"
        type="text"
        v-model="strokeColor"
      >
    </view>
    <view class="flex-view">
      <button
        type="primary"
        class="btn"
        @tap="updateColor('radicalColor')"
      >设置部首颜色</button>
      <input
        class="input"
        :style="{backgroundColor: radicalColor}"
        type="text"
        v-model="radicalColor"
      >
    </view>
    <view class="flex-view">
      <button
        type="primary"
        class="btn"
        @tap="updateColor('drawingColor')"
      >设置画笔颜色</button>
      <input
        class="input"
        :style="{backgroundColor: drawingColor}"
        type="text"
        v-model="drawingColor"
      >
    </view>
    <view class="flex-view">
      <button
        type="primary"
        class="btn"
      >设置界格类型</button>
      <picker
        class="input"
        mode="selector"
        :range="gridTypes"
        @change="setGridType"
      >
        <view class="picker">{{ gridType }}</view>
      </picker>
    </view>
    <view class="flex-view">
      <button
        type="primary"
        class="btn"
      >设置界格大小</button>
      <input
        class="input"
        type="number"
        :value="size"
        @change="setSize"
      >
    </view>
    <view class="flex-view">
      <button
        type="primary"
        class="btn"
      >设置界格颜色</button>
      <input
        class="input grid-bg"
        type="text"
        v-model="gridColor"
      >
    </view>
  </view>
</template>

<script lang="ts">
import HanziView, { HanziWriterContext, createHanziWriterContext } from 'hanzi-view'
import { onMounted, ref } from '@vue/runtime-core'
import { PickedContextOptions } from 'hanzi-view/dist/types.d.ts'
import { reactive, toRefs } from 'vue'

export default {
  name: 'Index',
  components: {
    HanziView
  },
  setup () {
    const writerCtx = ref<HanziWriterContext | null>(null)
    const elRef = ref<any>(null)
    const canvasId = ref('canvasID')
    const gridColor = ref('#ffbaba')
    const strokeNum = ref(1)
    const colors = reactive({
      strokeColor: '#168',
      radicalColor: '#168',
      drawingColor: '#e05a5a',
    })
    const gridType = ref('米')
    const gridTypes = ['米', '田', '井', '口', '回', '米回', '田回', '无']
    const size = ref(300)

    const options: Partial<PickedContextOptions> = {
      padding: 5,
      drawingWidth: 40,
      radicalColor: colors.radicalColor, // green
      strokeColor: colors.strokeColor,
      drawingColor: colors.drawingColor,
      strokeAnimationSpeed: 0.5,
      delayBetweenStrokes: 50,
      strokeFadeDuration: 0,
      showHintAfterMisses: 1,
      strokeHighlightSpeed: 0.5,
      highlightColor: '#008080'
    }

    const updateColor = (
      name: 'strokeColor' | 'radicalColor' | 'outlineColor' | 'highlightColor' | 'drawingColor'
    ) => {
      writerCtx.value?.updateColor(name, colors[name])
    }

    const setGridType = (e) => {
      gridType.value = gridTypes[e.detail.value]
    }

    const setSize = (e) => {
      size.value = e.detail.value
      writerCtx.value?.updateDimensions({
        width: size.value,
        height: size.value
      })
    }

    const setCharacter = (char: string) => {
      writerCtx.value?.setCharacter(char)
    }

    const switchOutline = (show: boolean) => {
      show
        ? writerCtx.value?.showOutline()
        : writerCtx.value?.hideOutline()
    }

    const animateStroke = async () => {
      const char = await writerCtx.value?.getCharacterData()
      const totalStrokes = char!.strokes.length
      if (strokeNum.value <= totalStrokes) {
        writerCtx.value?.animateStroke(strokeNum.value - 1)
      } else {
        writerCtx.value?.animateStroke(totalStrokes - 1)
      }
    }

    const animateCharacter = () => {
      writerCtx.value?.animateCharacter()
    }

    const startQuiz = () => {
      writerCtx.value?.quiz()
    }

    onMounted(() => {
      writerCtx.value = createHanziWriterContext(elRef, {
        ...options,
        character: '福',
        renderer: 'svg'
      })
    })

    return {
      ...toRefs(colors),
      elRef,
      canvasId,
      size,
      gridColor,
      gridType,
      gridTypes,
      strokeNum,
      setSize,
      updateColor,
      setGridType,
      startQuiz,
      animateStroke,
      animateCharacter,
      setCharacter,
      switchOutline,
    }
  }
}
</script>

<style lang="scss">
.index {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.demo {
  // display: flex;
  justify-items: center;
  align-content: center;
  margin: 5px auto;
  margin-top: 20px;
  height: 450px;
  width: 100%;
  border: #ddd solid 2px;
  border-radius: 5px;
}

.flex-view {
  display: flex;
  margin: 10px 10px;
  flex-direction: row;

  .input {
    border: #346fc2 solid 2px;
    border-radius: 5px;
    margin: auto 15px;
    width: 50%;
  }

  .grid-bg {
    background-color: v-bind(gridColor);
  }

  .btn {
    background-color: #346fc2 !important;
    width: 50% !important;
    margin: auto 15px;
  }

  .btn:last-of-type {
    margin-top: 0 !important;
  }
}
</style>
