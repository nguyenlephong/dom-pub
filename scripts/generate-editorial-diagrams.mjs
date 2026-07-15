#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_ROOT = path.join(ROOT, 'sources', 'editorial-diagrams')
const ICDN_ROOT = path.join(ROOT, 'icdn')

const palettes = {
  ocean: { bg: '#eef7f8', ink: '#15323b', muted: '#5c7480', accent: '#0d7a86', accent2: '#e59b45', soft: '#d6eaed', danger: '#c84f55' },
  indigo: { bg: '#f3f1fa', ink: '#26233f', muted: '#6e6986', accent: '#5d55b8', accent2: '#d48a47', soft: '#e3dff4', danger: '#c34d67' },
  forest: { bg: '#f1f6ef', ink: '#24382b', muted: '#6a7b6f', accent: '#397a54', accent2: '#cf8b3d', soft: '#dcebdd', danger: '#ba5148' },
  slate: { bg: '#f3f5f7', ink: '#1f2d39', muted: '#687987', accent: '#3b6f9a', accent2: '#df9b4d', soft: '#dde8f0', danger: '#c65353' },
  plum: { bg: '#f8f1f5', ink: '#402839', muted: '#826d7b', accent: '#9b4f75', accent2: '#d89a49', soft: '#eedce6', danger: '#b94b59' },
  sand: { bg: '#f8f3e9', ink: '#3d3428', muted: '#7e7365', accent: '#2d7b72', accent2: '#c77b3d', soft: '#eee2cc', danger: '#b84e46' },
}

