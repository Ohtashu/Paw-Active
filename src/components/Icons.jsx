// Shared inline SVG icon components — Material Design paths

const Svg = ({ d, className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

export const IcHome     = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />;
export const IcBook     = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />;
export const IcHistory  = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.95-2.05L6.64 18.36A8.955 8.955 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />;
export const IcWallet   = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />;
export const IcProfile  = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />;
export const IcBell     = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />;
export const IcLogout   = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />;
export const IcPlus     = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />;
export const IcCheck    = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />;
export const IcClose    = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />;
export const IcEdit     = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />;
export const IcTrash    = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />;
export const IcChevR    = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />;
export const IcChevL    = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />;
export const IcLocation = ({ className = 'w-4 h-4 fill-current' }) => <Svg className={className} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />;
export const IcClock    = ({ className = 'w-4 h-4 fill-current' }) => <Svg className={className} d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />;
export const IcStar     = ({ className = 'w-4 h-4 fill-current' }) => <Svg className={className} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />;
export const IcMenu     = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />;
export const IcTopUp    = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />;
export const IcSearch   = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />;
export const IcArrow    = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />;
export const IcInfo     = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />;
export const IcRefund   = ({ className = 'w-5 h-5 fill-current' }) => <Svg className={className} d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />;
export const IcPaw      = ({ className = 'w-6 h-6 fill-current' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <ellipse cx="10" cy="20" rx="6" ry="8" transform="rotate(-20 10 20)" />
    <ellipse cx="22" cy="12" rx="5.5" ry="7.5" transform="rotate(-8 22 12)" />
    <ellipse cx="42" cy="12" rx="5.5" ry="7.5" transform="rotate(8 42 12)" />
    <ellipse cx="54" cy="20" rx="6" ry="8" transform="rotate(20 54 20)" />
    <ellipse cx="32" cy="42" rx="16" ry="14" />
  </svg>
);
