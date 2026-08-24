import { Link } from 'react-router-dom'
import { ArrowLeft, Cookie, Database, Eye, Mail, Phone, Share2, Shield, User } from 'lucide-react'

const Privacy = () => {
  const sections = [
    { title: 'Data collection', icon: Database, content: 'We collect the information needed to understand your needs, direct communication to the right team, and keep service delivery organized.' },
    { title: 'Usage', icon: Eye, content: 'We use the information we collect to manage requests, improve our support, and make sure our systems remain useful and secure.' },
    { title: 'Sharing', icon: Share2, content: 'We do not sell personal data. We only share information when required to deliver a service, fulfill a legal need, or protect the integrity of our operations.' },
    { title: 'Security', icon: Shield, content: 'We apply strong measures to protect access and limit exposure across our internal systems and workstreams.' },
    { title: 'Rights', icon: User, content: 'You may request access to your information, correct mistakes, or ask us about how your information is managed.' },
    { title: 'Cookies', icon: Cookie, content: 'We may use cookies and similar tools to improve site performance, remember your preferences, and understand how visitors use the site.' }
  ]

  return (
    <div className="page-shell pt-24">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="soft-panel p-8 sm:p-10 lg:p-12">
          <Link to="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8fb28a] transition hover:text-[#a3c39d]">
            <ArrowLeft className="h-4 w-4" />
            Back to sign up
          </Link>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Privacy protocol</h1>
          <p className="mt-4 max-w-3xl text-base text-slate-700 dark:text-slate-100">
            We believe privacy should feel straightforward and respectful. This policy explains the basics of how we handle information on our site and through our service delivery work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="soft-card p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ea] text-[#4c6a4d] dark:bg-[#233124] dark:text-[#8fb28a]">
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">{section.title}</h2>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-100">{section.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="soft-card p-8 sm:p-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Contact our data team</h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-100">If you want to ask about your data, correct an issue, or request details about our approach, reach out to us directly.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e3d2bb] bg-[#fbf3e8] p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <Mail className="h-5 w-5 text-[#4c6a4d]" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">Email</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">thegreggorysystemsandstrategyf@gmail.com</p>
            </div>
            <div className="rounded-2xl border border-[#e3d2bb] bg-[#fbf3e8] p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <Phone className="h-5 w-5 text-[#4c6a4d]" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">Phone</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">+254 115 525 854</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Privacy
