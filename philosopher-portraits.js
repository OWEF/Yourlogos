// Tiny original pixel portraits. No hotlinked photography or external image rights.
const BASE='<rect x="0" y="0" width="16" height="16" fill="#29231f"/><rect x="1" y="1" width="14" height="14" fill="#3b3027"/><rect x="2" y="2" width="12" height="12" fill="#4b392c"/><rect x="3" y="13" width="10" height="3" fill="#23282b"/><rect x="5" y="11" width="6" height="3" fill="#ead3b7"/><rect x="4" y="5" width="8" height="7" fill="#d9b899"/><rect x="3" y="7" width="1" height="3" fill="#bd9277"/><rect x="12" y="7" width="1" height="3" fill="#bd9277"/><rect x="5" y="8" width="2" height="1" fill="#241e1b"/><rect x="9" y="8" width="2" height="1" fill="#241e1b"/><rect x="8" y="10" width="1" height="1" fill="#ac806c"/><rect x="6" y="12" width="4" height="1" fill="#a87566"/>';
const H={
 kierkegaard:'<path fill="#392e28" d="M4 5V3h1V2h2V1h3v1h2v1h1v4h-1V5h-1V4h-1V3H9v2H7V4H6v2H4z"/><rect x="3" y="3" width="2" height="3" fill="#514033"/><rect x="11" y="2" width="2" height="4" fill="#514033"/><path fill="#f3e3d0" d="M4 12h2v1h1v2H5v-1H4zm6 1h2v2h-3v-2z"/>',
 nietzsche:'<path fill="#42342e" d="M4 6V3h2V2h6v2h1v2h-2V4H6v2z"/><path fill="#382b27" d="M4 10h3V9h2v1h3v2h-2v1H6v-1H4z"/><rect x="5" y="11" width="6" height="1" fill="#392d27"/>',
 marx:'<path fill="#43362f" d="M3 8V4h1V2h2V1h5v1h2v3h1v4h-2V6h-1V5H5v2H4v2z"/><path fill="#41342b" d="M4 10h2v1h4v-1h2v4h-2v2H6v-2H4z"/><rect x="6" y="11" width="4" height="1" fill="#c1a38b"/>',
 kant:'<path fill="#b9ad9a" d="M4 6V3h2V2h5v1h2v3h-2V4H5v2z"/><rect x="2" y="4" width="2" height="6" fill="#beb3a4"/><rect x="12" y="4" width="2" height="6" fill="#beb3a4"/><rect x="7" y="12" width="2" height="1" fill="#9e756a"/>',
 hegel:'<path fill="#615146" d="M4 6V3h2V2h6v2h1v3h-2V5H5v2H4z"/><rect x="3" y="6" width="2" height="4" fill="#6c5a4b"/><rect x="11" y="6" width="2" height="4" fill="#6c5a4b"/><rect x="6" y="12" width="4" height="1" fill="#765349"/>',
 arendt:'<path fill="#352b2a" d="M3 13V5h1V3h2V2h5v1h2v3h1v8h-2V8h-1V5H5v3H4v5z"/><path fill="none" stroke="#c6ae91" stroke-width=".65" d="M4.6 8h3m1 0h3m-4 0h1"/>',
 beauvoir:'<path fill="#2d2526" d="M3 6V4h1V2h8v2h1v2h-1V5H4v1z"/><path fill="#3d2a2d" d="M3 5h2v-2h2v3h2V3h2v3h2v2h-2V7H5v1H3z"/>',
 socrates:'<path fill="#b69b82" d="M5 4h6v1H5z"/><path fill="#7b6c5a" d="M4 10h2v1h4v-1h2v3h-1v2H5v-2H4z"/>',
 laozi:'<path fill="#c1b4a2" d="M4 5V3h2V2h6v2h1v2h-2V5H5v1H4z"/><path fill="#d6c6b1" d="M4 10h2v1h4v-1h2v4h-1v2H5v-2H4z"/>',
 camus:'<path fill="#39322c" d="M4 6V3h2V2h6v2h1v2h-2V4H7v1H5v2H4z"/><rect x="6" y="12" width="4" height="1" fill="#8d5c4b"/>',
 wittgenstein:'<path fill="#55463c" d="M5 5V3h2V2h4v2h1v2h-2V4H6v2H5z"/><rect x="5" y="12" width="6" height="1" fill="#b18d77"/>',
 generic:'<path fill="#5c4b3b" d="M4 6V4h1V3h2V2h4v1h1v1h1v3h-2V5H5v2H4z"/><rect x="6" y="12" width="4" height="1" fill="#a77c6c"/>'
};
function kindFor(author){
 const a=String(author||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 for(const [key,match] of [['kierkegaard',/kierkegaard/],['nietzsche',/nietzsche/],['marx',/marx/],['kant',/kant/],['hegel',/hegel/],['arendt',/arendt/],['beauvoir',/beauvoir/],['socrates',/socrates/],['laozi',/laozi|lao tzu/],['camus',/camus/],['wittgenstein',/wittgenstein/]]){
  if(match.test(a))return key;
 }
 return 'generic';
}
export function philosopherPortrait(author){
 const kind=kindFor(author);
 return '<svg class="yl-thinker-pixel" viewBox="0 0 16 16" shape-rendering="crispEdges" focusable="false" aria-hidden="true" data-thinker="'+kind+'">'+BASE+H[kind]+'<rect x="1" y="1" width="14" height="14" fill="none" stroke="#c7a678" stroke-width=".35"/></svg>';
}
