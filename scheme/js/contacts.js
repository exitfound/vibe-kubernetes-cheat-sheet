// ============================================================
//  K8s Cheat Sheet | contacts.js
//  Delete this file to build without Contacts & Sponsor.
// ============================================================

export const CONTACTS = {
  enabled: true,
  links: [
    {
      label: 'Telegram Channel',
      href:  'https://t.me/opengrad',
      icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>`,
    },
    {
      label: 'Twitch Channel',
      href:  'https://www.twitch.tv/exitfound',
      icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
    },
  ],
};

export const GITHUB = {
  enabled: true,
  label: 'GitHub',
  href:  'https://github.com/exitfound/vibe-kubernetes-cheat-sheet',
  icon:  `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`,
};

export const SPONSOR = {
  enabled: true,
  donate: {
    label: 'Donate',
    href:  'https://www.donationalerts.com/r/exitfound',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  },
  wallets: [
    { coin: 'USDT', net: 'TRC20',   addr: 'TYHP4sqCggATZH3UNrHhS7R8Ur6w7Uve7E' },
    { coin: 'BTC',  net: 'Bitcoin', addr: '135qf75oA41ivUgrr7UBEuAFQkXt9aer3u' },
    { coin: 'ETH',  net: 'ERC20',   addr: '0xf621678d77d6b593a178428d0c69eb6fe39dfcc3' },
  ],
};
