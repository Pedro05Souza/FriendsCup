import { Outlet } from 'react-router-dom'
import Sidebar, { MobileBar } from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen lg:flex lg:h-screen lg:overflow-hidden bg-turf-bg">
      <Sidebar />
      <MobileBar />
      <main id="main" className="lg:flex-1 lg:overflow-y-auto scrollbar-thin pitch-stripes">
        <div className="px-4 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

/** Scroll the content area (desktop) or the window (mobile) back to the top. */
export function scrollToTop() {
  document.getElementById('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