export const specs = [
  { path: 'blogs/event-sourcing-beginners-guide/append-only-event-stream', size: [1600, 900], kind: 'timeline', palette: 'ocean', title: 'Events are the record', subtitle: 'Current state is derived, not overwritten', labels: ['OrderPlaced', 'PaymentConfirmed', 'Packed', 'Shipped'] },
  { path: 'blogs/event-sourcing-beginners-guide/rebuildable-read-model', size: [1440, 960], kind: 'flow', palette: 'indigo', title: 'Projection is disposable', subtitle: 'The event stream can rebuild a read model', labels: ['Event stream', 'Projector', 'Read model'], badges: ['append-only', 'rebuild'] },
  { path: 'blogs/event-sourcing-beginners-guide/safe-projection-replay', size: [1440, 960], kind: 'comparison', palette: 'forest', title: 'Replay, not rewrite', subtitle: 'Rebuild projections without repeating side effects', labels: ['Events', 'Projection', 'Side effect locked'], badges: ['before', 'after'] },

  { path: 'blogs/fine-tuning-vs-prompting-vs-rag/prompt-rag-finetune-decision-map', size: [1600, 900], kind: 'comparison', palette: 'sand', title: 'Start with the gap', subtitle: 'Choose the smallest intervention that fixes it', labels: ['Prompting', 'RAG', 'Fine-tuning'], badges: ['instructions', 'fresh knowledge', 'stable behavior'] },
  { path: 'blogs/fine-tuning-vs-prompting-vs-rag/prompt-contract-four-parts', size: [1440, 960], kind: 'states', palette: 'ocean', title: 'A useful prompt is a contract', subtitle: 'Four parts make the request testable', labels: ['Task', 'Context', 'Constraints', 'Output'] },
  { path: 'blogs/fine-tuning-vs-prompting-vs-rag/rag-source-to-answer', size: [1440, 960], kind: 'flow', palette: 'plum', title: 'Ground the answer', subtitle: 'RAG adds current evidence; it does not replace the model', labels: ['Sources', 'Chunks + index', 'Retrieve', 'Answer'], badges: ['source links'] },

  { path: 'blogs/service-mesh-do-you-need-it/request-path-failure-map', size: [1600, 900], kind: 'network', palette: 'slate', title: 'Map the failure first', subtitle: 'Retries and timeouts matter before the mesh does', labels: ['API', 'Order', 'Payment', 'Inventory', 'Notify'], badges: ['retry', 'timeout'] },
  { path: 'blogs/service-mesh-do-you-need-it/telemetry-evidence-board', size: [1440, 960], kind: 'dashboard', palette: 'ocean', title: 'Repeated signals, not fashion', subtitle: 'Latency, errors and missing traces make the case', labels: ['p95 latency', 'error rate', 'trace gaps', 'mTLS coverage'], values: ['840 ms', '2.8%', '17%', '42%'] },
  { path: 'blogs/service-mesh-do-you-need-it/bounded-mesh-pilot', size: [1440, 960], kind: 'network', palette: 'indigo', title: 'Pilot one small slice', subtitle: 'Contain blast radius and keep a rollback path', labels: ['Gateway', 'Order', 'Payment', 'Catalog', 'Profile'], badges: ['pilot', 'rollback'] },

  { path: 'blogs/trunk-based-development/small-merges-to-trunk', size: [1600, 900], kind: 'branches', palette: 'forest', title: 'Merge while the change is small', subtitle: 'Short branches keep integration debt visible', labels: ['small merge', 'small merge', 'small merge', 'trunk'] },
  { path: 'blogs/trunk-based-development/deploy-release-flag-rollout', size: [1440, 960], kind: 'timeline', palette: 'plum', title: 'Deploy is not release', subtitle: 'A feature flag separates code shipping from exposure', labels: ['0%', '10%', '50%', '100%'] },
  { path: 'blogs/trunk-based-development/ci-fast-feedback-loop', size: [1440, 960], kind: 'loop', palette: 'slate', title: 'Keep CI feedback short', subtitle: 'A red build stops the next merge', labels: ['Merge', 'Build', 'Test', 'Signal', 'Fix'] },

  { path: 'blogs/vector-databases-explained/semantic-vector-space', size: [1600, 900], kind: 'scatter', palette: 'indigo', title: 'Near in meaning, not spelling', subtitle: 'Embeddings place similar ideas close together', labels: ['query', 'cluster A', 'cluster B'] },
  { path: 'blogs/vector-databases-explained/chunks-with-source-metadata', size: [1440, 960], kind: 'flow', palette: 'sand', title: 'A chunk still needs its source', subtitle: 'Metadata keeps retrieval traceable', labels: ['Document', 'Chunks', 'Metadata', 'Source link'] },
  { path: 'blogs/vector-databases-explained/retrieval-quality-check', size: [1440, 960], kind: 'dashboard', palette: 'forest', title: 'Evaluate retrieval itself', subtitle: 'Top-k is useful only when the right evidence returns', labels: ['relevance', 'coverage', 'latency', 'source match'], values: ['0.86', '82%', '74 ms', '3 / 4'] },

  { path: 'blogs/overcoming-analysis-paralysis/reversible-choice-matrix-v2', size: [1440, 960], kind: 'matrix', palette: 'sand', title: 'Match thought to reversibility', subtitle: 'Run a small test when the door can reopen', labels: ['easy to reverse', 'hard to reverse', 'low cost', 'high cost'], badges: ['small pilot'] },
  { path: 'notes/work-messages-aggressive-bias/tone-without-voice', size: [1600, 900], kind: 'tone', palette: 'plum', title: 'The message has no voice', subtitle: 'The reader supplies tone from context and stress', labels: ['same words', 'calm reading', 'sharp reading'] },

  { path: 'blogs/architecture-decisions-for-future-teammates/decision-record-context-chain', size: [1600, 900], kind: 'flow', palette: 'ocean', title: 'Leave the why behind', subtitle: 'A future teammate needs the decision chain', labels: ['Context', 'Decision', 'Consequences', 'Revisit trigger'] },
  { path: 'blogs/cost-of-trusting-a-fluent-ai-answer/claim-to-decision-verification', size: [1600, 900], kind: 'flow', palette: 'plum', title: 'Fluency is not proof', subtitle: 'Move from a claim to a decision through checks', labels: ['Claim', 'Source', 'Test', 'Decision'] },
  { path: 'blogs/making-interfaces-honest-about-system-limits/honest-ui-system-states', size: [1600, 900], kind: 'states', palette: 'slate', title: 'Show the system you actually have', subtitle: 'Slow, partial and failed are real product states', labels: ['Ready', 'Slow', 'Partial', 'Failed'] },
  { path: 'blogs/reducing-hallucinations-in-llms/grounded-answer-evidence-pipeline', size: [1600, 900], kind: 'flow', palette: 'forest', title: 'Make evidence travel with the answer', subtitle: 'Sources, retrieval and verification each close a gap', labels: ['Trusted source', 'Retrieve', 'Draft', 'Verify'] },
  { path: 'blogs/refactoring-toward-a-clearer-core/clear-core-before-after', size: [1600, 900], kind: 'comparison', palette: 'indigo', title: 'Pull the core into view', subtitle: 'Refactor dependency direction, not just filenames', labels: ['Tangled edges', 'Clear core', 'Adapters outside'], badges: ['before', 'after'] },
  { path: 'blogs/okrs-for-engineering-teams/output-to-outcome-map', size: [1600, 900], kind: 'flow', palette: 'sand', title: 'Do not confuse output with outcome', subtitle: 'Work matters when user or system behavior changes', labels: ['Activity', 'Output', 'Behavior', 'Outcome'] },
  { path: 'blogs/the-culture-hidden-in-small-reviews/kind-review-comment-anatomy', size: [1600, 900], kind: 'states', palette: 'ocean', title: 'A small review carries culture', subtitle: 'Observation, impact and a real question', labels: ['Observation', 'Impact', 'Question', 'Next step'] },

  { path: 'notes/tu-duy-he-thong-trong-cong-viec-steven-schuster/causal-loop-real-bottleneck', size: [1600, 900], kind: 'loop', palette: 'forest', title: 'Follow the loop', subtitle: 'The visible symptom is rarely the whole system', labels: ['Demand', 'Queue', 'Delay', 'Rework', 'Capacity'] },
  { path: 'notes/tu-duy-he-thong-trong-cong-viec-steven-schuster/delayed-feedback-buffer', size: [1600, 900], kind: 'timeline', palette: 'slate', title: 'Feedback can arrive late', subtitle: 'A quiet buffer may be filling under the surface', labels: ['Change', 'Hidden buffer', 'Delay', 'Visible effect'] },
  { path: 'notes/tu-duy-he-thong-trong-cong-viec-steven-schuster/small-leverage-feedback-loop-v2', size: [1440, 960], kind: 'loop', palette: 'sand', title: 'Change the reinforcing loop', subtitle: 'A small leverage point can alter later behavior', labels: ['Rule', 'Behavior', 'Signal', 'Adjustment'] },

  { path: 'blogs/the-outbox-pattern/commit-event-gap', size: [1600, 900], kind: 'flow', palette: 'plum', title: 'The dangerous gap', subtitle: 'A database commit can succeed while the event disappears', labels: ['Write order', 'DB commit', 'Publish event', 'Lost'], badges: ['failure window'] },
  { path: 'blogs/the-outbox-pattern/transactional-outbox-flow', size: [1440, 960], kind: 'flow', palette: 'ocean', title: 'Write data and intent together', subtitle: 'A relay publishes after the transaction is durable', labels: ['Transaction', 'Order + outbox', 'Relay', 'Broker'] },
  { path: 'blogs/the-outbox-pattern/outbox-operational-signals', size: [1440, 960], kind: 'dashboard', palette: 'slate', title: 'Operate the outbox', subtitle: 'Backlog age and retries reveal stuck delivery', labels: ['backlog', 'oldest age', 'retry rate', 'dead letters'], values: ['128', '42 s', '1.6%', '3'] },
]

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function arrow(x1, y1, x2, y2, color, dashed = false, width = 5) {
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${dashed ? 'stroke-dasharray="14 12"' : ''} marker-end="url(#arrow)"/>`
}

function card(x, y, w, h, p, title, body = '', accent = p.accent, extra = '') {
  return `<g>${extra}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="#fff" stroke="${p.soft}" stroke-width="3" filter="url(#shadow)"/><rect x="${x}" y="${y}" width="12" height="${h}" rx="6" fill="${accent}"/><text x="${x + 38}" y="${y + 58}" class="cardTitle">${esc(title)}</text>${body ? `<text x="${x + 38}" y="${y + 98}" class="cardBody">${esc(body)}</text>` : ''}</g>`
}

function renderTimeline(spec, p, w, h) {
  const labels = spec.labels
  const left = 150
  const right = w - 150
  const y = Math.round(h * 0.58)
  const step = (right - left) / (labels.length - 1)
  let out = `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${p.soft}" stroke-width="18" stroke-linecap="round"/>`
  labels.forEach((label, index) => {
    const x = left + index * step
    const accent = index === labels.length - 1 ? p.accent2 : p.accent
    out += `<circle cx="${x}" cy="${y}" r="31" fill="${accent}" stroke="#fff" stroke-width="8" filter="url(#shadow)"/><text x="${x}" y="${y - 66}" text-anchor="middle" class="nodeTitle">${esc(label)}</text><text x="${x}" y="${y + 92}" text-anchor="middle" class="tiny">0${index + 1}</text>`
  })
  return out
}

