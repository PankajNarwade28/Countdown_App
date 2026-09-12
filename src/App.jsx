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
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
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