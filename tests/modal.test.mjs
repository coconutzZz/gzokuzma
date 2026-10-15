import assert from 'node:assert/strict'
import test from 'node:test'
import { flush, h, loadComponent, mount, reactive, window } from './helpers/components.mjs'

const Modal = await loadComponent('components/ui/BaseModal.vue')
const ButtonClose = await loadComponent('components/ui/ButtonClose.vue')

function mountModal(t, initiallyOpen = false) {
  const props = reactive({ modelValue: initiallyOpen, label: 'Doniraj društvu' })
  props['onUpdate:modelValue'] = value => { props.modelValue = value }
  const fixture = mount(t, Modal, props, { ButtonClose }, {
    default: () => h('input', { 'aria-label': 'Donation amount' }),
  })
  return { ...fixture, props, dialog: () => fixture.target.querySelector('dialog') }
}

test('an initially open modal locks scrolling and unmount releases it', async t => {
  const fixture = mountModal(t, true)
  await flush()
  assert.equal(fixture.dialog().open, true)
  assert.equal(fixture.dialog().getAttribute('aria-label'), 'Doniraj društvu')
  assert.ok(document.body.classList.contains('overflow-hidden'))
  fixture.unmount()
  assert.equal(document.body.classList.contains('overflow-hidden'), false)
  assert.deepEqual(fixture.errors, [])
})

test('Escape closes the modal, updates its model, unlocks scrolling and restores focus', async t => {
  const opener = document.createElement('button')
  document.body.append(opener)
  t.after(() => opener.remove())
  const fixture = mountModal(t)
  await flush()
  assert.equal(fixture.dialog().querySelector('input'), null)
  opener.focus()
  fixture.props.modelValue = true
  await flush()
  fixture.dialog().querySelector('input').focus()
  const cancel = new window.Event('cancel', { cancelable: true })
  fixture.dialog().dispatchEvent(cancel)
  await flush()
  assert.equal(cancel.defaultPrevented, true)
  assert.equal(fixture.props.modelValue, false)
  assert.equal(fixture.dialog().open, false)
  assert.equal(document.body.classList.contains('overflow-hidden'), false)
  assert.equal(document.activeElement, opener)
})

test('Tab and Shift+Tab wrap between the modal controls', async t => {
  const fixture = mountModal(t, true)
  await flush()
  const input = fixture.dialog().querySelector('input')
  const close = fixture.dialog().querySelector('button')
  for (const element of [input, close]) element.getClientRects = () => [{ width: 20, height: 20 }]
  close.focus()
  close.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
  assert.equal(document.activeElement, input)
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }))
  assert.equal(document.activeElement, close)
})

test('overlapping dialogs retain the lock until both have closed, in either order', async t => {
  for (const closeFirst of [0, 1]) {
    const fixtures = [mountModal(t, true), mountModal(t, true)]
    await flush()
    fixtures[closeFirst].props.modelValue = false
    await flush()
    assert.ok(document.body.classList.contains('overflow-hidden'))
    fixtures[1 - closeFirst].unmount()
    assert.equal(document.body.classList.contains('overflow-hidden'), false)
    fixtures[closeFirst].unmount()
  }
})

test('a pre-existing scroll lock is preserved after the modal unmounts', async t => {
  document.body.classList.add('overflow-hidden')
  t.after(() => document.body.classList.remove('overflow-hidden'))
  const fixture = mountModal(t, true)
  await flush()
  fixture.unmount()
  assert.ok(document.body.classList.contains('overflow-hidden'))
})

test('the close button and backdrop close the modal, but clicks inside do not', async t => {
  const fixture = mountModal(t, true)
  await flush()
  const dialog = fixture.dialog()
  dialog.getBoundingClientRect = () => ({ left: 100, right: 500, top: 100, bottom: 500 })
  dialog.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: 200, clientY: 200 }))
  dialog.dispatchEvent(new window.MouseEvent('click', { clientX: 200, clientY: 200 }))
  assert.equal(fixture.props.modelValue, true)
  dialog.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: 20, clientY: 20 }))
  dialog.dispatchEvent(new window.MouseEvent('click', { clientX: 20, clientY: 20 }))
  await flush()
  assert.equal(fixture.props.modelValue, false)
  fixture.props.modelValue = true
  await flush()
  dialog.querySelector('button').click()
  await flush()
  assert.equal(fixture.props.modelValue, false)
})
