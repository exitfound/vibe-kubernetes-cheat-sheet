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
