// The create-reel hook (from 2026-10-16), set in .claude/settings.json as a UserPromptSubmit hook.
// When my message says "create reel" or "create video", it pulls fresh Instagram numbers
// (`node ig.mjs report`) and runs the experiment review that applies its decisions
// (`node ig.mjs review --apply`), then hands the result to Claude as context, so step 1 of
// "Create reel" (CLAUDE.md) always happens, and every confirmed or discarded experiment is
// applied and announced. Any other message: it does nothing. It never prints the token
// (ig.mjs never does).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { /* no input */ }
const prompt = String(input.prompt ?? '');
// only when the message starts with the command ("create reel", "Create video: <topic>"), not
// when it merely mentions it in a sentence
if (!/^\W*create\s+(a\s+|new\s+)?(reel|video)\b/i.test(prompt.trim())) process.exit(0);

const run = (args) => spawnSync(process.execPath, ['ig.mjs', ...args], { cwd: ROOT, encoding: 'utf8', timeout: 150000 });
const report = run(['report']);
const failed = report.status !== 0;
const review = failed ? null : run(['review', '--apply']);
const read = (f) => (existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f), 'utf8') : '');

let context;
let message;
if (failed || review.status !== 0) {
  const err = ((failed ? report : review).stderr || (failed ? report : review).stdout || 'no output').slice(-600);
  context = `The create-reel hook could not finish (${failed ? 'node ig.mjs report' : 'node ig.mjs review --apply'} failed): ${err}\nRun \`node ig.mjs check\`, \`node ig.mjs report\` and \`node ig.mjs review --apply\` yourself (step 1 of "Create reel"); tell me if the token has expired.`;
  message = 'Create-reel hook: the Instagram pull or the review failed; Claude will run them by hand.';
} else {
  const latest = read('results/latest.md');
  const keyLines = latest.split('\n').filter((l) => /^(Instagram API numbers|HIT|No hit|English test|- #|- No English|Followers by country|Idea score weights|What drives follows|RANKING CHANGED|\| [1-3] \| )/.test(l)).join('\n');
  const changes = /CHANGES TO THE WORKFLOW TODAY/.test(review.stdout);
  const reranked = /^RANKING CHANGED/m.test(latest);
  const low = /QUEUE LOW/.test(review.stdout);
  const next = (review.stdout.match(/^NEXT REEL .*$/m) ?? [''])[0];
  const askShot = (review.stdout.match(/^ASK AFTER DELIVERY .*$/m) ?? [''])[0];
  context = [
    'The create-reel hook has just run `node ig.mjs report` and `node ig.mjs review --apply` (step 1 of "Create reel" in CLAUDE.md).',
    'Fresh numbers are in results/latest.md (copy its table into VIDEOS.md); the review is in results/review.md.',
    changes ? 'There are CHANGES TO THE WORKFLOW TODAY (playbook, retired, re-checks, new experiments): tell me these first, in plain words, before anything else.' : 'No change to the playbook or the queue today.',
    'Build for the top metrics of "What drives views and follows" (CLAUDE.md): score ideas with its weights, and check the reel against its "Build it with" column before the full render.',
    reranked ? 'RANKING CHANGED since the last run: tell me in the step-1 lines what changed and what you now build for.' : '',
    low ? 'QUEUE LOW: add the new experiments in this reply (one change, pass mark and outcomes each; register and board), and tell me what they are.' : '',
    next ? `${next} (In a bet slot apply the playbook; in an experiment slot it does not apply; the wild card ignores it.)` : '',
    askShot ? `${askShot} Ask for it at the end of the reply that delivers the reel, in one line, and for no other reel.` : '',
    '',
    'Key lines of the report:',
    keyLines,
    '',
    'The review:',
    review.stdout.trim(),
  ].join('\n');
  message = changes ? 'Create-reel hook: fresh numbers pulled; the playbook or the queue changed today (Claude will tell you first).'
    : low ? 'Create-reel hook: fresh numbers pulled; the experiment queue is low, Claude will add new ones.'
      : 'Create-reel hook: fresh numbers pulled; experiments reviewed, no change today.';
}
process.stdout.write(JSON.stringify({ systemMessage: message, hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } }));