function renderFlow(spec, p, w, h) {
  const labels = spec.labels
  const gap = 38
  const cardW = Math.min(300, (w - 180 - gap * (labels.length - 1)) / labels.length)
  const start = (w - (cardW * labels.length + gap * (labels.length - 1))) / 2
  const y = Math.round(h * 0.48)
  let out = ''
  labels.forEach((label, index) => {
    const x = start + index * (cardW + gap)
    if (index) out += arrow(x - gap + 7, y + 75, x - 8, y + 75, p.muted, index === labels.length - 1 && label.toLowerCase().includes('lost'))
    const danger = label.toLowerCase().includes('lost') || label.toLowerCase().includes('failed')
    out += card(x, y, cardW, 150, p, label, spec.badges?.[index] || '', danger ? p.danger : index === labels.length - 1 ? p.accent2 : p.accent)
  })
  return out
}

function renderComparison(spec, p, w, h) {
  const labels = spec.labels
  const panelW = (w - 220 - 42 * (labels.length - 1)) / labels.length
  let out = ''
  labels.forEach((label, index) => {
    const x = 110 + index * (panelW + 42)
    const y = Math.round(h * 0.37)
    const accent = index === labels.length - 1 ? p.accent2 : p.accent
    out += `<rect x="${x}" y="${y}" width="${panelW}" height="${Math.round(h * 0.38)}" rx="34" fill="#fff" stroke="${p.soft}" stroke-width="3" filter="url(#shadow)"/><circle cx="${x + 58}" cy="${y + 62}" r="23" fill="${accent}"/><text x="${x + 98}" y="${y + 72}" class="nodeTitle">${esc(label)}</text><path d="M ${x + 48} ${y + 155} C ${x + panelW * .35} ${y + 105}, ${x + panelW * .58} ${y + 230}, ${x + panelW - 45} ${y + 165}" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/><line x1="${x + 52}" y1="${y + 245}" x2="${x + panelW - 52}" y2="${y + 245}" stroke="${p.soft}" stroke-width="12" stroke-linecap="round"/><line x1="${x + 52}" y1="${y + 290}" x2="${x + panelW * .72}" y2="${y + 290}" stroke="${p.soft}" stroke-width="12" stroke-linecap="round"/>${spec.badges?.[index] ? `<text x="${x + 48}" y="${y + Math.round(h * .38) - 36}" class="tiny">${esc(spec.badges[index])}</text>` : ''}`
  })
  return out
}

