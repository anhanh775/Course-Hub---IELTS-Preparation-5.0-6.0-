/* Dữ liệu của trang unit nằm trong file unitN.html (window.UNIT); danh sách unit và link chung nằm trong config.js */
const PAGES={}, LINKS={}, ITEMS={}, WRITING={}, TRANS={}, KEYS={}, SAMPLES={};
(function(){const U=window.UNIT; if(!U) return; const n=U.n;
  LINKS[n]=U.links||{}; ITEMS[n]={practiceL:U.practiceL||[],practiceR:U.practiceR||[]};
  if(U.writing&&U.writing.length) WRITING[n]=U.writing; if(U.audio&&U.audio.length) TRANS[n]=U.audio; if(U.keys&&U.keys.length) KEYS[n]=U.keys; if(U.sample&&U.sample.length) SAMPLES[n]=U.sample;})();
// Mỗi mục: t = tên nút, u = link. Có thể thêm/bớt nút trong từng nhóm.
const L = (t)=>({t,u:""});
const SECTIONS = [
  {k:"coursebook",t:"Coursebook",d:"Bài tập luyện skill làm trên lớp.",items:[L("Mở coursebook (PDF)")]},
  {k:"vocab",t:"Từ vựng & bài tập ở nhà",d:"Học trước khi đến lớp.",items:[L("Danh sách và bài tập từ vựng (PDF)"),L("Danh sách và bài tập từ vựng (làm online)")]},
  {k:"practice",t:"Luyện thêm Reading & Listening",d:"Bài tập làm thêm ngoài giờ học.",groups:true,items:[]},
  {k:"audio",t:"Transcripts & Audio",d:"Dùng để đối chiếu sau khi làm bài Listening.",items:[],player:true},
  {k:"keys",t:"Đáp án",d:"Chỉ xem sau khi đã làm xong bài.",items:[],keys:true},
  {k:"speaking",t:"Nộp bài Speaking",d:"Ghi âm và tải file lên thư mục này.",items:[L("Mở thư mục nộp bài")],mark:true},
  {k:"writing",t:"Writing trong tuần",d:"Bài làm của các bạn và bài đã sửa.",items:[L("Bài làm"),L("Bài sửa")]}
];
// ====== HẾT PHẦN CHỈNH SỬA ======

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const url = (n,k,i,d) => ((LINKS[n]||{})[k]||[])[i] || d || "";
const btn = (href,label) => href ? `<a class="btn" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>` : `<span class="btn off">${label} (sắp cập nhật)</span>`;

$("top").innerHTML = btn(CONFIG.classroom,"Google Classroom");

$("nav").innerHTML = `<button data-u="0"><b>Trang chủ</b><small>Tổng quan khóa học</small></button>` +
  UNITS.map(u=>`<button data-u="${u.n}"><b>Unit ${u.n}</b><small>${esc(u.name)}</small></button>`).join("");

