# Template: the short loop (experiment E3)

A reel under 15 seconds with one trick, built so that it plays as a loop: the last frame leads
straight into frame 0, and the last words run into the hook ("अब से" ... "तुम्हारे गंदे notes,
दस second में साफ़।"). It tests two things the long reels cannot: a bigger share of the reel
watched, and people watching it twice.

Everything here is a placeholder: the voice, the notes on the card and the drawn phone. Never
post this folder as a reel.

## The parts (about 9 to 14 seconds)

| Shot | Lines | What happens |
|---|---|---|
| A | `hook` | Frame 0: the result held up next to my face reacting. The hook sentence is on screen whole. |
| B | `how` | The tool: two or three very short steps. In a reel, the real page fills the frame (`capture-strip.mjs` and `webpage()`, as in #11), not the drawn phone. |
| C | `link` | The tool-link line, in the default words. |
| A again | `back` | Two or three words that lead into the hook. The shot ends in exactly the frame-0 state. |

## Making a reel from it

1. Copy the folder to `films/<name>/`. Delete `vo/`, `audio/`, `sheets/`, `vo.json` and
   `beats.json` in the copy.
2. Write `script.json`. Keep the four line ids; `back` is a few words that make sense with the
   hook after them. No "तो" and no "याद रखो" (see "Story and hook" in `CLAUDE.md`).
3. Replace the result card (shot A) with the real result, and shot B with the real page.
4. Keep `u(t)`, the loop clock: shot A moves only by `u(t)`, so the last frame is the frame-0
   state. Check with `node render.mjs <dir> --at 0,<dur minus 0.03>`: the two frames must look
   the same.
5. No follow card: a card at the end would break the loop. The follow ask and the send ask go
   in the post caption. This breaks the bet "the follow ask is part of the film" on purpose;
   write that on the board in `VIDEOS.md`.
6. Build as usual: `vo.mjs`, `score.mjs` (the timeline sets `T.recap` to the end, so there is no
   closing chord), contact sheet, render, cover.
