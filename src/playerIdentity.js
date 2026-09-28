// Zixxy is the in-game name used by the roster player ghosted.
export function rosterPlayerName(name) {
  const normalized = String(name ?? '').trim();
  return /^zixxy$|^ghosted$/i.test(normalized) ? 'ghosted' : normalized;
}

export function displayPlayerName(name) {
  return rosterPlayerName(name) === 'ghosted' ? 'ghosted (Zixxy)' : name;
}
