import { getDepartmentBySlug } from '../../services/departments'

export default defineEventHandler(async (event) => {
    const slug = event.context.params?.dept
    
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Department slug missing'
    })
  }

  return getDepartmentBySlug(slug)
})