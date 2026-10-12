export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/' && to.path.endsWith('/')) {
    return navigateTo({
      path: to.path.replace(/\/+$/, '') || '/',
      query: to.query,
      hash: to.hash
    }, { replace: true, redirectCode: 301 })
  }

  if (to.path.startsWith('/drustva')) {
    to.meta.layout = 'association-layout'
  } else {
    to.meta.layout = 'default'
  }
})
