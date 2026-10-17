# Video log and roadmap

This file is the single record of which videos exist and what comes next.
Claude reads it before every new film and updates it after every finished film.

## Made

| # | Short title | Track | Level | Language | Outro | Folder | Finished | IG skip rate | IG shares ÷ reach | Hook | Send it to |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | AI vs ML vs DL vs GenAI | AI | 1 | Hindi | comment: A (long, first look) | `films/ai-ml-dl-genai` | 2026-10-08 | 50% | not yet known | List of four terms first; claim spoken at 3.7 s. 47.5 s with outro. | nobody named |
| 02 | Machine कैसे सीखती है? | AI | 1 | Hindi | share: its own share outro | `films/machine-learns` | 2026-10-09 | not yet known | not yet known | Claim spoken from 0 s ("ChatGPT को किसी ने rules नहीं सिखाए"), full hook text on frame 0, question kept open to the end. 37.0 s with outro. | the friend who uses ChatGPT |
| 03 | Neural network = दिमाग़ की copy? | AI | 2 | Hindi | follow 1 (journey) | `films/neural-network` | 2026-10-10 | not yet known | not yet known | Claim spoken from 0 s ("Neural network दिमाग़ की copy नहीं है"), then "फिर ChatGPT चलता किससे है?"; answer held to the end. 27.9 s film, 35.7 s with outro. | the friend who says AI has a brain (not asked in the outro) |
| 04 | AI का इतिहास: 1956 से 2026 | AI | 1 | Hindi | follow 2 (series) | `films/ai-history` | 2026-10-11 | not yet known | not yet known | Claim spoken from 0 s ("AI नया नहीं है, यह सत्तर साल पुराना है"), then "दो बार fail भी हुआ"; the whole 70-year line on frame 0. First film with the two-row header. 27.7 s film, 36.9 s with outro. | the friend who thinks AI began with ChatGPT (not asked in the outro) |
| 05 | Data: AI का खाना | AI | 1 | Hindi | follow 3 (value) | `films/data-food` | 2026-10-11 | not yet known | not yet known | Claim spoken from 0 s ("AI भी खाना खाता है"), then "ग़लत खाना खाए तो ग़लत जवाब देता है"; the mascot eats from frame 0. 22.4 s film, 30.5 s with outro. | the friend who trusts every AI answer (not asked in the outro) |

IG skip rate = share of views that left in the first 3 seconds, from the Reel's insights.
IG shares ÷ reach = the Reel's shares divided by the accounts it reached, as a percentage.
The Hook column says what the opening did, and "Send it to" names the person in the share ask,
so skip rates and share rates can be compared between videos.

Next video number: **06**

## Outro rotation

Since 2026-10-10 every film ends with one of the five follow outros, used in the order
1 journey, 2 series, 3 value, 4 comment, 5 share (rules in `CLAUDE.md`, section Outro).

- #01 older outro A (long), #02 its own share outro.
- #03 follow outro 1 (journey).
- #04 follow outro 2 (series).
- #05 follow outro 3 (value).
- **Next: #06 follow outro 4 (comment)**, then #07 outro 5, and so on.

## How the next topic is chosen

1. If a topic is given, use it. Give it the next number, and tick it in the roadmap if it is there
   (add it to the right track and level if it is not).
2. If no topic is given, follow the track rotation **AI, Cloud, AI, Cybersecurity** (then repeat)
   and take the first unticked topic of that track. AI comes up twice as often because the audience
   is mainly people who learn AI.
3. Never skip ahead inside a track: a topic may assume only what earlier topics of the same track
   explained. If a film needs a term from an unmade topic, define the term in one sentence.
4. Topics marked `[share]` have a clear person to send them to (a warning for parents, a tip for
   a friend). They are placed early in their level on purpose.

Rotation position: #01 and #02 were AI (I gave the #02 topic), so **#03 is Cloud**, #04 AI, #05 Cybersecurity, #06 AI, and so on.

## Roadmap: beginner to pro

Level 1 = no background needed. Level 2 = knows the level 1 words. Level 3 = how it works inside.
Level 4 = how professionals build and run it.

### AI

