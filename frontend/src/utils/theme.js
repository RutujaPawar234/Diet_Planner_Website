/**
 * Colour palette for JavaScript-rendered graphics (Recharts, SVG).
 * Keep in sync with the CSS tokens in styles/base.css.
 */
export const PALETTE = {
  coral: '#FF6B4A',
  coralSoft: '#FFD3C7',
  yellow: '#FFC857',
  yellowStrong: '#F5B638',
  purple: '#8B5CF6',
  purpleSoft: '#E2D6FE',
  pink: '#F472B6',
  blue: '#3B8CF6',
};

/** Shared styling for chart axes, grid lines and hover cursors. */
export const CHART = {
  grid: '#F1E7DD',
  axis: '#8A8F98',
  cursor: 'rgba(255, 107, 74, 0.06)',
  tick: { fontSize: 12, fill: '#8A8F98' },
};

/** Series colours in the order charts should use them. */
export const SERIES = [PALETTE.coral, PALETTE.purple, PALETTE.yellowStrong, PALETTE.pink, PALETTE.blue];

/** Accent colour for each meal slot (matches the --slot-* CSS tokens). */
export const SLOT_COLORS = {
  breakfast: '#F59E0B',
  lunch: PALETTE.coral,
  snacks: PALETTE.pink,
  dinner: PALETTE.purple,
};
