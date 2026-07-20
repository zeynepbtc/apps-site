import re
f = "/home/claude/atlas_drive_may30.html"; h = open(f, encoding="utf-8").read()
mod = open("/home/claude/faz2/storage.js", encoding="utf-8").read()

NEW = ("""/* FAZ 2 · Storage — sürümlü + recovery-korumalı (bozuk JSON kana_state'i EZMEZ) */
""" + mod + """
const STORE = createStorage((typeof localStorage!=="undefined")?localStorage:{getItem:()=>null,setItem:()=>{}});
if(typeof window!=="undefined") window.STORE = STORE;
function load(){
  const _r = STORE.read(); Object.assign(state, _r.state);   // hydrate + migration + recovery
  const today=Math.floor(Date.now()/DAY);
  const last=state.lastActive||0;
  if(last && today-last===1) state.streak=(state.streak||0)+1;
  else if(last && today-last>1) state.streak=1;
  else if(!last) state.streak=state.streak||1;
  state.lastActive=today;
  // bootstrap: oturum alanları BİLİNÇLİ sıfırlanır (storage taşısa da)
  state.screen = (state.onboarding&&state.onboarding.completed) ? "home" : "onboarding";
  state.stack=[]; state.param=null; state._game=null; state._gamePick=null;
}
function save(){ return STORE.save(state); }""")

pat = re.compile(r'function load\(\)\{.*?function save\(\)\{ try\{ localStorage\.setItem\("kana_state",JSON\.stringify\(state\)\); \}catch\(e\)\{\} \}', re.S)
assert len(pat.findall(h)) == 1, "load/save block not unique: %d" % len(pat.findall(h))
h = pat.sub(lambda m: NEW, h, count=1)
open(f, "w", encoding="utf-8").write(h)
print("storage injected + load/save rewired")
