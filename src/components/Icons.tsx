type P = { size?: number };
const s = (size = 22) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconCard = ({ size }: P) => <svg {...s(size)}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 14h5" /></svg>;
export const IconBowl = ({ size }: P) => <svg {...s(size)}><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M9 7c0-1.5 1-2 1-3" /><path d="M14 7c0-1.5 1-2 1-3" /></svg>;
export const IconFriends = ({ size }: P) => <svg {...s(size)}><circle cx="9" cy="9" r="3.5" /><circle cx="17" cy="10" r="2.5" /><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5" /><path d="M15 15c3 0 6 1.5 6 4.5" /></svg>;
export const IconPin = ({ size }: P) => <svg {...s(size)}><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
export const IconPlus = ({ size = 18 }: P) => <svg {...s(size)} strokeWidth={2}><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
export const IconBack = ({ size = 16 }: P) => <svg {...s(size)} strokeWidth={2.2}><path d="M15 5l-7 7 7 7" /></svg>;
export const IconChevron = ({ size = 18 }: P) => <svg {...s(size)} strokeWidth={2}><path d="M9 6l6 6-6 6" /></svg>;
export const IconTap = ({ size = 20 }: P) => <svg {...s(size)} strokeWidth={1.6}><path d="M8 7a7 7 0 0 1 0 10" /><path d="M12 5a10 10 0 0 1 0 14" /><path d="M16 3a13 13 0 0 1 0 18" /></svg>;
export const IconMic = ({ size = 28 }: P) => <svg {...s(size)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>;
export const IconWallet = ({ size = 20 }: P) => <svg {...s(size)}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /></svg>;
export const IconLock = ({ size = 18 }: P) => <svg {...s(size)}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
export const IconCheck = ({ size = 14 }: P) => <svg {...s(size)} strokeWidth={3}><path d="M5 12l5 5 9-10" /></svg>;
export const IconApple = ({ size = 18 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.3z" /></svg>
);
