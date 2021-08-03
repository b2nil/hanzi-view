import Taro from '@tarojs/taro'

const VERSION = '2.0'
const domainURL = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data'
const genCharDataURL = (char: string) => `${domainURL}@${VERSION}/${encodeURIComponent(char)}.json`

export default function dataLoader (
  char: string,
  onLoad: (data: any) => void,
  onError?: (res: Taro.General.CallbackResult) => void,
) {
  Taro.request({
    url: genCharDataURL(char),
    mode: 'cors',
    success: (res) => {
      onLoad(res.data)
    },
    fail: onError,
  })
}