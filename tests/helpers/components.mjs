import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
import { Window } from 'happy-dom'
import { parse, compileScript } from '@vue/compiler-sfc'

export const window = new Window({ url: 'http://localhost' })
globalThis.window = window
for (const name of ['document', 'history', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent']) {
  globalThis[name] = window[name]
}
const vue = await import('vue')
export const { computed, createApp, defineComponent, h, nextTick, reactive, ref, Suspense } = vue
for (const name of ['computed', 'ref', 'watch', 'onBeforeMount', 'onMounted', 'onBeforeUnmount', 'nextTick', 'useId']) {
  globalThis[name] = vue[name]
}
const jiti = createJiti(import.meta.url, {
  fsCache: false,
  alias: { '~': fileURLToPath(new URL('../../', import.meta.url)) },
})

export async function loadComponent(path, transform = source => source) {
  const filename = fileURLToPath(new URL(`../../${path}`, import.meta.url))
  const source = transform((await readFile(filename, 'utf8')).replaceAll('import.meta.env.DEV', 'false'))
  const isCustomElement = tag => tag.startsWith('swiper-')
  const { descriptor } = parse(source, { filename, templateParseOptions: { isCustomElement } })
  return (await jiti.evalModule(compileScript(descriptor, {
    id: `behavior-${path}`, inlineTemplate: true,
    templateOptions: { compilerOptions: { isCustomElement } },
  }).content, { filename: filename.replace(/\.vue$/, '.ts'), async: true })).default
}

export async function flush() {
  await new Promise(resolve => setImmediate(resolve))
  await nextTick()
}

export function mount(t, component, props = {}, components = {}, slots, plugins = []) {
  const target = document.createElement('div')
  document.body.append(target)
  const errors = []
  const app = createApp({ render: () => h(component, props, slots) })
  app.config.errorHandler = error => errors.push(error)
  for (const plugin of plugins) app.use(plugin)
  for (const [name, child] of Object.entries(components)) app.component(name, child)
  app.mount(target)
  let mounted = true
  const unmount = () => {
    if (!mounted) return
    mounted = false
    app.unmount()
    target.remove()
  }
  t.after(unmount)
  return { target, app, errors, unmount }
}
