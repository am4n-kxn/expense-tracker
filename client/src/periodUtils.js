function pad(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Returns { start, end } as Date objects (local midnight) for the period of
// `periodType` that contains `referenceDate`. Custom has no auto-computed
// range — the caller supplies explicit dates instead.
export function getPeriodRange(periodType, referenceDate) {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);

  if (periodType === 'weekly') {
    const day = d.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }

  if (periodType === 'quarterly') {
    const q = Math.floor(d.getMonth() / 3);
    const start = new Date(d.getFullYear(), q * 3, 1);
    const end = new Date(d.getFullYear(), q * 3 + 3, 0);
    return { start, end };
  }

  // monthly (default)
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start, end };
}

// Moves a reference date forward/back by one period of the given type.
// direction is +1 or -1.
export function shiftPeriod(periodType, referenceDate, direction) {
  const d = new Date(referenceDate);
  if (periodType === 'weekly') d.setDate(d.getDate() + direction * 7);
  else if (periodType === 'quarterly') d.setMonth(d.getMonth() + direction * 3);
  else d.setMonth(d.getMonth() + direction);
  return d;
}

export function periodLabel(periodType, start, end) {
  if (periodType === 'weekly') {
    return `Week of ${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
  }
  if (periodType === 'quarterly') {
    const q = Math.floor(start.getMonth() / 3) + 1;
    return `Q${q} ${start.getFullYear()}`;
  }
  if (periodType === 'custom') {
    return `${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }
  return start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function dateToStr(d) {
  return toDateStr(d);
}

export function strToDate(s) {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(y, m - 1, day);
}
