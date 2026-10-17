# Motion studio rules

## Render contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode,
  no state carried between frames. Seeded noise only (mulberry32), never Math.random.
- Render with `node render.mjs`, encode H.264 yuv420p, CRF 16.
- Defaults: YouTube Shorts and Instagram Reels, 9:16 at 1080x1920, 30 fps. The whole video,
  outro included, is under 45 seconds (Retention rule 8).
  Keep text and key content out of the top 250 px and bottom 400 px (platform UI covers them).

- A film lives in `films/<name>/`: `script.json`, `film.html`, `timeline.js` (cue times and SFX
  list built from `vo.json`, shared by picture and sound). Build order: `node vo.mjs <dir>`,
  `node score.mjs <dir>` (score, SFX, mix, beats.json), `node render.mjs <dir> --sheet`
  (contact sheets), `--at t1,t2` (in-between frames), then `node render.mjs <dir>` (out.mp4),
  then `node stitch.mjs <dir> outro/follow-<n>-<name>.mp4 "<name>"` (which outro: see Outro).
  `films/ai-ml-dl-genai/` is the reference film for the Kagaz drawing kit.

## Look
- Banned defaults: centered title on gradient, everything fading in,
  corner labels and frame borders, glow on UI chrome, generic particle bursts.
- One display face, one UI face. Colours come only from the brand palette, each with its job.
- Every 2 to 4 seconds something new must happen on screen.

## Brand: Kagaz, Sticker Pop look (every film, unless I say otherwise)
- Idea: the notebook of a smart senior, taken over by loud stickers. Punchy, poppy, playful,
  youthful. Audience: Hindi-speaking college students and people who learn AI. Platforms:
  YouTube Shorts, Instagram and Facebook Reels.
- I chose Sticker Pop on 2026-10-09 because #01 and #02, in the first cream-ink-red look,
  felt boring and flat to me. #01 stays in that first look. #02 was remade in Sticker Pop the
  same day (`films/machine-learns/` is the reference film for this look; its first version is
  kept there as `...-v1-first-look.mp4`).
- Tokens are in `brand/brand.json` (`color` and `pop`); the reference frame is option A in
  `brand/style-options.png`. Read the tokens from the file, do not retype hex values.
- Palette and jobs: cream paper with faint ruled lines and ink outlines stay. Blue = the mascot.
  Pink = caption highlight and the main button. Yellow = rays behind the hero of a scene.
  Mint and orange = supporting stickers and shapes. Red = marker: crosses, ticks, rings, the
  video number. Flat colour only: no gradients, no glow.
- Text stays readable: ink on cream, yellow or mint; cream on blue, pink or ink.
- Every sticker has a thick ink outline and a hard ink shadow.
- The mascot (a blue three-eyed monster, `mascot()` in `brand/kagaz.js`) is the channel's
  recurring character. It acts the idea out: it looks at things, eats, hops, waves.
- One hero weird image per video, and it must BE the concept, so that remembering the image
  means remembering the idea (for example: the monster eats photos and the pattern shows in
  its belly). Do not add weird things that are unrelated to the lesson, and do not make
  everything weird: the hero stands out only against calmer scenes.
- Fill the frame: big shapes may run off the edges; avoid large areas of empty paper.
- Display face Baloo 2 (700/800). UI face Mukta. Both cover Devanagari and Latin.
- Signature elements: marker highlight behind the key words of a headline (slight tilt);
  cream cards with ink outline, hard offset ink shadow and 1 to 3 degree tilt; red strike-through
  and hand-drawn circle for wrong and right; outlined pill topic tag (AI, CYBERSECURITY, CLOUD)
  at the top left of the safe area in every film.