function renderStates(spec, p, w, h) {
  const positions = [[0.12, 0.40], [0.53, 0.40], [0.12, 0.66], [0.53, 0.66]]
  const cardW = w * .35
  const cardH = h * .18
  let out = ''
  spec.labels.forEach((label, index) => {
    const [px, py] = positions[index]
    const x = w * px
    const y = h * py
    const accent = [p.accent, p.accent2, p.muted, p.danger][index]
    out += card(x, y, cardW, cardH, p, label, `0${index + 1}`, accent, `<circle cx="${x + cardW - 54}" cy="${y + 55}" r="18" fill="${accent}" opacity=".9"/>`)
  })
  return out
}

function renderNetwork(spec, p, w, h) {
  const points = [[.18,.55],[.38,.40],[.58,.58],[.76,.36],[.84,.68]]
  const labels = spec.labels
  let out = ''
  const links = [[0,1,false],[1,2,false],[2,3,true],[2,4,false],[4,1,true]]
  links.forEach(([a,b,dashed], index) => {
    const [ax,ay]=points[a], [bx,by]=points[b]
    out += arrow(ax*w, ay*h, bx*w, by*h, dashed ? p.danger : index === 4 ? p.accent2 : p.muted, dashed, 6)
  })
  labels.forEach((label,index)=>{
    const [px,py]=points[index]
    const selected = spec.title.includes('Pilot') && [1,2].includes(index)
    out += `<g filter="url(#shadow)"><rect x="${px*w-95}" y="${py*h-48}" width="190" height="96" rx="26" fill="${selected ? p.soft : '#fff'}" stroke="${selected ? p.accent : p.soft}" stroke-width="4"/><circle cx="${px*w-55}" cy="${py*h}" r="15" fill="${selected ? p.accent2 : p.accent}"/><text x="${px*w-27}" y="${py*h+9}" class="nodeTitle">${esc(label)}</text></g>`
  })
  if (spec.badges?.length) out += `<text x="${w*.14}" y="${h*.79}" class="pill">${esc(spec.badges.join('  •  '))}</text>`
  return out
}

function renderDashboard(spec, p, w, h) {
  const cardW = (w - 220 - 36) / 2
  const cardH = h * .19
  let out = ''
  spec.labels.forEach((label,index)=>{
    const col=index%2,row=Math.floor(index/2)
    const x=110+col*(cardW+36),y=h*.37+row*(cardH+34)
    const value=spec.values?.[index] || `${72 + index * 7}%`
    out += card(x,y,cardW,cardH,p,label,value,index===3?p.accent2:p.accent,`<path d="M ${x+cardW*.58} ${y+cardH*.66} C ${x+cardW*.68} ${y+cardH*.35}, ${x+cardW*.78} ${y+cardH*.78}, ${x+cardW*.91} ${y+cardH*.42}" fill="none" stroke="${index===2?p.danger:p.accent}" stroke-width="8" stroke-linecap="round"/>`)
  })
  return out
}

function renderBranches(spec, p, w, h) {
  const trunkY = h * .67
  let out = `<line x1="${w*.12}" y1="${trunkY}" x2="${w*.88}" y2="${trunkY}" stroke="${p.accent}" stroke-width="18" stroke-linecap="round"/>`
  ;[.22,.42,.62].forEach((x,index)=>{
    out += `<path d="M ${w*x} ${trunkY} C ${w*(x-.04)} ${h*.54}, ${w*(x-.08)} ${h*.47}, ${w*(x-.12)} ${h*.42}" fill="none" stroke="${index===1?p.accent2:p.muted}" stroke-width="10" stroke-linecap="round"/><circle cx="${w*(x-.12)}" cy="${h*.42}" r="18" fill="${index===1?p.accent2:p.accent}"/><text x="${w*(x-.12)}" y="${h*.35}" text-anchor="middle" class="tiny">${esc(spec.labels[index])}</text>`
  })
  out += `<text x="${w*.82}" y="${trunkY-44}" class="nodeTitle">${esc(spec.labels.at(-1))}</text>`
  return out
}

function renderLoop(spec,p,w,h){
  const cx=w*.5,cy=h*.58,rx=w*.27,ry=h*.22
  let out=''
  spec.labels.forEach((label,index)=>{
    const a=-Math.PI/2+index*(Math.PI*2/spec.labels.length)
    const b=-Math.PI/2+((index+1)%spec.labels.length)*(Math.PI*2/spec.labels.length)
    const x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry
    const nx=cx+Math.cos(b)*rx,ny=cy+Math.sin(b)*ry
    out+=arrow(x,y,nx,ny,index===spec.labels.length-1?p.accent2:p.muted,false,6)
    out+=`<g filter="url(#shadow)"><circle cx="${x}" cy="${y}" r="66" fill="#fff" stroke="${index===0?p.accent2:p.soft}" stroke-width="4"/><text x="${x}" y="${y+7}" text-anchor="middle" class="nodeTitle">${esc(label)}</text></g>`
  })
  out+=`<circle cx="${cx}" cy="${cy}" r="66" fill="${p.soft}"/><path d="M ${cx-22} ${cy+5} L ${cx-3} ${cy+24} L ${cx+31} ${cy-26}" fill="none" stroke="${p.accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`
  return out
}

function renderScatter(spec,p,w,h){
  const groups=[{cx:.32,cy:.56,c:p.accent},{cx:.65,cy:.48,c:p.accent2},{cx:.7,cy:.7,c:p.muted}]
  let out=`<rect x="${w*.12}" y="${h*.34}" width="${w*.76}" height="${h*.48}" rx="34" fill="#fff" stroke="${p.soft}" stroke-width="3" filter="url(#shadow)"/>`
  groups.forEach((g,gi)=>{for(let i=0;i<12;i++){const angle=i*2.399+gi;const radius=18+i*8;const x=w*g.cx+Math.cos(angle)*radius;const y=h*g.cy+Math.sin(angle)*radius*.65;out+=`<circle cx="${x}" cy="${y}" r="${8+(i%3)*2}" fill="${g.c}" opacity="${.45+(i%4)*.12}"/>`}})
  out+=`<circle cx="${w*.48}" cy="${h*.52}" r="21" fill="#fff" stroke="${p.danger}" stroke-width="8"/><line x1="${w*.48}" y1="${h*.52}" x2="${w*.37}" y2="${h*.57}" stroke="${p.danger}" stroke-width="5" stroke-dasharray="12 10"/><text x="${w*.48}" y="${h*.44}" text-anchor="middle" class="nodeTitle">${esc(spec.labels[0])}</text>`
  return out
}

function renderMatrix(spec,p,w,h){
  const x=w*.22,y=h*.34,mw=w*.61,mh=h*.49
  let out=`<rect x="${x}" y="${y}" width="${mw}" height="${mh}" rx="34" fill="#fff" stroke="${p.soft}" stroke-width="3" filter="url(#shadow)"/><rect x="${x}" y="${y+mh/2}" width="${mw/2}" height="${mh/2}" fill="${p.soft}" opacity=".85"/><line x1="${x+mw/2}" y1="${y}" x2="${x+mw/2}" y2="${y+mh}" stroke="${p.soft}" stroke-width="5"/><line x1="${x}" y1="${y+mh/2}" x2="${x+mw}" y2="${y+mh/2}" stroke="${p.soft}" stroke-width="5"/><circle cx="${x+mw*.24}" cy="${y+mh*.74}" r="34" fill="${p.accent2}"/><text x="${x+mw*.24}" y="${y+mh*.74+8}" text-anchor="middle" class="tiny white">pilot</text><text x="${x+mw*.25}" y="${y-28}" text-anchor="middle" class="tiny">${esc(spec.labels[0])}</text><text x="${x+mw*.75}" y="${y-28}" text-anchor="middle" class="tiny">${esc(spec.labels[1])}</text><text x="${x-38}" y="${y+mh*.28}" text-anchor="end" class="tiny">${esc(spec.labels[2])}</text><text x="${x-38}" y="${y+mh*.76}" text-anchor="end" class="tiny">${esc(spec.labels[3])}</text>`
  return out
}

