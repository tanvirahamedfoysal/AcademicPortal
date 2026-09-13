import { Github, GraduationCap, Linkedin, Mail, MapPin, Phone, Send } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import ContactForm from '../../components/public/ContactForm';
import { getContactMeta, getPortfolio } from '../../lib/public-api';

export const metadata = { title: 'Contact', description: 'Contact the researcher for academic collaboration and research opportunities.' };

function safe(value?: string | null) { return value || undefined; }

export default async function ContactPage() {
  const [meta, portfolio] = await Promise.all([getContactMeta(), getPortfolio()]);
  const email = safe(meta?.email || portfolio?.email);
  const phone = safe(meta?.phone || portfolio?.phone);
  const institution = [portfolio?.college, portfolio?.school].filter(Boolean).join(' · ');
  const links = [
    { label: 'Google Scholar', href: meta?.google_scholar_url || portfolio?.google_scholar_url, icon: GraduationCap },
    { label: 'GitHub', href: meta?.github_url || portfolio?.github_url, icon: Github },
    { label: 'LinkedIn', href: meta?.linkedin_url || portfolio?.linkedin_url, icon: Linkedin },
  ].filter((item) => item.href && /^https?:\/\//.test(String(item.href)));

  return (
    <MainLayout>
      <section className="border-b border-slate-200 bg-[#fffdfb]">
        <div className="page-shell py-16 lg:py-20">
          <p className="eyebrow">Contact & collaboration</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-bold tracking-[-0.045em] sm:text-6xl">Start an academic conversation.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">Reach out about research collaboration, publications, academic supervision, resources, speaking, or learning opportunities.</p>
        </div>
      </section>

      <section className="page-shell grid gap-8 py-14 lg:grid-cols-[.72fr_1.28fr] lg:py-20">
        <aside className="rounded-[28px] border border-[#e7c8d5] bg-[linear-gradient(145deg,#f8dce7_0%,#edf6ff_100%)] p-7 text-slate-900 shadow-sm sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d98bab]">Research contact</p>
          <h2 className="mt-4 font-serif text-3xl font-bold">Let&apos;s connect around meaningful work.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">Provide a little context in your message so the conversation can begin with the right research or academic focus.</p>
          <div className="mt-9 space-y-4">
            {email && <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-2xl border border-[#d8e5ec] bg-[#fffdfb]/72 p-4 text-sm font-semibold"><Mail className="h-4 w-4 text-[#d98bab]" /> {email}</a>}
            {phone && <a href={`tel:${phone}`} className="flex items-center gap-3 rounded-2xl border border-[#d8e5ec] bg-[#fffdfb]/72 p-4 text-sm font-semibold"><Phone className="h-4 w-4 text-[#d98bab]" /> {phone}</a>}
            {institution && <div className="flex items-start gap-3 rounded-2xl border border-[#d8e5ec] bg-[#fffdfb]/72 p-4 text-sm font-semibold"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d98bab]" /> {institution}</div>}
          </div>
          {links.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{links.map(({ label, href, icon: Icon }) => <a key={label} href={String(href)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#d2e4ea] bg-[#fffdfb]/65 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white/10 hover:text-white"><Icon className="h-3.5 w-3.5" /> {label}</a>)}</div>}
          <div className="mt-10 flex items-center gap-2 border-t border-[#d8e5ec] pt-6 text-xs text-slate-500"><Send className="h-3.5 w-3.5" /> Messages are stored through the existing contact API.</div>
        </aside>
        <div>
          <ContactForm />
        </div>
      </section>
    </MainLayout>
  );
}