- The header is one row, for the whole film, 160 px from the top (`canvas.headerTop` in
  `brand/brand.json`): the topic tag, then a red pill "EP 03" (the video number is the episode
  number), then the title in Mukta 700, 42 px, about 30 characters (a longer title shrinks to
  fit). This is the second picture in `brand/header-options.png`, which I confirmed with a
  screenshot on 2026-10-11; do not move or resize it. Captions start at 342 px. `header()` in
  `brand/kagaz.js` draws it from `number` and `title` in the film's `script.json`. Not on outros.
- When I pick from a row of pictures, I may count the pictures from the left, including the
  "current" one. If an option name and a picture position could differ, confirm which picture.
- This header is for #04 onward. #01 to #03 keep the earlier header (`#03` and a small title
  at 197 px); I asked not to recreate them. If one of them is ever re-rendered, it would get
  the new header, so ask me first.
- `VIDEOS.md` is the record of every video (number, title, track, level, outro used) and the
  beginner-to-pro roadmap. Read it before a new film: the number is the next one in it, never ask
  me for it. If I give no topic, pick the next one by the rules in that file and tell me which one
  and why before the intake questions. After a film is finished, add its row, tick the roadmap
  item and update the next number.
- Motion: squash and stretch on every landing, bounce, wobble, things that react to each other;
  marker strokes draw on, cards drop with tilt, stamps hit. Stickers keep moving a little
  while they are on screen.
- Sound: pencil and paper SFX, soft lo-fi beat.
- Tone: a senior explains to a junior. Conversational Hindi with English technical terms.

## Sound
- The score is synthesized in code unless a track is supplied.
- SFX: `score.mjs` plays a recorded sound from `sfx/<cue type>/` when that folder has files, a
  different one on each hit, and the synthesized effect otherwise (`--synth` forces synthesized).
  `sfx/SOURCES.md` lists every pack with its source and licence; only add sounds whose licence
  allows commercial use, and record them there. Claude cannot hear: I judge the sounds, and
  Claude removes the ones I reject from their folder.
- Recorded effects are the standard: I heard them on #02 on 2026-10-09 and liked them, but
  found them "a bit low", so their level was raised about 4 dB (`REC_GAIN` in `score.mjs`).
  I have not yet confirmed the raised level. #02 and all fourteen outros use them; #01 does not.
- Place hits on the measured beat grid (beats.json). Loudness -14 LUFS.

## Subject and script
- Films are short explainers of complex topics in AI, cybersecurity and cloud computing.
- Write every script in ASD-STE100 Simplified Technical English: one idea per sentence,
  20 words maximum, active voice, present tense, one word for one meaning,
  no idioms, no phrasal verbs, define each technical term the first time it appears.
- The first line is the hook. It follows Retention rules 1 to 3.

## Retention
I approved these eight rules on 2026-10-09, after video #01 got a 50% skip rate on Instagram.
Skip rate is the share of views that leave in the first 3 seconds. The rules are hypotheses from
one video, not proven causes: keep them until the numbers in `VIDEOS.md` say otherwise.