function tags(u){
  const t=[];
  if(u.l) t.push(`<span class="tag"><b>Listening:</b> ${esc(u.l)}</span>`);
  if(u.r) t.push(`<span class="tag"><b>Reading:</b> ${esc(u.r)}</span>`);
  return t.length ? `<div class="tags">${t.join("")}</div>` : `<p class="sub">Dạng bài Listening và Reading sẽ được cập nhật.</p>`;
}
function renderHome(){
  $("main").innerHTML = `<div class="card"><h2>Chọn unit để vào học</h2><p class="sub">Mỗi unit có coursebook, từ vựng, bài luyện thêm, audio, đáp án, nơi nộp Speaking và bài Writing.</p>
  <div class="units">${UNITS.map(u=>`<button data-u="${u.n}"><b>Unit ${u.n}</b><br><span class="desc">${esc(u.name)}</span></button>`).join("")}</div></div>`;
}
const WCRIT=[["tr","Task Response"],["cc","Coherence &amp; Cohesion"],["lr","Lexical Resource"],["gra","Grammatical Range &amp; Accuracy"]];
const wov=s=>Math.round((s.tr+s.cc+s.lr+s.gra)/4*2)/2;
const wcut=s=>s.replace(/^(\.{3}|…)\s*/,"").replace(/\s*(\.{3}|…)$/,"");
function wsections(c){
  const ps=c.essay.map(t=>({t,m:[]})),extra=[];
  c.errors.forEach(err=>{
    const o=wcut(err.orig),f=wcut(err.fix);let hit=false;
    if(o)for(const p of ps){const s=p.t.indexOf(o);if(s<0)continue;const x=s+o.length;if(p.m.some(m=>s<m.x&&x>m.s))continue;p.m.push({s,x,f,err});hit=true;break;}
    if(!hit)extra.push(err);
  });
  ps.forEach((p,i)=>{
    p.m.sort((a,b)=>a.s-b.s);let pos=0,o="",k="";
    p.m.forEach(m=>{o+=esc(p.t.slice(pos,m.s))+"<mark>"+esc(p.t.slice(m.s,m.x))+"</mark>";k+=esc(p.t.slice(pos,m.s))+esc(m.f);pos=m.x});
    p.orig=o+esc(p.t.slice(pos));p.fixed=k+esc(p.t.slice(pos));
    p.label=i===0?"Introduction":(i===ps.length-1&&/^(In conclusion|At the end|All in all|To conclude)/i.test(p.t))?"Conclusion":"Body Paragraph "+i;
  });
  return {ps,extra};
}
const wnote=e=>`<li><b>“${esc(e.orig)}”</b>: ${esc(e.note)}.<div class="desc" style="margin:3px 0 0">Sửa thành: <span style="color:var(--ink)">${esc(e.fix)}</span></div></li>`;
const wsent=t=>t.split(/(?<=[.!?])\s+(?=[A-Z‘“(])/).map(x=>x.trim()).filter(Boolean);
document.addEventListener("click",e=>{const b=e.target.closest(".pb");if(!b)return;const w=b.closest(".wbody"),on=b.getAttribute("aria-expanded")!=="true";w.querySelectorAll(".pb").forEach(x=>x.setAttribute("aria-expanded","false"));w.querySelectorAll(".pc").forEach(p=>p.hidden=true);if(on){b.setAttribute("aria-expanded","true");const p=w.querySelector('.pc[data-i="'+b.dataset.i+'"]');p.hidden=false;p.scrollIntoView({block:"nearest",behavior:"smooth"});}});
function wcand(c){
  const {ps,extra}=wsections(c),s=c.scores,wc=c.essay.join(" ").split(/\s+/).length;
  return `<details class="wc"><summary>${esc(c.name)} <span class="band">Band ${wov(s).toFixed(1)}</span><span class="cr">${wc} từ</span></summary><div class="wbody">
  <div class="wl">Nhận xét theo tiêu chí (bấm vào ô để đọc)</div><div class="crt">${WCRIT.map(([k,l])=>`<button type="button" class="cb" aria-expanded="false" data-k="${k}" title="${l}">${k.toUpperCase()} <b>${s[k]}</b></button>`).join("")}</div>${WCRIT.map(([k,l])=>`<div class="cp" data-k="${k}" hidden><div class="ch"><b>${l}</b><span class="band">Band ${s[k]}</span></div><p class="cd">${esc(c.feedback[k].descriptor)}</p><ul class="cl">${wsent(c.feedback[k].text).map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}
  <div class="wl">Bài làm của học sinh (bấm vào từng đoạn để xem lỗi và bản sửa)</div><div class="pg4">${ps.map((p,i)=>`<button type="button" class="pb" aria-expanded="false" data-i="${i}"><span class="pt">${p.label}${p.m.length?` · ${p.m.length} lỗi`:""}</span><span class="px">${p.orig}</span></button>`+`<div class="pc" data-i="${i}" hidden><h4>${p.label} – lỗi và bản sửa</h4>${p.m.length?`<ol class="wn">${p.m.map(m=>wnote(m.err)).join("")}</ol><div class="rw"><span>Đoạn đã sửa</span><p>${p.fixed}</p></div>`:`<p class="desc" style="margin:0">Đoạn này không có lỗi được đánh dấu.</p>`}</div>`).join("")}</div>
  ${extra.length?`<h4>Ghi chú khác</h4><ol class="wn">${extra.map(wnote).join("")}</ol>`:""}
  <details class="key"><summary>Toàn bài đã sửa</summary><div class="rw" style="margin-top:10px"><p>${ps.map(p=>p.fixed).join("<br><br>")}</p></div></details></div></details>`;
}
function writingHtml(u){
  return WRITING[u.n].map((q,i)=>`<div class="wq"><div class="qp"><small>Đề ${i+1} · ${esc(q.short)}</small>${esc(q.topic)} <b>${esc(q.ask)}</b></div>${q.candidates.map(wcand).join("")}</div>`).join("");
}
document.addEventListener("click",e=>{const b=e.target.closest(".cb");if(!b)return;const w=b.closest(".wbody"),on=b.getAttribute("aria-expanded")!=="true";w.querySelectorAll(".cb").forEach(x=>x.setAttribute("aria-expanded","false"));w.querySelectorAll(".cp").forEach(p=>p.hidden=true);if(on){b.setAttribute("aria-expanded","true");w.querySelector('.cp[data-k="'+b.dataset.k+'"]').hidden=false;}});

/* ===== Sample Writing: bài mẫu có đánh dấu. Trong chuỗi t, phần {trong ngoặc nhọn} là mẫu câu (template). ===== */
const SWK={bg:"Câu dẫn",thesis:"Thesis",outline:"Outline",topic:"Topic sentence",idea1:"Idea 1",exp1:"Explain 1",ex1:"Example 1",idea2:"Idea 2",exp2:"Explain 2",ex2:"Example 2",idea3:"Idea 3",exp3:"Explain 3",ex3:"Example 3",res:"Mini-conclusion",sum:"Summary"};
function swSent(s){
  const parts=String(s.t).split(/(\{[^}]*\})/).filter(x=>x!=="").map(x=>x[0]==="{"?`<span class="tpl">${esc(x.slice(1,-1))}</span>`:esc(x));
  return `<span class="ss ss-${esc(s.k)}">${SWK[s.k]?`<i class="lb">${SWK[s.k]}</i>`:""}${parts.join("")}</span>`;
}
function swHtml(w){
  const used=[]; w.paras.forEach(p=>p.s.forEach(s=>{if(SWK[s.k]&&!used.includes(s.k))used.push(s.k)}));
  return `<div class="sw"><h4>${esc(w.type)}</h4>
    <div class="swq"><b>Question:</b> ${esc(w.question)}</div>
    <div class="swctl"><label><input type="checkbox" data-sw="fn" checked> Hiện nhãn và màu theo chức năng câu</label><label><input type="checkbox" data-sw="tpl" checked> Hiện mẫu câu (template)</label></div>
    <div class="swlg"><span class="lgt"><span class="tpl">Mẫu câu (template)</span></span>${used.map(k=>`<span class="ss ss-${k} lgi"><i class="lb">${SWK[k]}</i></span>`).join("")}</div>
    ${w.note?`<p class="desc">${esc(w.note)}</p>`:""}
    ${w.paras.map(p=>`<div class="swh">${esc(p.h)}</div><p class="swp">${p.s.map(swSent).join(" ")}</p>`).join("")}</div>`;
}
function sampleCard(u){
  const S=SAMPLES[u.n];
  return `<div class="card" id="sample"><h3>Sample Writing</h3><p class="desc">Bài viết mẫu có đánh dấu mẫu câu và các ý chính (Idea, Explanation, Example) để học theo cấu trúc.</p>${S?S.map(swHtml).join(""):`<p class="desc">Sắp cập nhật</p>`}</div>`;
}
document.addEventListener("change",e=>{const i=e.target.closest("input[data-sw]");if(i)i.closest(".sw").classList.toggle("no"+i.dataset.sw,!i.checked);});
function renderUnit(n){
  const u = UNITS[n-1];
  $("main").innerHTML = `<div class="card"><h2>Unit ${u.n}: ${esc(u.name)}</h2>${tags(u)}</div>` +
    SECTIONS.map(s=>`<div class="card${s.mark?" mark":""}"><h3>${s.t}</h3><p class="desc">${s.d}</p>
      ${s.groups?groupsHtml(u):""}${s.k==="writing"&&WRITING[u.n]?writingHtml(u):""}${s.player?playersHtml(u):""}${s.keys?keysHtml(u):""}<div class="list">${(s.groups||(s.k==="writing"&&WRITING[u.n]))?"":((ITEMS[u.n]||{})[s.k]||s.items).map((it,i)=>{const h=url(u.n,s.k,i,it.u);return `<span class="item">${itemHtml(it,h)}</span>`}).join("")}</div></div>`).join("") + sampleCard(u);
}
let TEACHER=false, CUR=0;
function playersHtml(u){
  const T=TRANS[u.n]; if(!T) return `<p class="desc">Sắp cập nhật</p>`;
  return T.map(p=>`<div class="pl" data-id="${p.id}"><h4>${esc(p.title)}</h4>${p.drive?`<a class="btn" href="${esc(p.drive)}" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none">▶ Nghe audio trên Google Drive</a><audio hidden></audio>`:(p.audio?`<audio controls preload="metadata" src="${esc(p.audio)}" style="width:100%"></audio>`:`<p class="desc" style="margin:6px 0 0">Audio sẽ được cập nhật.</p><audio hidden></audio>`)}
  ${p.ev?`<button class="evb" data-ev>Hiện vị trí đáp án</button>`:""}${p.lines.length?`<div class="tr">${p.lines.map((l,i)=>`<p class="ln" data-i="${i}">${l[0]?`<b>${l[0]}</b>`:""}<span>${lt(l[1],p.ev,i)}</span></p>`).join("")}</div>`:`<p class="desc" style="margin:8px 0 0">Transcript sẽ được cập nhật.</p>`}
  ${TEACHER&&p.lines.length?`<div class="tt"><b>Chế độ canh thời gian</b><br>Nghe audio và bấm phím M (hoặc nút Đánh dấu) đúng lúc mỗi câu bắt đầu. Dòng viền nét đứt là dòng sẽ được đánh dấu tiếp theo.
  <div class="top" style="margin-top:10px"><button class="btn" data-a="mark">Đánh dấu (M)</button><button class="btn" data-a="undo">Hoàn tác</button><button class="btn" data-a="reset">Làm lại</button><button class="btn" data-a="out">Hiện mốc để gửi</button></div><textarea readonly></textarea></div>`:""}</div>`).join("");
}
function initPlayers(n){
  (window._iv||[]).forEach(clearInterval); window._iv=[];
  const T=TRANS[n]||[];
  if(!window._kd){window._kd=1;document.addEventListener("keydown",e=>{if(TEACHER&&e.key.toLowerCase()==="m"&&!/TEXTAREA|INPUT/.test(e.target.tagName)&&window._cur){e.preventDefault();window._cur.mark();}});}
  document.querySelectorAll(".pl").forEach(box=>{
    const p=T.find(x=>x.id===box.dataset.id), a=box.querySelector("audio"), tr=box.querySelector(".tr")||document.createElement("div"), els=[...box.querySelectorAll(".ln")];
    let ts=(!TEACHER&&p.times)?p.times.slice():[], act=-2;
    const hl=(force)=>{
      const t=a.currentTime; let k=-1;
      for(let i=0;i<ts.length;i++){ if(ts[i]<=t) k=i; else break; }
      if(k!==act||force){
        act=k; els.forEach((e,i)=>{e.classList.toggle("on",i===k);e.classList.toggle("next",TEACHER&&i===ts.length);});
        if(k>=0&&!a.paused) tr.scrollTo({top:els[k].offsetTop-tr.clientHeight/3,behavior:"smooth"});
      }
      tr.classList.toggle("synced",ts.length>0);
    };
    window._iv.push(setInterval(hl,150));
    els.forEach((e,i)=>e.addEventListener("click",()=>{ if(ts[i]!=null){a.currentTime=ts[i];a.play();} }));
    a.addEventListener("play",()=>{window._cur=ctl;});
    const ctl={mark(){ if(ts.length<els.length){ts.push(+a.currentTime.toFixed(2));hl(true);} }};
    box.querySelectorAll("[data-a]").forEach(b=>b.addEventListener("click",()=>{
      window._cur=ctl; const x=b.dataset.a;
      if(x==="mark") ctl.mark();
      if(x==="undo"){ts.pop();hl(true);}
      if(x==="reset"){ts=[];hl(true);}
      if(x==="out"){const o=box.querySelector("textarea");o.value=JSON.stringify({id:p.id,times:ts});o.select();}
    }));
    const eb=box.querySelector("[data-ev]");
    if(eb) eb.addEventListener("click",()=>{const on=tr.classList.toggle("showev");eb.textContent=on?"Ẩn vị trí đáp án":"Hiện vị trí đáp án";});
    hl(true);
  });
}
function keysHtml(u){
  const K=KEYS[u.n]; if(!K) return `<p class="desc">Sắp cập nhật</p>`;
  return K.map(k=>`<details class="key"><summary>${esc(k.t)}</summary>${k.note?`<p class="desc" style="margin:8px 0 0">${esc(k.note)}</p>`:""}<ol${k.s?` start="${k.s}"`:""} class="${k.a.some(x=>x.e)?"one ":""}${k.a.some(x=>x.q)?"lbl":""}">${k.a.map(x=>`<li>${x.q?`<span class="qn2">${esc(x.q)}</span>`:""}<b>${esc(x.m)}</b>${x.alt.length?` <span class="alt">/ ${esc(x.alt.join(" / "))}</span>`:""}${x.e?`<div class="alt ev2">${esc(x.e)}</div>`:""}</li>`).join("")}</ol></details>`).join("");
}
function lt(text,ev,i){
  const m=(ev||[]).filter(e=>e[0]===i).map(e=>({s:text.indexOf(e[1]),l:e[1].length,q:e[2]})).filter(x=>x.s>=0).sort((a,b)=>a.s-b.s);
  let o="",p=0; m.forEach(x=>{o+=esc(text.slice(p,x.s))+`<mark class="ev">${esc(text.substr(x.s,x.l))}<sup>Q${x.q}</sup></mark>`;p=x.s+x.l});
  return o+esc(text.slice(p));
}
function itemHtml(it,h){
  if(!h) return `<span>${it.t}: sắp cập nhật</span>`;
  if(/^Audio/.test(it.t)) return `<div class="aud"><b>${it.t}</b><audio controls preload="none" src="${esc(h)}"></audio></div>`;
  if(h.indexOf("/_blob/")===0) return `<a href="${esc(h)}" data-pdf="${esc(h)}" data-t="${esc(it.t)}">${it.t}</a>`;
  return `<a href="${esc(h)}" target="_blank" rel="noopener">${it.t}</a>`;
}
function openPdf(src,title){
  const old=$("viewer"); if(old) old.remove();
  const v=document.createElement("div"); v.className="card"; v.id="viewer";
  v.innerHTML=`<div class="vh"><b>${title}</b><span><button class="btn" id="dl">Tải về</button> <button class="btn" id="cl">Đóng</button></span></div><p class="desc" style="margin:8px 0 0">Cuộn xuống để xem hết tài liệu.</p>${PAGES[src]?PAGES[src].map(p=>`<img class="pg" loading="lazy" alt="${title}" src="${p}">`).join(""):`<iframe title="${title}" src="${src}"></iframe>`}`;
  $("main").prepend(v); v.scrollIntoView({block:"start"});
  $("cl").onclick=()=>v.remove();
  $("dl").onclick=()=>window.open(src,"_blank");
}
document.addEventListener("click",e=>{if(e.target.id==="tm"){TEACHER=!TEACHER;e.target.textContent=TEACHER?"Tắt chế độ canh thời gian":"Chế độ canh thời gian (giáo viên)";show(CUR);return;} const a=e.target.closest("a[data-pdf]"); if(a){e.preventDefault(); openPdf(a.dataset.pdf,a.dataset.t);}});
function groupsHtml(u){
  return [["Listening","practiceL"],["Reading","practiceR"]].map(([name,k])=>{
    const its=(ITEMS[u.n]||{})[k]||[];
    const rows=its.length?its.map((it,i)=>{const h=url(u.n,k,i,it.u),t=it.t.replace(/^(Listening|Reading):\s*/,"");
      return `<li>${h?`<a href="${esc(h)}" target="_blank" rel="noopener">${t}</a>`:`<span>${t}: sắp cập nhật</span>`}</li>`}).join(""):`<li><span>Sắp cập nhật</span></li>`;
    return `<h4>${name}</h4><ul class="plain">${rows}</ul>`;
  }).join("");
}
function show(n){
  n = Number(n)||0;
  document.querySelectorAll("#nav button").forEach(b=>b.setAttribute("aria-current", String(Number(b.dataset.u)===n)));
  CUR=n; if(n){renderUnit(n);initPlayers(n);} else renderHome();
  window.scrollTo({top:0});
}
document.addEventListener("click",e=>{const b=e.target.closest("button[data-u]"); if(b){const n=Number(b.dataset.u)||0; if(n!==CUR) location.href=n?"unit"+n+".html":"index.html";}});
show(window.UNIT?window.UNIT.n:0);
if(/[?&]gv\b/.test(location.search))document.getElementById("footTm").hidden=false;
