import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Globe, Lock, Mail, Scale, ShieldCheck, UserCheck, X } from 'lucide-react'

const Terms = () => {
  const [activeTopic, setActiveTopic] = useState(null)

  const topics = [
    {
      id: 'acceptance',
      icon: ShieldCheck,
      label: 'Acceptance',
      title: 'Strategic acceptance',
      content: 'By using the services and resources provided by The-Greggory-Systems-And-Strategy-firm, you agree to the terms of this framework. These terms address our service model, your responsibilities, and the shared expectations for working together.'
    },
    {
      id: 'license',
      icon: Scale,
      label: 'License',
      title: 'Professional license',
      content: 'We grant you limited permission to use our public-facing materials for internal evaluation and planning. This permission does not include redistribution, resale, or unauthorized reuse of our proprietary systems.',
      restrictions: ['No redistribution', 'No reverse engineering', 'No removal of attribution', 'No scraping of protected content']
    },
    {
      id: 'services',
      icon: Globe,
      label: 'Services',
      title: 'Service parameters',
      content: 'Our services are delivered in accordance with agreed scope, timing, and communication practices. We reserve the right to pause or end work when delivery expectations are not met or when requested work falls outside our agreed standards.'
    },
    {
      id: 'accounts',
      icon: UserCheck,
      label: 'Accounts',
      title: 'Account governance',
      content: 'You are responsible for maintaining the security of your account details and for ensuring that all access credentials remain private and secure.'
    },
    {
      id: 'intellectual',
      icon: Lock,
      label: 'Intellectual',
      title: 'Intellectual property',
      content: 'Any methods, frameworks, reports, and delivery materials created by our team remain protected unless a separate written agreement transfers ownership.'
    },
    {
      id: 'liability',
      icon: AlertCircle,
      label: 'Liability',
      title: 'Liability and indemnity',
      content: 'We will do our best to provide reliable service, but we are not liable for losses caused by external market pressures, force majeure events, or unauthorized changes made by third parties.'
    }
  ]

  useEffect(() => {
    document.body.style.overflow = activeTopic ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [activeTopic])

  return (
    <div className="page-shell pt-24">
      <Link to="/" className="fixed right-6 top-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-[#e3d2bb] bg-[#fff8ef]/90 text-[#243128] shadow-lg transition hover:bg-[#223028] hover:text-white" title="Return home">
        <X className="h-5 w-5" />
      </Link>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="soft-panel p-8 sm:p-10 lg:p-12">
          <div className="max-w-3xl">
            <p className="eyebrow">Terms of use</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A clear framework for working together.</h1>
            <p className="mt-5 text-base text-slate-300">
              These terms outline the expectations for how the firm and its clients engage with our services, systems, and shared materials.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <button key={topic.id} onClick={() => setActiveTopic(topic)} className="soft-card p-6 text-left">
              <topic.icon className="h-7 w-7 text-[#4c6a4d]" />
              <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{topic.label}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{topic.title}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4c6a4d]">
                Open section
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {activeTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#142018]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-[#e3d2bb] bg-[#fff8ef] p-6 shadow-2xl sm:p-8 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ea] text-[#4c6a4d] dark:bg-[#233124] dark:text-[#8fb28a]">
                  <activeTopic.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-[#4c6a4d]">Section</p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeTopic.title}</h3>
                </div>
              </div>
              <button onClick={() => setActiveTopic(null)} className="rounded-full border border-[#e3d2bb] p-2 text-slate-700 transition hover:bg-[#f0e2d0] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 max-h-[55vh] overflow-y-auto pr-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="leading-7">{activeTopic.content}</p>
              {activeTopic.restrictions && (
                <ul className="mt-6 space-y-2">
                  {activeTopic.restrictions.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#4c6a4d]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setActiveTopic(null)} className="rounded-2xl bg-[#223028] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3f33]">
                Close section
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="soft-card p-8 text-center sm:p-10">
          <Mail className="mx-auto h-8 w-8 text-[#4c6a4d]" />
          <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Questions about these terms?</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Email our team at thegreggorysystemsandstrategyf@gmail.com.</p>
        </div>
      </section>
    </div>
  )
}

export default Terms