For a low skip rate:
1. Hook. The voice says the claim or the stake as one full sentence in the first 1.5 seconds,
   to the viewer ("तुम"). No list of terms, no greeting, no pause before it.
   (#01 read a list of four terms first; its claim started at 3.7 s.)
2. Frame 0. The whole promise is readable in large text that fills the frame. Everything the
   hook refers to is already on screen, and nothing covers the hook text.
3. Stake. The hook or the next line says why this matters to the viewer: an exam, an interview,
   a tool they use. True claims only, no invented statistics.

For high retention:
4. Open loop. Do not give the full answer early. Promise the payoff in the first 5 seconds and
   deliver it in the last section. (#01 gave the answer at second 6.)
5. Pace. A brisk voice, and gaps between lines that are short breaths. (#01 had no voice for
   about 27% of its 40 seconds.)
6. No empty beats. The first frame of every section shows something new, not only a label.
7. Pattern. When a structure repeats, change or escalate it after the second repeat.
8. Ending. End the film right after the payoff. The whole video, outro included, is under
   45 seconds. On 2026-10-10 I allowed outros of up to 10 seconds, to win followers (before
   that the outro ask was 2 to 3 seconds). With a 6 to 9 second outro, the film itself is at
   most about 36 seconds.

How to apply them (Claude's working targets, adjust when the numbers come in):
- Rule 5: under 15% of the film without voice, no gap over 0.3 s, at most 0.5 s after the last
  word, `"grid": 0.5` and `"gap": 0.1` in `script.json`, "brisk pace" in `style`.
- Before the full render, compute from `vo.json` the time the hook claim starts and the share of
  the film without voice, and report both with the scores.
- At the start of each new film, ask me for the previous video's skip rate and retention graph.
  Record the skip rate in `VIDEOS.md`, with a few words on what that video's hook did.

## Shares
On 2026-10-09 I asked for videos that earn as many shares as possible. Instagram reportedly
ranks sends per reach among its top signals. These rules come from general research (marketing
guides and one study of news articles), not from my own numbers: keep them until the share
rates in `VIDEOS.md` say otherwise.

1. One person. Every film has one specific kind of person the viewer knows and would send it
   to ("वो दोस्त जो ChatGPT use करता है", "मम्मी-पापा"). Claude decides who from the topic.
2. Surprise. The hook is a true claim that surprises (together with Retention rules 1 to 3).
3. Relatable. Take analogies from college, hostel, exam and family life. The mascot may be
   funny, but the joke must carry the concept.
4. A last frame worth forwarding. The payoff frame is a complete one-line summary that reads
   without sound.
5. The share ask names a person or a group. Follow outro 5 does this (see Outro); it takes its
   turn in the rotation and is not the ending of every video.
6. Topics. Topics with a stake for someone else (scam warnings for parents) are marked
   `[share]` in `VIDEOS.md`.
7. Never: outrage bait, exaggeration, invented facts. Anger spreads, but claims stay true.

Measure: after posting, ask me for the Reel's shares and reach, and record shares ÷ reach in
`VIDEOS.md`.

## Voiceover
- Every film has a voiceover unless the brief says otherwise.
- Generate it with `node vo.mjs <film-dir>` (OpenRouter, `google/gemini-3.8-flash-tts`,
  key in `Openrouter key.txt`; never print or commit the key).
- `script.json` holds one entry per sentence or phrase. Delivery direction goes in `style`
  (sent as the API `instructions` field). Never put direction in `text`: the model reads it aloud.
- `vo.json` is the timing source. Scene cuts and on-screen text follow the measured line
  start and duration, then snap to the beat grid. Duck the score under the voice.
- Default voice: Charon for English, Orus for Hindi.
- Films are in English or Hindi. Hindi scripts: Devanagari for Hindi words, Latin script for
  English technical terms (password, firewall, cloud), short everyday sentences in the same
  spirit as STE. Say "natural Hindi as spoken in India" in `style`.
- Realistic and engaging: vary `style` per line (hook, explanation, payoff), not one flat read.

## Outro
- Outro clips live in `outro/` (several variations, each a finished clip with voice).
- The series, in my words (2026-10-10): short videos for non-coders that teach AI from absolute
  basics to pro level, simply and practically, with no coding knowledge needed. The first goal
  of every outro is to win followers: it gives a specific reason to follow, never only
  "follow for more".
- Every film ends with one of the five follow outros, `outro/follow-<n>-<name>.mp4` (6 to 9 s,
  at most 10; sources in `outro/follow/`, shared code `outro/follow/outro.js`). Each makes a
  pitch and then asks for the follow, while the logo, the handle, the series line
  "AI · zero से pro · बिना coding" and the Follow button are on screen:
  1. journey (7.7 s): no coding needed, AI from zero to pro one video at a time; follow for
     the whole journey.
  2. series (9.1 s): three coming topics are revealed; follow so that you miss none.
  3. value (8.1 s): AI feels hard; here one thing per video, no coding, your language;
     follow to stay ahead in AI.
  4. comment (6.1 s): you choose the next AI topic in a comment; follow so that you do not
     miss that video.
  5. share (7.6 s): send it to a friend who wants to learn AI and learn together; follow.
- Rotation (my rule: never the same outro every time). Use them in the order 1 to 5;
  `VIDEOS.md` says which is next. Claude may swap two turns when another one clearly fits the
  film better (5 for a scam warning or family topic), tells me which one and why, and never
  uses the same outro twice in a row.
- Outro 2 names three topics from the roadmap (ChatGPT कैसे सोचता है, prompt कैसे लिखें,
  AI agents क्या हैं). When one of them is published, replace it with a topic that is still
  to come and rebuild the clip, so that the claim stays true.
- The outros speak about AI only. Do not put one on a Cloud or Cybersecurity film without
  asking me first.
- The older outros stay in `outro/` and are used only when I ask: the twelve short ones
  (`outro-a-short.mp4` to `outro-l-short.mp4`, 2 to 3 s; comment A, C, D; follow B, F, G;
  share E, H to L) and the seven long ones (`outro-a.mp4` to `outro-g.mp4`). Do not delete them.
- `node share-outro.mjs <film-dir>` builds an outro from a `share` sentence written for one
  film. Use it only when I ask; #02 has one.
- Stitch with `node stitch.mjs <film-dir> outro/follow-<n>-<name>.mp4 "<NN>-<Short-Title>"`;
  the result in the film folder is the deliverable. Record the outro in `VIDEOS.md`.
- Outro sources are in `outro/<x>/` and share `brand/kagaz.js` and `brand/timing.js`. Handle is
  `@vipulsingh_ai` (Instagram and YouTube); logo is `logo.png`.
- The fourteen outros A to G were remade in the Sticker Pop look on 2026-10-09 (same voice,
  timing and sound); their first-look versions are kept in `outro/kagaz-v1/`, do not delete
  them. H to L were made in Sticker Pop the same day. I have not yet heard H to L, or the
  five follow outros.
- Voice takes: few and long (one take per one or two sentences), one calm even `style` for the
  whole clip. Short separate takes with strong acting direction sounded weird (outro C, first try).
- Outro voice is friendly senior-to-junior: "तुम / करो", not "आप / कीजिए".

## Caption for posting
- After every finished video, write a post caption that works for both an Instagram Reel and a
  YouTube Short, save it as `caption.txt` in the film folder, and show it in the reply.
- Three parts: a title (under 100 characters, the hook as a question or promise), a brief
  description (3 to 5 short lines: the idea, the one takeaway, then the same ask and reason to
  follow as the video's outro, with `@vipulsingh_ai`), and exactly 5 hashtags.
- Same language as the video. Hindi captions: Devanagari with English technical terms, "तुम / करो".
- Claim only what the video says.

## Intake: ask before you build
When I give a topic, ask these first in one AskUserQuestion round, each with a recommended option:
1. Language (English or Hindi). Orientation only if not the 9:16 default.
2. Length only if not the default (whole video under 45 seconds).
3. Brand is Kagaz; do not ask about colors, fonts or voice.
4. Scripting style (for example: problem then fix, analogy first, myth against fact, step by step).
5. Audience level and the one thing they must remember.
6. Supplied music track or synthesized score; captions on or off.
Do not ask which outro to use or who to send the film to: Claude picks both (see Outro).
Skip a question when I already answered it in the brief.

## Loop before you show me anything
1. Render one frame per beat as a contact sheet and LOOK at it.
2. Score it 1-10 on: hook (Retention rules 1 to 3), retention (rules 4 to 8), readability at
   phone size, motion quality, variety, brand accuracy, sound sync.
3. Fix the 3 worst problems. Repeat until every score is 8+.
4. Only then do the full render.
