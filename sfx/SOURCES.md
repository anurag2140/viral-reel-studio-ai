# Sound effects library

Recorded sound effects for the videos. `score.mjs` plays a file from `sfx/<cue type>/` when
that folder has files, and falls back to the synthesized effect when it does not.
`node score.mjs <film-dir> --synth` ignores this library.

## Where the sounds come from

Downloaded on 2026-10-09. All six packs are CC0 (public domain): free for commercial use,
no credit required. The untouched downloads, with their licence files, are in `_packs/`.

| Pack | Source | Sounds | Licence |
|---|---|---|---|
| Interface Sounds | https://kenney.nl/assets/interface-sounds | 100 | CC0 |
| Casino Audio | https://kenney.nl/assets/casino-audio | 54 | CC0 |
| Impact Sounds | https://kenney.nl/assets/impact-sounds | 130 | CC0 |
| RPG Audio | https://kenney.nl/assets/rpg-audio | 51 | CC0 |
| Music Jingles | https://kenney.nl/assets/music-jingles | 85 | CC0 |
| Swishes Sound Pack, by artisticdude | https://opengameart.org/content/swishes-sound-pack | 13 | CC0 |

## Folders

Each file name starts with its pack, so its origin stays traceable.
The sounds were sorted by file name and measured length, not by ear: Claude cannot hear them.
Delete a file from a folder to stop it from being used.

Used by the films today (folder name = cue type in a film's `timeline.js`):

| Folder | Moment in a video | Files | Taken from |
|---|---|---|---|
| `thud` | a card or logo slams in | 15 | soft and wood impacts |
| `paper` | a card drops or is dealt | 19 | card place, slide and shove; book place |
| `swipe` | a marker stroke, cross or highlight | 13 | swishes |
| `whoosh` | a scene change | 12 | cloth, card fan, maximize and minimize sweeps |
| `pop` | something pops in | 15 | drop, pluck, back, short select |
| `stamp` | a stamp hit or button press | 14 | switch, book close, chop, soft impacts |
| `tick` | counters, typing, reels | 11 | tick, click, toggle, chip lay |
| `ding` | a success or the last chord | 9 | confirmation, short glass |

Not in a folder, so still synthesized: `scratch` (pencil drawing). No pack has pencil sounds.

Stored for future cue types (not used until a timeline asks for them):
`jingle` (85 short musical stings; they have their own key and may clash with the score),
`error`, `question`, `chips`, `dice`, `shuffle`, `scribble`, `book`.

## Adding sounds

Put `.wav`, `.ogg`, `.mp3` or `.flac` files into the folder for their moment, or make a new
folder and use its name as a cue type. Only add sounds whose licence allows commercial use,
and add a row to the table above with the source and licence.
