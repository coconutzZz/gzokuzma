export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/drustva')) {
    to.meta.layout = 'association-layout'
  } else {
    to.meta.layout = 'default'
  }
})
