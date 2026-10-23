/** Duración en mm:ss desde los sellos de tiempo del servidor (no reloj del navegador). */
export function formatDuration(value) {
  if (value === null || value === undefined || value === '') return '—';
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const s = Math.round(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
export const scoreTen = row => Number(row.scoring_version)===2 ? Number(row.score)/10 : Number(row.correct_count)||0;
