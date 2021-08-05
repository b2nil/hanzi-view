# Hanzi View

> A Taro port of [Hanzi Writer](https://hanziwriter.org/) with same context apis

> Support both h5 and mini-programs

## Features

- Added commonly-used background grids: `口`、`田`、`井`、`回`、`米`、`米回`、`田回`

![口](./assets/口.svg)
![田](./assets/田.svg)
![井](./assets/井.svg)
![回](./assets/回.svg)
![米](./assets/米.svg)
![田回](./assets/田回.svg)
![米回](./assets/米回.svg)

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