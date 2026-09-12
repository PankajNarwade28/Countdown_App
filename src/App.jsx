import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

const monthLookup = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function zeroPad(value) {
  return String(value).padStart(2, '0');
}

function formatDateToSlug(date) {
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = zeroPad(date.getFullYear() % 100);
  return `${day}-${month}-${year}`;
}

function formatDateForInput(date) {
  return [date.getFullYear(), zeroPad(date.getMonth() + 1), zeroPad(date.getDate())].join('-');
}

function parseSlugToDate(slug) {
  const match = slug.trim().toLowerCase().match(/^(\d{1,2})-([a-z]{3})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = monthLookup[match[2]];
  const year = 2000 + Number(match[3]);

  if (month === undefined) {
    return null;
  }

  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function getCountdownParts(targetDate) {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      complete: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    complete: false,
  };
}

function IconShell({ children, href, label }) {
  const classes =
    'flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-lg hover:shadow-cyan-500/10';

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} aria-label={label} title={label}>
        {children}
      </a>
    );
  }

  return (
    <div className={classes} aria-label={label} title={label}>
      {children}
    </div>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="#F3F4F6" />
      <path d="M4 7.5L12 13L20 7.5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18.5L9.8 12.9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 18.5L14.2 12.9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <rect x="2.5" y="6.5" width="19" height="11" rx="3" fill="#ef4444" />
      <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="#fff" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5C6.75 2.5 2.5 6.8 2.5 12.1c0 4.25 2.75 7.85 6.56 9.12.48.09.66-.21.66-.47 0-.23-.01-.84-.01-1.65-2.67.59-3.23-1.18-3.23-1.18-.44-1.15-1.08-1.46-1.08-1.46-.88-.6.07-.59.07-.59.97.07 1.48 1.01 1.48 1.01.86 1.49 2.27 1.06 2.83.81.09-.64.34-1.06.62-1.31-2.13-.25-4.37-1.08-4.37-4.8 0-1.06.37-1.93.98-2.62-.1-.25-.42-1.25.1-2.6 0 0 .8-.26 2.62 1.01.76-.21 1.56-.32 2.36-.32s1.6.11 2.36.32c1.82-1.27 2.62-1.01 2.62-1.01.52 1.35.2 2.35.1 2.6.61.69.98 1.56.98 2.62 0 3.73-2.24 4.55-4.38 4.8.35.31.66.91.66 1.84 0 1.31-.01 2.36-.01 2.68 0 .26.18.56.67.46 3.8-1.27 6.55-4.87 6.55-9.12 0-5.3-4.25-9.6-9.5-9.6Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#0A66C2" />
      <path d="M8 10.5V17" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="7.2" r="1.2" fill="#fff" />
      <path d="M12.3 17V10.8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.3 13.1c0-1.4.9-2.5 2.2-2.5s2.2 1.1 2.2 2.5V17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#instagramGradient)" />
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="4" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.8" />
      <circle cx="16.2" cy="7.8" r="1" fill="#fff" />
      <defs>
        <linearGradient id="instagramGradient" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEDA75" />
          <stop offset="0.35" stopColor="#FA7E1E" />
          <stop offset="0.7" stopColor="#D62976" />
          <stop offset="1" stopColor="#962FBF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SocialCard() {
  const socials = [
    { label: 'YouTube',href: 'https://youtube.com/@ukdvibesbypankajnarwade?si=LCubq6RFbjTGb9LB', icon: <YoutubeIcon /> },
    { label: 'Email', href: 'mailto:pankajnarwade.work@gmail.com', icon: <EmailIcon /> },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pankaj-narwade-13a053260/', icon: <LinkedInIcon /> },
    { label: 'GitHub', href: 'https://github.com/PankajNarwade28', icon: <GithubIcon /> },
    { label: 'Instagram', href: 'https://www.instagram.com/pankajnarwade.patil/',icon: <InstagramIcon /> },
  ];

  return (
    <section className="w-full max-w-3xl rounded-[1.5rem] border border-white/10 bg-[#0b1020] px-6 py-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-8">
      <div className="mb-5 pb-3">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Let's Connect</h2>
        <div className="mt-3 h-1 w-12 rounded-full bg-cyan-400" />
        <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
          Follow my journey and stay updated with my latest projects and insights.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        {socials.map((social) => (
          <IconShell key={social.label} href={social.href} label={social.label}>
            {social.icon}
          </IconShell>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState('');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefilledDate = params.get('date');

    if (prefilledDate) {
      setSelectedDate(prefilledDate);
    }
  }, [location.search]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedDate) {
      return;
    }

    const [year, month, day] = selectedDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    navigate(`/${formatDateToSlug(targetDate)}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-6">
        <section className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
          <div className="mb-8 space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-300/90">Countdown Timer</p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Pick a date and launch the clock</h1>
            <p className="mx-auto max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Choose any date, submit it, and the app will route you to a dedicated countdown page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-slate-300">Target date</span>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
              />
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] hover:from-amber-300 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedDate}
            >
              Start countdown
            </button>
          </form>
        </section>

        <SocialCard />
      </div>
    </main>
  );
}

function CountdownCard({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-28 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-gray-700 to-gray-800 px-3 shadow-flip shadow-black/60 sm:h-36 sm:w-32 md:h-40 md:w-36">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-white/10" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_35%,transparent_65%,rgba(0,0,0,0.22))]" />
        <span className="relative text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl">
          {zeroPad(value)}
        </span>
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.45em] text-amber-300 sm:text-sm">{label}</span>
    </div>
  );
}

function CountdownPage() {
  const { dateSlug } = useParams();
  const navigate = useNavigate();
  const targetDate = useMemo(() => (dateSlug ? parseSlugToDate(dateSlug) : null), [dateSlug]);
  const [countdown, setCountdown] = useState(() => (targetDate ? getCountdownParts(targetDate) : null));
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (!targetDate) {
      return undefined;
    }

    const updateCountdown = () => setCountdown(getCountdownParts(targetDate));
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, [targetDate]);

  if (!targetDate) {
    return <Navigate to="/" replace />;
  }

  const title = targetDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function handleChangeDate() {
    navigate(`/?date=${formatDateForInput(targetDate)}`);
  }

  async function handleShareLink() {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Countdown Timer',
          text: `Countdown for ${title}`,
          url: shareUrl,
        });
        setShareMessage('Link shared successfully.');
        return;
      } catch {
        // Fall through to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Link copied to clipboard.');
    } catch {
      setShareMessage('Unable to share the link from this browser.');
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-300/90">Live countdown</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">URL slug: /{dateSlug}</p>
            <button
              type="button"
              onClick={handleChangeDate}
              className="mt-5 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-300/60 hover:bg-amber-300/20"
            >
              Change date
            </button>
            <button
              type="button"
              onClick={handleShareLink}
              className="ml-3 mt-5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              Share link
            </button>
            {shareMessage ? <p className="mt-3 text-sm text-slate-300">{shareMessage}</p> : null}
          </div>

          {countdown?.complete ? (
            <div className="rounded-[1.75rem] border border-amber-400/20 bg-amber-400/10 px-6 py-10 text-center">
              <p className="text-2xl font-black text-amber-200 sm:text-3xl">The countdown has reached zero.</p>
              <p className="mt-2 text-sm text-amber-100/80">Refresh or choose a new date to start another timer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              <CountdownCard value={countdown?.days ?? 0} label="Days" />
              <CountdownCard value={countdown?.hours ?? 0} label="Hours" />
              <CountdownCard value={countdown?.minutes ?? 0} label="Minutes" />
              <CountdownCard value={countdown?.seconds ?? 0} label="Seconds" />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:dateSlug" element={<CountdownPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}