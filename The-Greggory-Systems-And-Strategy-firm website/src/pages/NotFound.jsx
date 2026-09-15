import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="page-shell pt-24">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="soft-panel p-10 sm:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#eef4ea] text-[#4c6a4d] dark:bg-[#233124] dark:text-[#8fb28a]">
            <Compass className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#4c6a4d] dark:text-[#8fb28a]">
            404 — Off the map
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            This route doesn't exist
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-700 dark:text-slate-100">
            The page you're looking for was moved, renamed, or never existed.
            Head back home or get in touch and we'll point you in the right direction.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#4c6a4d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3d5740]"
            >
              <Home className="h-4 w-4" />
              Back home
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#e3d2bb] bg-[#fbf3e8] px-6 py-3 text-sm font-bold text-[#4c6a4d] transition hover:bg-[#f5ead9] dark:border-slate-700 dark:bg-slate-900/60 dark:text-[#8fb28a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound
