#!/usr/bin/env node

import { access, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { specs } from './generate-editorial-diagrams.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const generatedPhotos = [
  ['icdn/blogs/cross-functional-teams/user-journey-one-table.webp', 1600, 900],
  ['icdn/blogs/how-trust-grows-in-ordinary-follow-through/small-commitment-delivered.webp', 1600, 900],
  ['icdn/blogs/mentorship-vs-sponsorship/sponsor-speaks-in-calibration.webp', 1600, 900],
  ['icdn/blogs/navigating-office-politics/context-translation-shared-evidence.webp', 1440, 960],
  ['icdn/blogs/navigating-office-politics/hidden-incentives-tradeoffs.webp', 1600, 900],
  ['icdn/blogs/navigating-office-politics/prealignment-before-review.webp', 1440, 960],
  ['icdn/blogs/overcoming-analysis-paralysis/one-small-maker-test.webp', 1440, 960],
  ['icdn/blogs/overcoming-analysis-paralysis/research-circle-next-step.webp', 1600, 900],
  ['icdn/blogs/when-silence-in-a-team-becomes-a-signal/hesitation-before-speaking.webp', 1600, 900],
  ['icdn/notes/duong-tang-giu-vision-va-trao-quyen/direction-and-delegated-routes.webp', 1600, 900],
  ['icdn/notes/tao-niem-tin-khong-phai-tao-ao-giac/evidence-and-open-risk.webp', 1600, 900],
  ['icdn/notes/tao-niem-tin-khong-phai-tao-ao-giac/small-promise-kept.webp', 1440, 960],
  ['icdn/notes/tao-niem-tin-khong-phai-tao-ao-giac/tradeoffs-left-visible.webp', 1600, 900],
  ['icdn/notes/tao-thao-phap-tri-trong-van-phong/clear-rules-lighten-decisions.webp', 1600, 900],
  ['icdn/notes/ton-ngo-khong-nhan-tai-10x-va-vong-kim-co/talent-with-guardrails.webp', 1600, 900],
]

const diagramAssets = specs.map((spec) => [
  path.join('icdn', `${spec.path}.webp`),
  spec.size[0],
  spec.size[1],
])

let checked = 0
for (const [relative, expectedWidth, expectedHeight] of [
  ...diagramAssets,
  ...generatedPhotos,
]) {
  const file = path.join(ROOT, relative)
  await access(file)
  const metadata = await sharp(file).metadata()
  const info = await stat(file)

  if (metadata.format !== 'webp') {
    throw new Error(`${relative}: expected webp, got ${metadata.format}`)
  }
  if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
    throw new Error(
      `${relative}: expected ${expectedWidth}x${expectedHeight}, got ${metadata.width}x${metadata.height}`,
    )
  }
  if (info.size < 20_000) {
    throw new Error(`${relative}: suspiciously small output (${info.size} bytes)`)
  }
  checked += 1
}

for (const spec of specs) {
  await access(path.join(ROOT, 'sources', 'editorial-diagrams', `${spec.path}.svg`))
}

console.log(`Verified ${checked} editorial WebP assets and ${specs.length} SVG sources.`)