function renderTone(spec,p,w,h){
  const cy=h*.59
  return `<rect x="${w*.37}" y="${cy-92}" width="${w*.26}" height="184" rx="48" fill="#fff" stroke="${p.soft}" stroke-width="4" filter="url(#shadow)"/><circle cx="${w*.42}" cy="${cy}" r="17" fill="${p.accent}"/><line x1="${w*.46}" y1="${cy-25}" x2="${w*.58}" y2="${cy-25}" stroke="${p.soft}" stroke-width="14" stroke-linecap="round"/><line x1="${w*.46}" y1="${cy+25}" x2="${w*.55}" y2="${cy+25}" stroke="${p.soft}" stroke-width="14" stroke-linecap="round"/>${arrow(w*.36,cy,w*.2,cy,p.accent,false,6)}${arrow(w*.64,cy,w*.8,cy,p.danger,false,6)}<circle cx="${w*.16}" cy="${cy}" r="72" fill="${p.soft}"/><path d="M ${w*.13} ${cy+10} Q ${w*.16} ${cy+32} ${w*.19} ${cy+10}" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"/><circle cx="${w*.84}" cy="${cy}" r="72" fill="#f4dddd"/><path d="M ${w*.81} ${cy+25} Q ${w*.84} ${cy-5} ${w*.87} ${cy+25}" fill="none" stroke="${p.danger}" stroke-width="8" stroke-linecap="round"/><text x="${w*.16}" y="${cy+125}" text-anchor="middle" class="nodeTitle">${esc(spec.labels[1])}</text><text x="${w*.84}" y="${cy+125}" text-anchor="middle" class="nodeTitle">${esc(spec.labels[2])}</text>`
}

const renderers = { timeline: renderTimeline, flow: renderFlow, comparison: renderComparison, states: renderStates, network: renderNetwork, dashboard: renderDashboard, branches: renderBranches, loop: renderLoop, scatter: renderScatter, matrix: renderMatrix, tone: renderTone }

function renderSvg(spec) {
  const [w, h] = spec.size
  const p = palettes[spec.palette]
  const body = renderers[spec.kind](spec, p, w, h)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(spec.title)}</title><desc id="desc">${esc(spec.subtitle)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="${p.soft}" stroke-width="1" opacity=".55"/></pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="${p.ink}" flood-opacity=".11"/></filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${p.muted}"/></marker>
    <style>
      .headline{font:700 ${Math.round(w/25)}px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.ink};letter-spacing:-1px}.subtitle{font:400 ${Math.round(w/58)}px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.muted}}.eyebrow{font:700 ${Math.round(w/100)}px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.accent};letter-spacing:3px}.cardTitle,.nodeTitle{font:700 ${Math.round(w/72)}px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.ink}}.cardBody{font:500 ${Math.round(w/95)}px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.muted}}.tiny,.pill{font:600 ${Math.round(w/100)}px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.muted};letter-spacing:.5px}.pill{fill:${p.accent}}.white{fill:white}
    </style>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/><rect width="${w}" height="${h}" fill="url(#grid)" opacity=".55"/>
  <circle cx="${w*.9}" cy="${h*.08}" r="${w*.12}" fill="${p.soft}" opacity=".55"/><circle cx="${w*.04}" cy="${h*.94}" r="${w*.09}" fill="${p.soft}" opacity=".38"/>
  <text x="${w*.075}" y="${h*.105}" class="eyebrow">EDITORIAL DIAGRAM</text>
  <text x="${w*.075}" y="${h*.205}" class="headline">${esc(spec.title)}</text>
  <text x="${w*.075}" y="${h*.265}" class="subtitle">${esc(spec.subtitle)}</text>
  ${body}
  </svg>`
}

async function generate(spec) {
  const svg = renderSvg(spec)
  const source = path.join(SOURCE_ROOT, `${spec.path}.svg`)
  const output = path.join(ICDN_ROOT, `${spec.path}.webp`)
  await mkdir(path.dirname(source), { recursive: true })
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(source, svg)
  await sharp(Buffer.from(svg)).webp({ quality: 88, effort: 5 }).toFile(output)
  return path.relative(ROOT, output)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const spec of specs) {
    console.log(await generate(spec))
  }

  console.log(`Generated ${specs.length} editorial diagrams.`)
}
