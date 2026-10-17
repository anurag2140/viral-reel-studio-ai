# viral-reel-studio-ai

Code-rendered Instagram Reels and YouTube Shorts in Hindi and English. Every reel is an
illustrated story, written in HTML and JavaScript, voiced by an AI voice, scored with
synthesized music and rendered frame by frame. A read-only Instagram API loop measures each
reel, runs experiments and re-ranks what drives views and follows before the next one is made.

Built for the Instagram channel [@vipulsingh_ai](https://www.instagram.com/vipulsingh_ai/):
AI tools and tricks for young Indians, students and people in their first job.

---

## What it makes

A 30 to 40 second vertical reel (1080 x 1920, 30 fps) that tells one small story:

| Part | What happens on screen |
|---|---|
| Hook | The result comes first: a big face reacting to it, with the whole hook sentence as a caption on frame 0 |
| Trouble | A situation the viewer knows, acted out by drawn characters |
| Turn and how | The tool's real web page fills the frame, with scroll, zoom, a pointer and a marker ring on the words the voice says |
| Second payoff | One more thing the viewer did not expect |
| Ending | The story closes, a "comment for the link" line, a short follow ask |

The main character carries the creator's own face (eleven expressions on a drawn body). A
supporting cast (a boss, an aunty, a friend, a classmate, a professor, a monkey and a macaw)
plays the other roles. Captions are compact, word by word, with the spoken word in yellow.

## How a reel is made

Each reel lives in its own folder under `films/` and is built by a few Node scripts:

| Step | Command | What it does |
|---|---|---|
| 1. Capture | `node capture.mjs films/<reel> home=<url> pricing=<url>` | Saves the tool's public pages as tall images, with their text and headings (never signs in) |
| 2. Sharp parts | `node capture-strip.mjs films/<reel> <url> <name>=<y0>-<y1>` | Shoots the parts the camera zooms into at 4x |
| 3. Voice | `node vo.mjs films/<reel>` | AI voiceover from `script.json` (OpenRouter text to speech), timed by sentence and word |
| 4. Sound | `node score.mjs films/<reel>` | Synthesized music on a beat grid, sound effects, mix at -14 LUFS |
| 5. Check | `node render.mjs films/<reel> --sheet` | Contact sheets, one frame per beat, to look at before rendering |
| 6. Render | `node render.mjs films/<reel>` | Renders every frame with Playwright and encodes H.264 with FFmpeg |
| 7. Cover | `node render.mjs films/<reel> --cover 0.6` | The post's cover image (with an optional series badge) |

A film is a pure function of time: `window.seek(t)` paints frame `t`, with no state carried
between frames, so every render is exact and repeatable. The shared drawing kit is in `brand/`:
`story.js` (people, camera, captions, the real page, the pointer), `scenes.js` (ready scenes
and endings), `body.js` (the main character's body), `cast.js` (the supporting cast) and
`timing.js` (voice timing).

## The learning loop

The project measures itself and changes how it makes the next reel.

- **Numbers** (`node ig.mjs report`): views, reach, skip rate, watch time, like, comment, save,
  share and repost rates, Facebook views, views over time and the account day by day, read
  through Meta's official Instagram Graph API. Read only: it never posts, likes, follows,
  comments or messages.
- **What drives views**: every report ranks each metric by how closely it moves with views
  across all reels, sets the hit reels' level as the target, and turns the top metrics into
  weights for scoring the next ideas. The ranking is written into `CLAUDE.md`.
- **Experiments** (`node ig.mjs review --apply`): one reel in three tests something new (a
  format, a hook, a language, a posting time). Two passes put it in a playbook of boosts,
  shares and defaults; two fails retire it for 90 days. Nothing becomes a fixed rule, proven
  entries are re-checked, and the queue never runs dry.
- **English test**: some reels are made in easy US English and judged by value (views from
  tier-1 countries count ten times) against the best Hindi reel.
- **Radar** (`node ig.mjs radar`): other creators' public reels with five times their usual
  views, as ideas to learn from.

What the API cannot give (the retention graph, follows per reel, a reel's audience) comes from
one insights screenshot after each reel, recorded in `results/`.

## Working with Claude Code

The project is run with [Claude Code](https://claude.com/claude-code). `CLAUDE.md` holds every
rule: the look, the story, the voice, the claims, the experiments and the current ranking.
Typing **"create reel"** starts the whole flow: a hook (`.claude/hooks/create-reel.mjs`) pulls
fresh numbers and runs the review, Claude researches and proposes three or four ideas with a
recommendation, and after the pick it captures, writes, voices, scores, checks and renders the
reel, then writes the post caption. `VIDEOS.md` is the record of every reel, its results and
what comes next.

## Project layout

```
brand/               the drawing kit, the character, the cast, faces and style sheets
films/<reel>/        one folder per reel: script.json, film.html, timeline.js, shots/, vo/, audio/
films/_template-short/   start for a short looping reel
results/             numbers, experiment register, ranking, review, screenshots log
sfx/                 sound effects (sources and licences in sfx/SOURCES.md)
outro/               older outro clips
archive/             earlier rules, kept for history
capture.mjs, capture-strip.mjs, vo.mjs, score.mjs, render.mjs   the build scripts
ig.mjs               Instagram numbers, ranking, review, radar
CLAUDE.md            the rules        VIDEOS.md   the reel log
```

## Setup

You need:

- [Node.js](https://nodejs.org/) 18 or newer (built on 25)
- [FFmpeg](https://ffmpeg.org/) on the path
- Playwright: `npm install`, then `npx playwright install chromium` (an installed Google Chrome
  is used for page captures when present)
- An [OpenRouter](https://openrouter.ai/) API key for the voice, in `Openrouter key.txt`
- For the numbers: an Instagram professional account linked to a Facebook page, and a token
  from Meta's Graph API with `instagram_basic`, `instagram_manage_insights` and
  `pages_read_engagement`. `Instagram token.txt` holds three lines: the token, the Instagram
  account ID and the app ID. Tokens last 60 days.

Both key files are in `.gitignore`. Never commit them.

## Notes

- Claims about a tool come only from its public pages, which are recorded in each reel's
  `script.json` (`sources`).
- Sound effects are used only under licences that allow commercial use (`sfx/SOURCES.md`).
- The faces in `facial expresson headshot/` and `brand/face/` are the creator's own likeness.
  Do not reuse them for other channels or characters.
