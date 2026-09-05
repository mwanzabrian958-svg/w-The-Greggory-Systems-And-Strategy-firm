import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Lightbulb, CheckCircle, TrendingUp, Users, Award, Clock, ShieldCheck, UserCheck, Phone, ChevronRight, BarChart3, Server, LineChart, Network, GitBranch, Zap, Globe, Monitor, Smartphone, Wrench, Cpu, Briefcase, FileText, Lock, Shield, AlertCircle } from 'lucide-react'
import { SITE_NAME } from '../constants/siteBrand'

const Home = () => {
  const videoRef = useRef(null)

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 43) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {})
          } else {
            videoRef.current?.pause()
          }
        })
      },
      { threshold: 0.5 }
    )
    if (videoRef.current) observer.observe(videoRef.current)
    return () => { if (videoRef.current) observer.unobserve(videoRef.current) }
  }, [])

  const stats = [
    { icon: <TrendingUp className="w-4 h-4" />, value: '150+', label: 'Projects Delivered' },
    { icon: <Users className="w-4 h-4" />, value: '50+', label: 'Happy Clients' },
    { icon: <Award className="w-4 h-4" />, value: '98%', label: 'Success Rate' },
    { icon: <Clock className="w-4 h-4" />, value: '10+', label: 'Years Active' }
  ]

  const testimonials = [
    {
      quote: "Their expertise in systems design helped us streamline processes we had struggled with for years. Exceptional professionalism.",
      author: "Sarah Wanjiku",
      role: "CEO",
      company: "TechStart Africa"
    },
    {
      quote: "A truly strategic partner. They walk with you through implementation, ensuring every solution is practical and sustainable.",
      author: "David Omondi",
      role: "Managing Director",
      company: "Horizon Ventures"
    }
  ]

  return (
    <div className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-end overflow-hidden bg-[#030712]">
        <div className="absolute inset-0">
          <img src="/hero-phoenix.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 animate-bounce opacity-40">
          <div className="h-6 w-px bg-gradient-to-b from-gold-500 to-transparent" />
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-slate-200 text-gold-600 mb-2 group-hover:scale-105 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">{stat.value}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6 leading-relaxed text-center">
            {SITE_NAME} doesn’t hand you a project and disappear. We develop, maintain, upgrade, and stand behind the projects, systems, and platforms our clients depend on — for individuals and organizations alike, for profit and for purpose, across every industry — backed by the business consultancy that turns delivery into enduring success.
          </p>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Featured Insight</h2>
            <div className="h-px w-8 bg-gold-500 mx-auto mb-3" />
            <p className="text-[11px] text-slate-500 max-w-lg mx-auto">A closer look at our methodology and strategic approach.</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-px bg-gradient-to-br from-gold-500/10 to-teal-500/10 rounded-[24px] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white rounded-[20px] overflow-hidden border border-slate-200 max-w-6xl mx-auto">
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                loop
                playsInline
                poster="/video-placeholder.jpg"
                onTimeUpdate={handleVideoTimeUpdate}
              >
                <source src="/featured-insight.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute bottom-0 right-0 z-50 pointer-events-none p-3">
                <div className="bg-white p-2 rounded-lg shadow-lg border-2 border-white">
                  <img src="/score-1.jpg" alt="" className="h-12 sm:h-16 w-auto rounded object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRODUCTION ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wide mb-3">
            What We Do
          </h2>
          <div className="h-px w-8 bg-gold-500 mx-auto mb-5" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Systems Design & Architecture</h3>
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We design and build robust enterprise systems that become the operational backbone of your organization. Our work spans full-stack platform development, database architecture, workflow automation, API integrations, and cloud-native solutions. We don't just write code — we engineer ecosystems. Every system we deliver is built with security, scalability, and maintainability as first-class requirements. From inventory management platforms to customer relationship systems, we tailor every layer of the stack to your specific business context, ensuring the technology works for you rather than the other way around.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our systems design process begins with a comprehensive audit of your current operations, data flows, and pain points. We then produce detailed architectural blueprints that define system boundaries, data models, integration points, and security protocols. Whether we are building a custom enterprise resource planning system, a customer-facing portal, or an internal workflow automation engine, we follow industry-standard patterns and frameworks that ensure your platform can grow without requiring a complete rebuild. We prioritize clean code practices, modular architecture, and thorough documentation so that your internal teams can understand, extend, and maintain the systems long after delivery.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                On the database side, we engineer schemas optimized for your specific query patterns and transaction volumes. We design caching layers, indexing strategies, and backup regimes that keep data accessible and safe. Our API work ensures that disparate systems — accounting software, CRMs, logistics trackers, and third-party services — communicate seamlessly through well-documented, versioned endpoints. We also build observability into every system from day one: structured logging, health checks, and performance metrics that allow your team to detect issues before they become incidents. The goal is always the same: a system that feels invisible because it simply works, handling complexity behind the scenes so your people can focus on productive work.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Strategy & Business Intelligence</h3>
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Strategy is not abstract theory — it is a repeatable process of aligning organizational resources with market realities. We work with leadership teams to diagnose operational gaps, quantify growth opportunities, and construct actionable roadmaps grounded in real data. Our strategic engagements include competitive analysis, market positioning, financial modeling, KPI framework design, and change management planning. We help organizations move from reactive decision-making to proactive, evidence-driven strategy. The result is not a document on a shelf but a living framework that guides daily priorities, investment choices, and performance measurement across every department.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our approach to business intelligence starts with data maturity assessment. We evaluate what data your organization already collects, where it lives, how reliable it is, and how accessible it is to decision-makers. From there, we design dashboards, reporting pipelines, and analytical models that turn raw data into actionable insight. We work with your team to identify the metrics that truly matter — leading indicators of performance, not lagging ones — and build the infrastructure to track them in real time. This often involves consolidating fragmented data sources, establishing single sources of truth, and training staff to interpret and act on the information presented to them.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We also partner with organizations during periods of significant change: market expansion, digital transformation, regulatory shifts, or competitive pressure. In these moments, strategy becomes survival. We facilitate leadership workshops, conduct scenario planning, and develop phased implementation plans that balance ambition with operational reality. Our change management support includes stakeholder communication plans, capability-building programs, and milestone tracking that keeps everyone aligned. We believe that the best strategy is one that is understood, owned, and executed by the people closest to the work — so we design strategies that are rigorous but also practical enough to be lived every day.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Networks & Infrastructure</h3>
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Modern enterprises depend on continuous, secure, and high-performance connectivity. We design, deploy, and maintain network infrastructures that keep organizations operational under any condition. Our capabilities include LAN and WAN architecture, cloud infrastructure design, VPN and remote access solutions, firewall and intrusion detection systems, endpoint security, server provisioning, and proactive monitoring. We treat infrastructure as a strategic asset, not a utility — because when networks fail, business stops. Our maintenance and support models ensure that downtime is minimized, threats are neutralized before they escalate, and your team has the reliable digital foundation needed to focus on what they do best.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our network design practice begins with understanding your organization's physical layout, user density, application requirements, and growth trajectory. We produce detailed network diagrams, cabling specifications, and equipment recommendations that balance performance with budget. For organizations with multiple locations, we design SD-WAN solutions that optimize traffic routing, reduce MPLS costs, and provide centralized management. We configure VLANs, quality of service policies, and access control lists that ensure critical applications always have the bandwidth they need while keeping sensitive segments isolated from general user traffic. Wireless designs are optimized for coverage, capacity, and interference avoidance, with seamless roaming for mobile devices and guest network segregation for visitors.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Security is embedded in every layer of our infrastructure work. We deploy and manage firewalls with regularly updated rule sets, implement endpoint detection and response solutions, configure email and web filtering gateways, and establish centralized logging and alerting through security information and event management platforms. We conduct regular vulnerability assessments, penetration testing, and compliance audits to ensure your infrastructure meets both internal policies and external regulatory requirements. On the cloud side, we design architectures on major platforms that leverage auto-scaling, redundancy, and managed services to reduce operational overhead while maintaining enterprise-grade security. Our support packages range from reactive break-fix coverage to fully managed operations centers that monitor your infrastructure 24 hours a day, 365 days a year, with defined response times and escalation paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE DELIVER ── */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">How We Deliver</h2>
            <div className="h-px w-8 bg-gold-500 mx-auto mb-3" />
            <p className="text-[11px] text-slate-500 max-w-lg mx-auto">A proven four-phase approach spanning systems, strategy, and network infrastructure. Each phase is executed with rigor, transparency, and a clear focus on measurable outcomes.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Server className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Phase 01</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Systems Analysis</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Every successful engagement begins with a deep technical and operational audit of your current infrastructure, workflows, and technology stack. We don't rely on surface-level observations — we embed ourselves in your environment to understand the real pain points, the hidden inefficiencies, and the unspoken constraints that shape daily operations. Our analysis covers hardware inventories, software configurations, network topologies, data storage practices, application dependencies, user workflows, security postures, and integration patterns. We also interview key stakeholders across departments to capture perspectives that raw data alone cannot reveal.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    The output of this phase is a comprehensive Systems Assessment Report. This document includes current-state diagrams, gap analyses against industry best practices, risk registers that prioritize vulnerabilities by severity and likelihood, and a prioritized roadmap of recommendations. We quantify the cost of inaction — downtime risks, productivity losses, security exposure, and scaling bottlenecks — so that leadership can make informed decisions about where to invest first. The assessment also defines the technical and organizational prerequisites for the subsequent phases, ensuring that strategy formulation and implementation are grounded in reality rather than assumption.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We use a combination of automated scanning tools, manual configuration reviews, log analysis, and stakeholder workshops to build a complete picture. Where possible, we benchmark your environment against similar organizations in your sector, providing context that helps you understand where you stand relative to peers. This phase typically spans one to two weeks for medium-sized environments and produces deliverables that serve as a shared reference point for the entire engagement, aligning technical teams, department heads, and executive sponsors around a common understanding of the challenges ahead.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <LineChart className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Phase 02</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Strategy Formulation</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    With a clear picture of the current state established, we move into strategy formulation — the phase where insights become actionable plans. We work closely with your leadership team to translate the assessment findings into a strategic framework that aligns technical capabilities with business objectives. This involves defining the target architecture, establishing investment priorities, sequencing initiatives to balance quick wins with longer-term transformations, and creating a governance model that ensures accountability throughout execution. We treat strategy as a living document, not a static artifact, and build in review cycles that allow the plan to adapt as conditions change.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our strategy work is deeply analytical. We model different scenarios — optimistic, realistic, and conservative — to show how varying levels of investment or different sequencing choices affect outcomes. We map dependencies between initiatives so that leaders understand which projects must precede others and where parallel work streams can accelerate progress. We also define the metrics that will be used to track success, establishing leading indicators that provide early warning signals and lagging indicators that confirm impact. Financial modeling is integral to this phase: we estimate total cost of ownership, return on investment, and payback periods for major initiatives, giving finance teams the information they need to approve budgets with confidence.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Change management is woven into strategy formulation from the beginning. We assess organizational readiness, identify potential sources of resistance, and design communication and capability-building programs that prepare your team for the transitions ahead. This includes stakeholder mapping, training needs analysis, and the creation of a change champion network that extends the reach of the transformation beyond the core project team. By the end of this phase, you have not only a technical roadmap but also a people roadmap — both are essential for sustainable success.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Phase 03</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Network & Systems Build</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    This is the execution phase where strategy becomes tangible infrastructure and working software. Our delivery approach is iterative and milestone-driven, with clear gates that must be passed before proceeding to the next stage. We begin by finalizing detailed technical specifications, equipment lists, and implementation timelines that have been agreed upon during strategy formulation. For network infrastructure projects, this includes cable routing plans, rack layouts, IP addressing schemes, and device configurations. For systems development, it includes database schemas, API contracts, user interface wireframes, and security control specifications.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Implementation is carried out by experienced engineers who follow disciplined change management processes to minimize disruption to your ongoing operations. Where possible, we build in parallel environments — staging and test networks, development systems, and pilot deployments — so that components are validated before they touch production. We conduct rigorous testing at multiple levels: unit tests for individual code modules, integration tests for system interfaces, performance tests under simulated load, and security tests that probe for vulnerabilities. Each milestone is documented with sign-off criteria that require explicit approval from your technical team before work proceeds.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Throughout the build phase, we maintain transparent communication through regular status reports, live dashboards, and scheduled review meetings. You always know what has been completed, what is in progress, what risks have emerged, and how the project is tracking against budget and timeline. We also invest heavily in knowledge transfer: our engineers document every configuration, train your staff on new systems and processes, and create operational runbooks that your team can reference independently. The goal is not just to deliver a project but to leave your organization stronger, more capable, and fully equipped to operate and extend the solutions we build together.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Phase 04</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Optimization & Support</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Delivery is not the endpoint — it is the beginning of a long-term performance journey. Our optimization and support model is designed to ensure that the systems and infrastructure we build continue to deliver value long after the initial project closes. We begin with a structured handover process that validates every component of the solution, confirms that your team is fully trained, and resolves any outstanding issues. We then transition into a support regime tailored to your needs, ranging from defined response-time service agreements for break-fix scenarios to fully managed operations centers that provide proactive monitoring and 24/7 coverage.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Proactive monitoring is central to our approach. We deploy observability tools that track system health, network performance, application responsiveness, and security events in real time. Alerts are configured with intelligent thresholds that reduce noise while ensuring that genuine issues are escalated promptly to the right people. Our support teams conduct regular health checks, capacity planning reviews, and security patching cycles that keep your environment current and resilient. We also offer periodic optimization reviews where we analyze usage patterns, performance trends, and business changes to identify opportunities for enhancement — because the systems that were right at launch may need adjustment as your organization evolves.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    For clients who view technology as a strategic differentiator rather than a utility, we offer continuous improvement partnerships. These engagements provide a fixed monthly scope of advisory and implementation work that allows you to pursue new initiatives, respond to emerging opportunities, and refine existing systems without the overhead of retendering or re-engaging for every small change. Our long-term clients benefit from accumulated knowledge of their environment, meaning that new requests can be fulfilled faster and with greater precision than would be possible with a series of one-off engagements. We measure the success of this phase not by the number of tickets resolved but by the sustained stability, performance, and adaptability of your organization's technology estate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DELIVER ── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">What We Deliver</h2>
            <div className="h-px w-8 bg-gold-500 mx-auto mb-3" />
            <p className="text-[11px] text-slate-500 max-w-lg mx-auto">Full-cycle technology, strategy, and infrastructure services. From concept to deployment and ongoing support, we handle every layer of the stack.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Target className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 01</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Systems Design</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We design and build robust enterprise systems that become the operational backbone of your organization. Our work spans full-stack platform development, database architecture, workflow automation, API integrations, and cloud-native solutions. We don't just write code — we engineer ecosystems. Every system we deliver is built with security, scalability, and maintainability as first-class requirements. From inventory management platforms to customer relationship systems, we tailor every layer of the stack to your specific business context, ensuring the technology works for you rather than the other way around.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our systems design process begins with a comprehensive audit of your current operations, data flows, and pain points. We then produce detailed architectural blueprints that define system boundaries, data models, integration points, and security protocols. Whether we are building a custom enterprise resource planning system, a customer-facing portal, or an internal workflow automation engine, we follow industry-standard patterns and frameworks that ensure your platform can grow without requiring a complete rebuild. We prioritize clean code practices, modular architecture, and thorough documentation so that your internal teams can understand, extend, and maintain the systems long after delivery.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    On the database side, we engineer schemas optimized for your specific query patterns and transaction volumes. We design caching layers, indexing strategies, and backup regimes that keep data accessible and safe. Our API work ensures that disparate systems — accounting software, CRMs, logistics trackers, and third-party services — communicate seamlessly through well-documented, versioned endpoints. We also build observability into every system from day one: structured logging, health checks, and performance metrics that allow your team to detect issues before they become incidents. The goal is always the same: a system that feels invisible because it simply works, handling complexity behind the scenes so your people can focus on productive work.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 02</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Strategic Creation</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Strategy is not abstract theory — it is a repeatable process of aligning organizational resources with market realities. We work with leadership teams to diagnose operational gaps, quantify growth opportunities, and construct actionable roadmaps grounded in real data. Our strategic engagements include competitive analysis, market positioning, financial modeling, KPI framework design, and change management planning. We help organizations move from reactive decision-making to proactive, evidence-driven strategy. The result is not a document on a shelf but a living framework that guides daily priorities, investment choices, and performance measurement across every department.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our approach to business intelligence starts with data maturity assessment. We evaluate what data your organization already collects, where it lives, how reliable it is, and how accessible it is to decision-makers. From there, we design dashboards, reporting pipelines, and analytical models that turn raw data into actionable insight. We work with your team to identify the metrics that truly matter — leading indicators of performance, not lagging ones — and build the infrastructure to track them in real time. This often involves consolidating fragmented data sources, establishing single sources of truth, and training staff to interpret and act on the information presented to them.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We also partner with organizations during periods of significant change: market expansion, digital transformation, regulatory shifts, or competitive pressure. In these moments, strategy becomes survival. We facilitate leadership workshops, conduct scenario planning, and develop phased implementation plans that balance ambition with operational reality. Our change management support includes stakeholder communication plans, capability-building programs, and milestone tracking that keeps everyone aligned. We believe that the best strategy is one that is understood, owned, and executed by the people closest to the work — so we design strategies that are rigorous but also practical enough to be lived every day.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 03</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Continuous Maintenance</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Delivery is not the endpoint — it is the beginning of a long-term performance journey. Our optimization and support model is designed to ensure that the systems and infrastructure we build continue to deliver value long after the initial project closes. We begin with a structured handover process that validates every component of the solution, confirms that your team is fully trained, and resolves any outstanding issues. We then transition into a support regime tailored to your needs, ranging from defined response-time service agreements for break-fix scenarios to fully managed operations centers that provide proactive monitoring and 24/7 coverage.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Proactive monitoring is central to our approach. We deploy observability tools that track system health, network performance, application responsiveness, and security events in real time. Alerts are configured with intelligent thresholds that reduce noise while ensuring that genuine issues are escalated promptly to the right people. Our support teams conduct regular health checks, capacity planning reviews, and security patching cycles that keep your environment current and resilient. We also offer periodic optimization reviews where we analyze usage patterns, performance trends, and business changes to identify opportunities for enhancement — because the systems that were right at launch may need adjustment as your organization evolves.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    For clients who view technology as a strategic differentiator rather than a utility, we offer continuous improvement partnerships. These engagements provide a fixed monthly scope of advisory and implementation work that allows you to pursue new initiatives, respond to emerging opportunities, and refine existing systems without the overhead of retendering or re-engaging for every small change. Our long-term clients benefit from accumulated knowledge of their environment, meaning that new requests can be fulfilled faster and with greater precision than would be possible with a series of one-off engagements. We measure the success of this phase not by the number of tickets resolved but by the sustained stability, performance, and adaptability of your organization's technology estate.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 04</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Website Development</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We design and build high-performance websites that serve as the digital face of your organization. Our work ranges from marketing websites and landing pages to complex web portals, e-commerce platforms, and content management systems. Every site we deliver is responsive, accessible, search-engine optimized, and built to load quickly on any device. We use modern frameworks and static-site generators where appropriate, paired with headless CMS architectures that give your team full control over content without compromising performance or security.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our website process starts with discovery: understanding your brand, audience, content requirements, and conversion goals. We then produce information architecture, wireframes, and visual designs that are reviewed and approved before a single line of code is written. Development follows best practices for semantic markup, progressive enhancement, and cross-browser compatibility. We integrate analytics, SEO metadata, performance monitoring, and where needed, marketing automation or customer engagement tools. After launch, we provide training, documentation, and optional maintenance packages that keep your site secure, up to date, and aligned with evolving business needs.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 05</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Web & Desktop Applications</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We build custom web and desktop applications that automate workflows, centralize data, and give your organization a competitive edge. On the web side, we develop single-page applications, progressive web apps, and multi-tenant SaaS platforms using modern JavaScript frameworks and component architectures. On the desktop side, we build cross-platform and native applications for Windows, macOS, and Linux that integrate with local hardware, file systems, and third-party services. Whether your users are internal staff, partners, or customers, we design interfaces that reduce training overhead and increase adoption.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our application development practice is grounded in user-centered design and iterative delivery. We start with user research, journey mapping, and prototype validation to ensure the solution solves real problems before heavy engineering begins. Technical decisions are guided by requirements for offline capability, real-time collaboration, data synchronization, and integration with existing enterprise systems. We implement robust authentication, role-based access control, audit logging, and encryption to meet security and compliance expectations. Our deployment pipelines include automated testing, staging environments, and rollback strategies that minimize risk during releases.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    After delivery, we continue to support and evolve the application based on user feedback, regulatory changes, and new business opportunities. We refactor legacy codebases, modernize outdated architectures, and add new modules without disrupting existing operations. For organizations with in-house development teams, we also provide code reviews, architecture guidance, and knowledge transfer sessions that raise the overall capability of your technology function. The goal is to deliver software that not only meets the immediate brief but becomes a durable asset that grows with your organization.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 06</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Mobile Applications</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We design and develop native and cross-platform mobile applications for Android and iOS that extend your digital presence into the pockets and hands of your users. Our mobile work covers customer-facing apps, employee tools, field-service applications, and IoT companion interfaces. We prioritize performance, battery efficiency, offline resilience, and intuitive gesture-based navigation so that the app feels like a natural extension of your brand rather than a disconnected utility.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our mobile development approach begins with platform-specific design guidelines and user research to ensure the experience feels native on each operating system. We build for scalability from day one, using backend services that can handle push notifications, real-time data synchronization, file storage, and user authentication across millions of devices. We implement analytics, crash reporting, and feature flagging that allow you to measure adoption, diagnose issues, and roll out improvements safely. For devices that operate in low-connectivity environments, we design data synchronization strategies that keep users productive even when the network is unreliable.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We also support organizations that need to distribute apps internally through mobile device management platforms, enforce security policies, and integrate with corporate directories and single sign-on systems. Our team handles the full submission process for public app stores, including compliance with platform review guidelines, privacy policies, and age-rating requirements. Post-launch, we provide ongoing maintenance that covers operating system updates, dependency upgrades, security patches, and feature enhancements, ensuring your mobile presence remains current and secure.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 07</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Product Maintenance & Support</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We provide comprehensive maintenance and support for every product we develop — websites, applications, networks, and infrastructure. Our support models are designed around your operational reality, offering everything from defined response-time break-fix agreements to fully managed service desks with proactive monitoring and 24/7 coverage. We treat maintenance as a continuous improvement process, not just a reactive cost center, because the systems that were perfect at launch need care as business requirements, threat landscapes, and technology platforms evolve.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    For software products, our maintenance regime includes regular dependency updates, security patching, performance optimization, bug fixes, and compatibility testing against new browser and operating system versions. We monitor application logs, error rates, and user experience metrics to catch issues before they escalate into incidents. We also offer feature enhancement sprints that allow you to extend the functionality of your products in response to user feedback or market changes, all managed through a transparent backlog and sprint planning process. Our clients receive monthly health reports that summarize uptime, issues resolved, improvements delivered, and recommendations for the period ahead.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    For network and infrastructure clients, maintenance covers firmware updates, configuration audits, capacity planning, cable testing, and scheduled preventive visits that reduce the likelihood of unplanned downtime. We maintain spare parts inventories for critical equipment, manage vendor relationships on your behalf, and coordinate with your facilities team to ensure that environmental and power requirements are met. Our goal is to make technology maintenance predictable, professional, and invisible to your end users — so your team can focus on running the business rather than fixing the tools that support it.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 08</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Hardware & Software Installations</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We handle the procurement, installation, configuration, and ongoing maintenance of hardware and software for organizations of all sizes. Our hardware services cover servers, workstations, networking equipment, printers, scanners, CCTV systems, access control devices, and specialized peripherals. We manage the full asset lifecycle from initial needs assessment and vendor selection through rack mounting, cable management, power configuration, and labeling, to final testing and sign-off. Every installation is documented with device inventories, configuration records, and warranty details that form the foundation of your asset management system.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    On the software side, we install and configure operating systems, productivity suites, enterprise applications, database servers, development environments, and industry-specific tools. We handle licensing compliance, patch management, user account provisioning, and integration with your existing directory services. For organizations moving to new software versions or migrating between platforms, we plan and execute cutovers with minimal disruption, including data migration, user training, and parallel running periods that de-risk the transition. We also support software audits and compliance reporting, helping you maintain an accurate software asset register that satisfies both internal governance and external regulatory requirements.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Maintenance contracts for hardware and software ensure that your environment remains current and supported. We schedule firmware updates, replace aging components before they fail, and coordinate warranty claims with manufacturers. Our engineers are certified across a wide range of platforms and can provide the vendor-level expertise that many organizations struggle to retain in-house. By consolidating hardware and software support under one relationship, you benefit from faster issue resolution, consistent communication, and a single point of accountability for the technology that keeps your business running.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Network className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 09</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Network Installations & Infrastructure</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We design, install, and maintain network infrastructures that provide the secure, high-performance connectivity your organization depends on. Our installation services cover structured cabling, fiber optic deployments, wireless access point placement, rack and stack of network equipment, IP address planning, VLAN configuration, and end-to-end testing that certifies performance against agreed specifications. We work with copper and fiber infrastructures, from single-room setups to multi-building campuses and geographically distributed networks spanning multiple countries.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our network installations follow recognized standards and best practices, including proper cable management, labeling, and documentation that makes future troubleshooting and expansion straightforward. We produce as-built drawings, equipment schedules, and configuration backups that become part of your operational knowledge base. Where required, we coordinate with building management, landlords, and regulatory authorities to ensure that installations comply with fire safety, electrical, and telecommunications regulations. We also perform signal strength surveys, interference analysis, and heat maps that optimize wireless coverage in challenging environments such as warehouses, manufacturing floors, and older buildings with thick walls.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Beyond installation, we provide ongoing network maintenance that keeps your infrastructure in peak condition. This includes firmware updates, configuration audits, bandwidth monitoring, fault identification and resolution, and capacity planning that anticipates growth before it becomes a constraint. Our maintenance contracts include defined response times for critical outages, regular health checks, and recommendations for technology refreshes that keep your network aligned with the latest security and performance standards. Whether you are building a new office, expanding an existing site, or troubleshooting chronic connectivity issues, we have the expertise to deliver reliable results on time and within budget.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Service 10</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Strategy Consultations & General Projects</h3>
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Strategy is the lens through which we view every engagement. Our consultation services are available for organizations that need expert guidance on technology direction, digital transformation, operational improvement, or any project across all fields. We bring a systems-thinking approach to problems that may appear unrelated — whether you are restructuring a supply chain, launching a new product line, expanding into new markets, or redesigning your entire organizational structure, we provide frameworks, analysis, and impartial advice that cut through complexity.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our consultations are not limited to technology. We advise on business model innovation, market entry strategies, operational efficiency programs, financial planning, risk management, and organizational design. We facilitate board-level strategy sessions, conduct due diligence for acquisitions and partnerships, and produce feasibility studies that give decision-makers the evidence they need to commit to major investments. Because we operate across systems, networks, and strategy simultaneously, we are able to identify synergies and dependencies that specialized firms in a single discipline might miss. The result is advice that is holistic, practical, and grounded in what is actually possible to deliver.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    We also accept engagements in any field that requires structured project management, technical expertise, or strategic thinking. This includes research and development initiatives, community projects, academic collaborations, nonprofit technology programs, and public-sector consulting. If the project requires rigor, reliability, and a partner who can operate across boundaries, we are prepared to engage. Every consultation begins with a clear scope, defined deliverables, and a transparent fee structure so that there are no surprises and no ambiguity about what success looks like.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ── */}
      <section className="py-8 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Avg. Project Growth', value: '340%', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { label: 'Client Retention', value: '94%', icon: <UserCheck className="w-3.5 h-3.5" /> },
              { label: 'Avg. Timeline', value: '-40%', icon: <Clock className="w-3.5 h-3.5" /> },
              { label: 'ROI Average', value: '12x', icon: <Zap className="w-3.5 h-3.5" /> }
            ].map((metric, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gold-500/10 text-gold-600 mb-1.5">
                  {metric.icon}
                </div>
                <div className="text-lg font-bold text-slate-900 mb-0.5">{metric.value}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Client Perspectives</h2>
            <div className="h-px w-8 bg-gold-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-5 rounded-xl bg-white border border-slate-200 hover:border-gold-500/10 transition-all duration-300">
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-gold-500" />
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-4">"{testimonial.quote}"</p>
                <div className="h-px w-6 bg-gold-500/20 mb-3" />
                <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">{testimonial.author}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{testimonial.role}</div>
                <div className="text-[9px] text-gold-600 font-bold mt-0.5">{testimonial.company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Ready to Build What Matters?</h2>
          <p className="text-xs text-slate-500 mb-6 max-w-xl mx-auto">
            One conversation can clarify the path forward. Let's talk about your next chapter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-gold-500/10 hover:bg-gold-400 transition-all active:scale-95">
              Start a Conversation
              <ArrowRight size={12} />
            </Link>
            <a href="tel:+254115525854" className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all">
              <Phone size={12} />
              +254 115 525 854
            </a>
          </div>
        </div>
      </section>

      {/* ── TERMS OF USE ── */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-2">Terms of Use</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">A formal framework for working together</h2>
            <div className="h-px w-8 bg-gold-500 mx-auto" />
            <p className="mt-3 text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
              These Terms of Use govern the use of our services, systems, digital resources, and strategic engagement framework between The-Greggory-Systems-And-Strategy-firm and the parties using our solutions.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-12">
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Term 01</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Acceptance of Terms</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  By accessing or using the services, systems, content, reports, or materials made available by The-Greggory-Systems-And-Strategy-firm, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. Continued use of our platform or professional services after changes have been published constitutes your acceptance of the updated terms.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Target className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Term 02</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Scope of Services</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The firm provides strategic systems design, implementation support, operational oversight, and related advisory services according to the agreed scope of work, service timetable, communication channels, and responsibilities defined between the parties. We reserve the right to pause or discontinue services when work exceeds the agreed scope, fails to meet project standards, or conflicts with the agreed terms of engagement.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Term 03</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Accounts and Authorized Access</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Access to our services and administrative systems is limited to authorized users only. Each user is responsible for maintaining the security of their credentials, using the platform only for approved purposes, and ensuring that all access and activity associated with their account remains compliant with these terms and all applicable operational policies.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Term 04</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Confidentiality and Data Protection</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  All information exchanged through our client engagements, platforms, and support channels shall be treated as confidential unless otherwise explicitly agreed in writing. This includes proprietary business information, operational data, personal information, and any materials disclosed in the course of the engagement. The firm will handle such information with appropriate discretion and in accordance with applicable legal and professional obligations.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Term 05</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Intellectual Property</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  All proprietary systems, frameworks, strategy documents, designs, methods, reports, and digital materials created by The-Greggory-Systems-And-Strategy-firm remain the property of the firm unless a separate written agreement expressly transfers ownership. No party may redistribute, resell, copy, repurpose, or reverse-engineer such materials without prior written permission.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Term 06</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Limitation of Liability</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The firm endeavors to provide reliable, professional, and high-quality services; however, it shall not be liable for indirect, incidental, consequential, or special damages arising from service delays, third-party changes, unforeseen operational disruptions, external market conditions, or force majeure events outside its reasonable control. This includes losses related to business interruption, operational delay, loss of data, or missed opportunity, to the extent permitted by applicable law.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Term 07</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Termination and Enforcement</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The firm may suspend or terminate access to services, platforms, or project materials where misuse, policy violations, operational risk, or non-compliance with agreed responsibilities are identified. In circumstances requiring immediate action, access may be withdrawn without prior notice in order to protect the integrity of the system, the security of client information, or the continued delivery of services.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              These terms are intended to preserve the integrity of the professional relationship, protect confidential information, and define the lawful basis upon which services and access are provided. For the full legal framework and any additional detail, please refer to the complete Terms of Use page.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/terms" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-gold-500/10 hover:bg-gold-400 transition-all">
              Read Full Terms of Use
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Capability 01</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Service Areas</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Strategic systems design, operational consulting, digital transformation, and ongoing maintenance for enterprises across Kenya and East Africa.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Capability 02</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Response Commitment</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We respond to all client inquiries within 24 hours. For urgent project matters, our team is available during business hours on +254 115 525 854.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Award className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Capability 03</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Client Success</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  98% client satisfaction rate across 150+ delivered projects. We measure our success by the lasting impact we create for our clients.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="w-px h-full bg-slate-200 mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Capability 04</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Data Protection & Confidentiality</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We maintain strict confidentiality for all client data and project information. Our systems comply with applicable data protection laws, and we never share client information with third parties without explicit consent.
                </p>
              </div>
            </div>

            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center shadow-md shadow-gold-500/10">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">Capability 05</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Accessibility & Support</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Our platform and services are designed to be accessible to all authorized users. For technical support or accessibility concerns, contact our team at thegreggorysystemsandstrategyf@gmail.com or call +254 115 525 854.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
