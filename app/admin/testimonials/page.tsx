import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-utils'
import { getTestimonials } from '@/lib/db/queries'
import TestimonialsManager from './TestimonialsManager'

export const metadata = { title: 'Testimonials' }

export default async function AdminTestimonialsPage() {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const testimonials = await getTestimonials()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B0F19]" style={{ fontFamily: 'var(--font-clash)' }}>
          Testimonials
        </h1>
        <p className="text-sm text-[#6B7280] mt-1" style={{ fontFamily: 'var(--font-jakarta)' }}>
          What clients say, shown on the homepage as a bento grid. The section stays hidden until at least one
          testimonial is published. Only add real quotes from real clients.
        </p>
      </div>
      <TestimonialsManager initial={testimonials} />
    </div>
  )
}
