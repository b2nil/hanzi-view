# Hanzi View

> A Taro port of [Hanzi Writer](https://hanziwriter.org/) with same context apis

> Support both h5 and mini-programs

## Features

- Added commonly-used background grids: `米`、`田`、`井`、`回`、`口`、`米回`、`田回`

<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="grid-background-target">
  <path d="M0 0 H100 M0 0 V100 M0 100 H100 M100 0 V100" stroke="#FFBABA" stroke-width="4"/>
  <path d="M50 0 V100 M0 50 H100" stroke="#FFBABA" />
  <path d="M0 0 L100 100 M100 0 L0 100" stroke="#FFBABA" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="grid-background-target">
  <path d="M0 0 H100 M0 0 V100 M0 100 H100 M100 0 V100" stroke="#FFBABA" stroke-width="4"/>
  <path d="M50 0 V100 M0 50 H100" stroke="#FFBABA" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="grid-background-target">
  <path d="M0 0 H100 M0 0 V100 M0 100 H100 M100 0 V100" stroke="#FFBABA" stroke-width="4"/>
  <path d='M33 0 V100 M66 0 V100 M0 33 H100 M0 66 H100' stroke="#FFBABA" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="grid-background-target">
  <path d="M0 0 H100 M0 0 V100 M0 100 H100 M100 0 V100" stroke="#FFBABA" stroke-width="4"/>
  <path d='M25 25 V75 M25 25 H75 M25 75 H75 M75 25 V75' stroke="#FFBABA" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="grid-background-target">
  <path d="M0 0 H100 M0 0 V100 M0 100 H100 M100 0 V100" stroke="#FFBABA" stroke-width="4"/>
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="grid-background-target">
  <path d="M0 0 H100 M0 0 V100 M0 100 H100 M100 0 V100" stroke="#FFBABA" stroke-width="4"/>
  <path d="M50 0 V100 M0 50 H100" stroke="#FFBABA" />
  <path d='M25 25 V75 M25 25 H75 M25 75 H75 M75 25 V75' stroke="#FFBABA" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" id="grid-background-target">
  <path d="M0 0 H100 M0 0 V100 M0 100 H100 M100 0 V100" stroke="#FFBABA" stroke-width="4"/>
  <path d="M50 0 V100 M0 50 H100" stroke="#FFBABA" />
  <path d="M0 0 L100 100 M100 0 L0 100" stroke="#FFBABA" />
  <path d='M25 25 V75 M25 25 H75 M25 75 H75 M75 25 V75' stroke="#FFBABA" />
</svg>


## Basic Usage
```html
<template>
  <HanziView :ref="el => elRef = el"/>
</template>

<script lang="ts">
import { HanziView, HanziWriterContext, createHanziWriterContext } from 'hanzi-view'
import { onMounted, ref } from 'vue'
import 'hanzi-view/dist/style.css'

export default defineComponent({
  name: 'Index',
  components: {
    HanziView
  },
  setup () {
    const elRef = ref<any>(null)
    const writerCtx = ref<HanziWriterContext | null>(null)

    const options = {
      padding: 5,
      drawingWidth: 40,
      radicalColor: '#168',
      strokeColor: '#555',
      drawingColor: '#e05a5a',
      strokeAnimationSpeed: 0.5,
      delayBetweenStrokes: 50,
      strokeFadeDuration: 0,
      showHintAfterMisses: 1,
      strokeHighlightSpeed: 0.5,
      highlightColor: '#AAF'
    }

    onMounted(() => {
      writerCtx.value = createHanziWriterContext(elRef, {
        ...options,
        character: '福'
      })
    })

    return {
      elRef
    }
  }
})
</script>
```

## License

Hanzi View is released under an [MIT](https://raw.githubusercontent.com/b2nil/hanzi-view/main/LICENSE) license.

Hanzi View uses [Hanzi Writer](https://github.com/chanind/hanzi-writer) and data from [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data), which comes from the [Make Me A Hanzi](https://github.com/skishore/makemeahanzi) project, and extracted the data from fonts by [Arphic Technology](http://www.arphic.com/), a Taiwanese font forge that released their work under a permissive license in 1999. You can redistribute and/or modify this data under the terms of the Arphic Public License as published by Arphic Technology Co., Ltd. A copy of this license can be found in [ARPHICPL.TXT](https://raw.githubusercontent.com/chanind/hanzi-writer-data/master/ARPHICPL.TXT).