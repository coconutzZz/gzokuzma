export interface FacebookSDK {
  XFBML: { parse: (element: HTMLElement, callback: () => void) => void }
}

let sdkPromise: Promise<FacebookSDK> | undefined

export function loadFacebookSDK(): Promise<FacebookSDK> {
  const facebookWindow = window as Window & { FB?: FacebookSDK }
  if (facebookWindow.FB) return Promise.resolve(facebookWindow.FB)
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise<FacebookSDK>((resolve, reject) => {
    if (!document.getElementById('fb-root')) {
      const root = document.createElement('div')
      root.id = 'fb-root'
      document.body.appendChild(root)
    }

    let script = document.getElementById('facebook-jssdk') as HTMLScriptElement | null
    const isNewScript = !script
    if (!script) {
      script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=0&version=v19.0'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
    }

    const sdkScript = script
    const cleanup = () => {
      clearTimeout(timeout)
      sdkScript.removeEventListener('load', onLoad)
      sdkScript.removeEventListener('error', onError)
    }
    const onLoad = () => {
      if (!facebookWindow.FB) {
        onError()
        return
      }
      cleanup()
      resolve(facebookWindow.FB)
    }
    const onError = () => {
      cleanup()
      sdkScript.remove()
      reject(new Error('Facebook SDK could not be loaded'))
    }
    const timeout = setTimeout(onError, 15000)
    sdkScript.addEventListener('load', onLoad, { once: true })
    sdkScript.addEventListener('error', onError, { once: true })
    if (isNewScript) document.body.appendChild(sdkScript)
  }).catch((error) => {
    sdkPromise = undefined
    throw error
  })

  return sdkPromise
}