- [x] L1 · AI vs ML vs Deep Learning vs GenAI (#01)
- [x] L1 · Machine कैसे सीखती है? Examples से pattern (#02)
- [x] L1 · AI का इतिहास: 1956 से 2026 (#04; added because I gave the topic)
- [x] L1 · Data: AI का खाना. जैसा data, वैसा AI (#05; added because I gave the topic)
- [ ] L1 · Training और inference का फ़र्क़
- [ ] L1 · Model क्या होता है? Data, model और prediction
- [ ] L1 · Supervised, unsupervised और reinforcement learning
- [ ] L1 · LLM क्या है? ChatGPT अंदर से क्या करता है
- [ ] L2 · Token क्या है? AI शब्द नहीं, tokens पढ़ता है
- [ ] L2 · Prompt क्या है और अच्छा prompt कैसे लिखें
- [ ] L2 · Hallucination: AI ग़लत जवाब इतने भरोसे से क्यों देता है
- [ ] L2 · Context window: AI कितना याद रख सकता है
- [x] L2 · Neural network क्या है? दिमाग़ की copy नहीं, छोटे हिसाबों का जाल (#03; made early because I gave the topic)
- [ ] L2 · Weight क्या है? Network सीखते समय क्या बदलता है
- [ ] L3 · Embeddings: शब्द numbers कैसे बनते हैं
- [ ] L3 · RAG क्या है? AI को अपनी files कैसे पढ़ाएँ
- [ ] L3 · Fine-tuning vs RAG: कब क्या चुनें
- [ ] L3 · Transformer और attention: LLM का engine
- [ ] L3 · Temperature और sampling: AI का जवाब हर बार अलग क्यों
- [ ] L4 · AI agent क्या है? Tools, planning और memory
- [ ] L4 · MCP क्या है? AI को apps से कैसे जोड़ते हैं
- [ ] L4 · Evals: AI को test कैसे करते हैं
- [ ] L4 · Multimodal AI: text, image और audio एक model में

### Cloud

- [ ] L1 · Cloud क्या है? किसी और का computer, internet पर
- [ ] L1 · IaaS, PaaS और SaaS का फ़र्क़
- [ ] L1 · Server क्या है और data center अंदर से कैसा है
- [ ] L2 · Virtual machine क्या है
- [ ] L2 · Container और Docker: VM से फ़र्क़
- [ ] L2 · Region और availability zone
- [ ] L2 · Object storage vs database
- [ ] L3 · Load balancer क्या करता है
- [ ] L3 · Auto scaling: traffic बढ़े तो क्या होता है
- [ ] L3 · CDN: website इतनी तेज़ क्यों खुलती है
- [ ] L3 · Serverless क्या है
- [ ] L4 · Kubernetes क्या है
- [ ] L4 · Microservices vs monolith
- [ ] L4 · Infrastructure as code
- [ ] L4 · GPU cloud: AI models कहाँ चलते हैं

### Cybersecurity

- [ ] L1 · `[share]` OTP किसी को क्यों नहीं बताना (send to: parents)
- [ ] L1 · `[share]` Fake link कैसे पहचानें (send to: parents)
- [ ] L1 · `[share]` "ग़लती से पैसे भेज दिए" वाला UPI scam (send to: family group)
- [ ] L1 · Password कैसे चोरी होता है (brute force और leaks)
- [ ] L1 · Multi-factor authentication क्या है
- [ ] L1 · Phishing कैसे पहचानें
- [ ] L1 · Malware, virus और ransomware का फ़र्क़
- [ ] L2 · Encryption क्या है? ताला और चाबी
- [ ] L2 · Hashing vs encryption: password कैसे store होता है
- [ ] L2 · HTTPS और वह ताला वाला icon
- [ ] L2 · Firewall क्या करता है
- [ ] L2 · VPN क्या है और क्या नहीं है
- [ ] L3 · Public key और private key
- [ ] L3 · SQL injection कैसे होता है
- [ ] L3 · DDoS attack क्या है
- [ ] L3 · Social engineering: इंसान सबसे कमज़ोर कड़ी
- [ ] L4 · Zero trust क्या है
- [ ] L4 · Prompt injection: AI को कैसे hack करते हैं
- [ ] L4 · Deepfake कैसे बनते हैं और कैसे पकड़ें
