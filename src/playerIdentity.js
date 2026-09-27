// Zixxy is the in-game name used by the roster player BitchStewie.
export function rosterPlayerName(name) {
  const normalized = String(name ?? '').trim();
  return /^zixxy$|^bitchstewie$/i.test(normalized) ? 'BitchStewie' : normalized;
}

export function displayPlayerName(name) {
  return rosterPlayerName(name) === 'BitchStewie' ? 'BitchStewie (Zixxy)' : name;
}
