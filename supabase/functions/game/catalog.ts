// AUTO-EXTRACTED from public/pookie-and-i.html — game content is unchanged.
// The server owns prompt selection so clients cannot forge game content.
export interface GameContent { id: string; name: string; type: string; prompts: string[]; ideas?: string[]; confessions?: string[]; dares?: string[] }
export const CATALOG: Record<string, GameContent> = {
 "questions": {
  "id": "questions",
  "name": "Deep Questions",
  "type": "draw",
  "prompts": [
   "What's a memory from your childhood you've never told me?",
   "If you could relive one day of your life, which would it be and why?",
   "What does your ideal life look like in 10 years?",
   "What's something you've always wanted to try but haven't yet?",
   "What's the best piece of advice someone ever gave you?",
   "What do you think is your best quality that I might not fully appreciate?",
   "What's something you're quietly proud of that you rarely talk about?",
   "If you could change one thing about how you grew up, what would it be?",
   "What does \"home\" mean to you?",
   "What's a dream you've quietly let go of, and how do you feel about it now?",
   "What's one thing you want to learn before you die?",
   "When do you feel most like yourself?",
   "What's something you wish I understood better about you?",
   "What's the bravest thing you've ever done?",
   "If you could have dinner with anyone — dead or alive — who and why?",
   "What does love look like to you in everyday life?",
   "What's your favourite thing about us?",
   "What are you most afraid of losing?",
   "What's one small thing I do that makes you feel cared for?",
   "If you had to describe yourself in three words, what would they be?",
   "What's the hardest lesson you've learned so far?",
   "When was the last time you cried and why?",
   "What's your love language and do you feel I speak it?",
   "What's one thing you want us to do more of?",
   "What were you like as a teenager?",
   "What's a belief you used to hold strongly but have since changed?",
   "What's your earliest memory?",
   "What do you overthink the most?",
   "If money wasn't a factor, what would you do every day?",
   "What's the kindest thing a stranger has ever done for you?",
   "What does your inner critic sound like?",
   "What makes you feel safe?",
   "What's a tradition you want to start together?",
   "What do you need most from a relationship?",
   "How do you handle conflict, and is that something you want to change?",
   "What's a song that always makes you emotional?",
   "What would you tell your 16-year-old self?",
   "What's the biggest risk you've ever taken?",
   "How do you define success for yourself?",
   "What is your biggest regret and why?",
   "If you could master one skill overnight, what would it be?",
   "What's the most important lesson your parents taught you?",
   "What does forgiveness mean to you?",
   "What's a book, film, or show that changed how you see the world?",
   "What do you think people misunderstand about you?",
   "What's your biggest insecurity?",
   "When do you feel most alive?",
   "What's the most spontaneous thing you've ever done?",
   "What's a promise you've made to yourself?",
   "What does trust look like in a relationship for you?",
   "What's something you need to hear more often?",
   "What are you most grateful for right now?",
   "What's one thing you'd change about society?",
   "What's your happiest memory from the last year?",
   "What scares you about the future?",
   "If you could live anywhere in the world, where would it be?",
   "What did you want to be when you grew up?",
   "What makes you feel truly loved?",
   "What's something you've never admitted to anyone?",
   "What would your perfect day look like from start to finish?",
   "How do you want to be remembered?",
   "What's one thing about our relationship that makes you proud?",
   "What part of your identity are you most proud of?",
   "When do you feel most disconnected from me and what can we do about it?",
   "What's one fear you'd like to overcome this year?",
   "What does \"growing old together\" look like to you?",
   "What's a small moment between us that you'll never forget?",
   "If you could ask me one question and I had to answer 100% honestly, what would it be?",
   "What does vulnerability feel like for you?",
   "What's the most beautiful thing you've ever seen?"
  ]
 },
 "activities": {
  "id": "activities",
  "name": "Activities",
  "type": "draw",
  "prompts": [
   "Draw each other's portrait — no erasing allowed. Set a 3-minute timer.",
   "Cook or make the same thing simultaneously. Pick something with 5 ingredients or less.",
   "Make a \"us\" playlist — take turns adding one song each. Explain why you picked yours.",
   "Show each other a virtual tour of your space. Highlight your 3 favourite corners.",
   "Each share one photo from your camera roll that made you happy this week.",
   "Teach each other one skill you have. Keep it to 5 minutes each.",
   "Read a short poem or passage aloud to each other. Take turns choosing.",
   "Do 10 minutes of the same guided meditation together on YouTube.",
   "Each write down 3 things you want to do together this year. Compare lists.",
   "Take a 5-minute photo challenge — photograph the most beautiful thing near you right now.",
   "Watch a 10-minute YouTube video together and discuss.",
   "Plan a future trip together — pick a destination, budget, and 3 must-dos.",
   "Write each other a haiku and read it aloud. (5–7–5 syllables)",
   "Pick a recipe together and order the same takeaway from your respective areas.",
   "Each make a \"this week\" report — highs, lows, one thing you're grateful for.",
   "Take turns playing DJ — each pick 3 songs and explain the vibe you're going for.",
   "Play the Wikipedia game: pick a random article, click links and try to reach the same page.",
   "Draw your dream house together — each draw a different room.",
   "Make a bucket list of 20 things you want to do together. No rules.",
   "Take a personality quiz together online and compare results.",
   "Write a short story together — alternate sentences.",
   "Do a 5-minute guided stretch or yoga session together.",
   "Create a meme about your relationship using a meme generator.",
   "Pick a language and learn 10 words in it together.",
   "Rate each other's playlists honestly — play one song each and give a score out of 10.",
   "Play \"guess the Google search\" — type something and guess the autocomplete.",
   "Read each other your last 5 text messages (no cheating).",
   "Draw each other's pet or dream pet. Show the results.",
   "Pick a random country on Google Maps and explore it together virtually.",
   "Write a letter to your future selves 1 year from now. Read them aloud.",
   "Create a vision board together using Pinterest or Google Images.",
   "Take a BuzzFeed quiz together and see if you get the same answer.",
   "Each pick your top 3 films of all time and convince the other why they're great.",
   "Do a wardrobe challenge — style an outfit for each other from your closets.",
   "Play \"would you eat this?\" with weird food combos you find online.",
   "Each tell a 2-minute bedtime story. Make it up on the spot.",
   "Do a dramatic reading of a cheesy romance novel passage.",
   "Create a couple's handshake over video call.",
   "Play \"finish my sentence\" — start a sentence and the other finishes it.",
   "Each share your phone's screen time report and discuss.",
   "Pick an artwork online and make up a backstory for it together.",
   "Do a talent show — each perform something for 2 minutes.",
   "Play the emoji translation game — send a movie plot in emojis, guess the film.",
   "Take turns being an interviewer — ask 5 serious questions, 5 silly ones.",
   "Make a time capsule list of things happening right now that you want to remember.",
   "Try to teach each other a TikTok dance.",
   "Rate snacks from your country — describe them and the other scores them.",
   "Create a couple's quiz — write 5 questions about yourself and test your partner.",
   "Pick a random subreddit and browse it together, commenting on posts.",
   "Play 20-second drawing challenge — one draws, other guesses.",
   "Share your most-played Spotify song and explain what it means to you.",
   "Each describe a vivid dream you've had recently.",
   "Play \"two-word story\" — build a story two words at a time.",
   "Look up your horoscopes and read them to each other dramatically.",
   "Create a shared Pinterest board for your dream life together.",
   "Do an accent challenge — try to mimic 5 different accents.",
   "Play \"name that tune\" — hum 5 songs each.",
   "Write a joint poem — 2 lines each, alternating.",
   "Describe your ideal weekend morning in full detail.",
   "Try a simple origami tutorial together.",
   "Pick a debate topic and argue opposite sides for 5 minutes.",
   "Each write 3 predictions about the other's future. Compare.",
   "Share the last meme you saved and explain why it was funny.",
   "Do a \"room tour challenge\" — find the weirdest object in your room and tell its story."
  ]
 },
 "challenges": {
  "id": "challenges",
  "name": "Challenges",
  "type": "draw",
  "prompts": [
   "Compliment challenge: say 5 specific, genuine things you love about each other. No repeats.",
   "Write each other a haiku right now and read it aloud. 5–7–5 syllables.",
   "Send each other a song that reminds you of them — no explanation, just send it.",
   "Re-enact your first conversation. Go.",
   "In 60 seconds, name as many things as you can that you both love.",
   "Each describe your perfect version of tomorrow. Be specific.",
   "Tell each other one thing you've been meaning to say but kept putting off.",
   "Each share the last three photos in your camera roll and explain them.",
   "Write a joint bucket list — 10 things in 5 minutes. Take turns, no vetoing.",
   "Say something kind about your partner to an imaginary third person. Introduce them.",
   "Describe the other person using only words starting with letters of their name.",
   "Each pick one song that's a love letter to the other person. Play 30 seconds of it.",
   "Take turns giving each other a genuine, detailed compliment for 60 seconds each.",
   "Recreate your favourite photo together as best you can from your locations.",
   "Each share one thing you're working on becoming. No judgment, just listening.",
   "Stare into the camera without blinking. First to blink loses.",
   "Do your best impression of the other person. Be kind.",
   "In 30 seconds, list everything you know about your partner's favourite things.",
   "Send a voice note right now saying what you love most about them.",
   "Play \"rap battle\" — take turns freestyle rapping about each other for 30 seconds.",
   "Make a face that describes your mood right now. Hold it for 10 seconds.",
   "Write a limerick about the other person. Read it aloud.",
   "Tell your best joke. The other person rates it out of 10.",
   "Sing the chorus of the last song you listened to. No backing out.",
   "Do your best runway walk across the room. The other person is the judge.",
   "Name 3 things you were wrong about. Be honest.",
   "If you had to make a dating profile for the other person, what would it say?",
   "Say \"I love you\" in 5 different voices.",
   "Give a 1-minute motivational speech to your partner. Be dramatic.",
   "Share one thing you've never googled but always wondered about.",
   "Do a dramatic recreation of a scene from your favourite movie.",
   "Write a tweet about your relationship. Read it aloud.",
   "Name 5 things you'd save in a fire (besides people and pets).",
   "Describe your partner to a stranger as if they couldn't see them.",
   "Give each other new nicknames right now. Use them for the rest of the night.",
   "Tell the story of how you fell for each other — in 60 seconds, no pauses.",
   "Each confess one guilty pleasure. No judgement.",
   "Create a 10-second jingle about your relationship.",
   "Share the most embarrassing thing that happened to you this week.",
   "Do 10 push-ups or sit-ups together right now. No excuses.",
   "Each tell a \"roses and thorns\" — best and worst moment of today.",
   "Describe your partner's scent. Yes, really.",
   "Plan a surprise for your partner out loud. They can hear but can't comment.",
   "If you were both characters in a sitcom, what would the show be called?",
   "Dance to the next song that plays on shuffle. Full commitment.",
   "Each share a screenshot of the last text conversation you had (not with each other).",
   "Write a one-sentence love letter. Read it dramatically.",
   "Name one thing your partner does better than anyone you know.",
   "Try to make the other person laugh in under 30 seconds.",
   "If your love story was a film, what genre would it be and who would star?",
   "Share your phone lock screen and explain why you chose it.",
   "Each describe the other person using only food analogies.",
   "Rate each other's sense of humour on a scale of 1-10. Explain your rating.",
   "If you could only say 3 words to each other for a day, what would they be?",
   "Each give the other person a dare to complete before tomorrow.",
   "Tell each other one thing you'd like to try together that you haven't mentioned before.",
   "Describe the first time you realised you liked the other person.",
   "Share something you're currently overthinking.",
   "Play \"finish the lyrics\" — one sings, the other continues.",
   "Send each other a selfie right now. No retakes.",
   "If you could give each other one superpower, what would it be and why?",
   "Play \"this or that\" rapid fire — 10 questions in 30 seconds.",
   "Each describe your ideal date night in 30 seconds.",
   "Make a promise to each other right now. Something small and meaningful.",
   "Each write one word that describes how you feel about the other person. Reveal at the same time."
  ]
 },
 "never": {
  "id": "never",
  "name": "Never Have I Ever",
  "type": "fingers",
  "prompts": [
   "Never have I ever stood someone up",
   "Never have I ever pretended to be sick to avoid plans",
   "Never have I ever stalked an ex on social media",
   "Never have I ever cried at a commercial",
   "Never have I ever eaten food that fell on the floor",
   "Never have I ever sent a text to the wrong person",
   "Never have I ever gotten lost and refused to ask for help",
   "Never have I ever lied about having seen a movie",
   "Never have I ever accidentally called a teacher \"mum\" or \"dad\"",
   "Never have I ever re-gifted a present",
   "Never have I ever fallen asleep during a date",
   "Never have I ever pretended to laugh at a joke I didn't understand",
   "Never have I ever panic-cleaned before someone came over",
   "Never have I ever read someone's diary or private messages",
   "Never have I ever sung at full volume in the car thinking no one could see"
  ]
 },
 "thisorthat": {
  "id": "thisorthat",
  "name": "This or That",
  "type": "draw",
  "prompts": [
   {
    "a": "Beach",
    "b": "Mountains"
   },
   {
    "a": "Early bird",
    "b": "Night owl"
   },
   {
    "a": "Cook at home",
    "b": "Eat out"
   },
   {
    "a": "Road trip",
    "b": "Flight holiday"
   },
   {
    "a": "Coffee",
    "b": "Tea"
   },
   {
    "a": "City life",
    "b": "Countryside"
   },
   {
    "a": "Lots of friends",
    "b": "A few close ones"
   },
   {
    "a": "Dogs",
    "b": "Cats"
   },
   {
    "a": "Summer",
    "b": "Winter"
   },
   {
    "a": "Text",
    "b": "Call"
   },
   {
    "a": "Spicy food",
    "b": "Mild food"
   },
   {
    "a": "Be famous",
    "b": "Be rich in private"
   },
   {
    "a": "Know the future",
    "b": "Change the past"
   },
   {
    "a": "Never lie",
    "b": "Never feel pain"
   },
   {
    "a": "Live in the past",
    "b": "Live in the future"
   },
   {
    "a": "Books",
    "b": "Films"
   },
   {
    "a": "Spontaneous",
    "b": "Planner"
   },
   {
    "a": "Sweet",
    "b": "Savoury"
   }
  ]
 },
 "twenty": {
  "id": "twenty",
  "name": "20 Questions",
  "type": "twenty",
  "prompts": [],
  "ideas": [
   "A famous landmark",
   "A childhood toy",
   "A film character",
   "A food dish",
   "A country",
   "A famous person (alive)",
   "An animal",
   "A household object",
   "A song",
   "A TV show",
   "A sport",
   "A famous historical figure"
  ]
 },
 "wyr": {
  "id": "wyr",
  "name": "Would You Rather",
  "type": "draw",
  "prompts": [
   {
    "a": "Never use your phone again",
    "b": "Never eat your favourite food again"
   },
   {
    "a": "Know when you'll die",
    "b": "Know how you'll die"
   },
   {
    "a": "Be able to fly",
    "b": "Be invisible"
   },
   {
    "a": "Always be 10 minutes late",
    "b": "Always be 20 minutes early"
   },
   {
    "a": "Lose all memories from the past 5 years",
    "b": "Lose the ability to make new memories"
   },
   {
    "a": "Be the funniest person in any room",
    "b": "Be the smartest"
   },
   {
    "a": "Live 100 years in mediocre health",
    "b": "Live 50 years in perfect health"
   },
   {
    "a": "Always say what you're thinking",
    "b": "Never be able to lie"
   },
   {
    "a": "One long holiday a year",
    "b": "A long weekend every month"
   },
   {
    "a": "Speak every language fluently",
    "b": "Play every instrument perfectly"
   },
   {
    "a": "Be famous but broke",
    "b": "Be rich but anonymous"
   },
   {
    "a": "Rewind 5 years knowing what you know",
    "b": "Fast forward 5 years to see what happens"
   },
   {
    "a": "Never be cold",
    "b": "Never be hot"
   },
   {
    "a": "Give up social media forever",
    "b": "Give up watching TV/films forever"
   }
  ]
 },
 "truths": {
  "id": "truths",
  "name": "Two Truths & a Lie",
  "type": "truths",
  "prompts": []
 },
 "emoji": {
  "id": "emoji",
  "name": "Emoji Story",
  "type": "draw",
  "prompts": [
   "Your morning routine",
   "A bad day",
   "Falling in love",
   "A road trip",
   "Being really hungry",
   "Your dream holiday",
   "A lazy Sunday",
   "Getting lost",
   "A surprise",
   "A first date",
   "Feeling homesick",
   "A celebration",
   "Running late",
   "A phone call you didn't want to answer",
   "Your favourite memory",
   "A horror movie plot",
   "How you two met",
   "Your biggest fear",
   "A fairytale ending",
   "A cooking disaster",
   "Your dream job",
   "A heist movie",
   "Moving to a new city",
   "A wedding",
   "A breakup",
   "Your last holiday",
   "A night out with friends",
   "Waking up late for something important",
   "A childhood memory",
   "Your ideal future",
   "A rainy day indoors",
   "Meeting someone famous",
   "Learning something new",
   "A long flight",
   "Your guilty pleasure",
   "An awkward moment",
   "Getting a pet",
   "A beach day",
   "Your morning coffee routine",
   "A plot twist",
   "A secret mission",
   "Your best birthday ever",
   "A scary encounter",
   "Going shopping",
   "A video call gone wrong",
   "Your dream house",
   "A music festival",
   "A sports event",
   "Cooking together",
   "A midnight snack run",
   "Your typical Monday",
   "A snowstorm",
   "Winning something",
   "A family gathering",
   "Your last argument",
   "A spa day",
   "Packing for a trip",
   "Your favourite food",
   "A power outage",
   "The story of your name"
  ]
 },
 "song": {
  "id": "song",
  "name": "Name That Song",
  "type": "draw",
  "prompts": [
   "Category: a song from your childhood",
   "Category: a song from a film",
   "Category: a number one hit from any year",
   "Category: a song you know your partner loves",
   "Category: a song you're embarrassed you know all the words to",
   "Category: a love song",
   "Category: a hip-hop or R&B track",
   "Category: a song released this year",
   "Category: a song with a one-word title",
   "Category: a song from a Disney movie"
  ]
 },
 "word": {
  "id": "word",
  "name": "Word Association",
  "type": "draw",
  "prompts": [
   "Start word: Love",
   "Start word: Home",
   "Start word: Fire",
   "Start word: Ocean",
   "Start word: Dream",
   "Start word: Secret",
   "Start word: Night",
   "Start word: Gold",
   "Start word: Cloud",
   "Start word: Kiss",
   "Start word: Storm",
   "Start word: Music",
   "Start word: Time",
   "Start word: Memory",
   "Start word: Adventure"
  ]
 },
 "rateus": {
  "id": "rateus",
  "name": "Rate Us",
  "type": "rateus",
  "prompts": [
   "Surprise weekend trip with no destination revealed until you're at the airport",
   "Cooking a full meal together in the same kitchen",
   "Reading the same book and discussing it chapter by chapter",
   "One person plans the entire date — the other knows nothing until it happens",
   "Dancing together with no music on",
   "Spending a full day with no phones",
   "Writing each other letters and posting them",
   "Watching the sunrise together",
   "Taking a spontaneous road trip with no map",
   "Learning something new together — a language, a skill, a recipe",
   "Spending an entire weekend without leaving the house",
   "Going to a concert of a band neither of you know",
   "Cooking a meal from a country neither of you have visited",
   "Spending a night in a place with no WiFi",
   "Making a short film together",
   "Visiting each other's hometown for the first time",
   "Going on a silent walk together for 30 minutes",
   "Writing a song together even if neither of you can sing",
   "Planning a trip where the other person chooses everything",
   "Spending one week only communicating by voice notes",
   "Making a scrapbook of your relationship so far",
   "Doing a full photoshoot together just for fun",
   "Watching every film on a director's filmography together",
   "Taking a class together — cooking, pottery, dance",
   "Spending New Year's Eve together no matter what it takes"
  ]
 },
 "confessdare": {
  "id": "confessdare",
  "name": "Confess or Dare",
  "type": "confessdare",
  "prompts": [],
  "confessions": [
   "Confess: the last time you were jealous and said nothing",
   "Confess: something you find attractive about your partner that you've never said out loud",
   "Confess: a text you typed, almost sent, then deleted",
   "Confess: the last time you were annoyed at your partner but pretended you weren't",
   "Confess: something you googled that you'd be embarrassed to share",
   "Confess: the most irrational thing you've ever been jealous of",
   "Confess: something you pretend to like because your partner likes it",
   "Confess: a moment you were secretly proud of yourself but didn't say so",
   "Confess: the last lie you told, even a small one",
   "Confess: something you want but feel awkward asking for",
   "Confess: a habit you have that you hope your partner hasn't noticed",
   "Confess: the most embarrassing thing you've done for someone you liked",
   "Confess: something your partner does that you find annoying but have never mentioned",
   "Confess: a moment you felt really insecure but acted confident",
   "Confess: the first thing you noticed about your partner"
  ],
  "dares": [
   "Dare: send your partner the most unflattering photo of yourself from your camera roll right now",
   "Dare: do your best impression of your partner for 30 seconds",
   "Dare: read your last 5 Google searches out loud",
   "Dare: show your most recently played song without skipping",
   "Dare: open your camera, no filter, and hold it there for 10 seconds",
   "Dare: show the last meme you saved",
   "Dare: read the last text you sent to your best friend out loud",
   "Dare: show your screen time from this week",
   "Dare: do a 30-second sales pitch convincing your partner you're the best thing that happened to them",
   "Dare: show the oldest photo of yourself on your phone",
   "Dare: read your most recent notes app entry out loud",
   "Dare: show your most used emoji and explain why",
   "Dare: demonstrate how you walk when you think no one is watching",
   "Dare: show the last thing you bought online",
   "Dare: do your best catwalk strut on camera for 20 seconds"
  ]
 },
 "hottakes": {
  "id": "hottakes",
  "name": "Hot Takes",
  "type": "hottakes",
  "prompts": [
   "Pineapple on pizza is actually good",
   "Long-distance relationships are harder than in-person ones",
   "The person who texts first cares more",
   "Being fashionably late is actually rude",
   "Jealousy in a relationship is a green flag",
   "You should be able to go through your partner's phone",
   "People who don't like animals are suspicious",
   "Birthdays are overrated",
   "Men should always pay on the first date",
   "Social media is ruining relationships",
   "You can love someone and still not be compatible",
   "The situationship era is mostly men's fault",
   "Staying friends with an ex is always a bad idea",
   "People who post their relationship online constantly are insecure",
   "Ghosting is sometimes the kindest option",
   "You should tell your partner everything — no secrets",
   "Long-distance relationships almost never work long term",
   "People change too much in their 20s to stay with one person",
   "Saying 'I love you' too early ruins things",
   "You can tell everything about a person by how they treat waiters",
   "Having a 'type' is a red flag",
   "Couples who argue a lot are actually healthier",
   "Marriage is an outdated concept",
   "You should never go to sleep angry",
   "If someone cheats once they'll cheat again",
   "Love at first sight is real",
   "Couples should share finances completely",
   "Having separate friend groups in a relationship is healthy",
   "You don't choose who you fall in love with",
   "Moving in together before marriage is essential",
   "Everyone has a soulmate",
   "The talking stage is more stressful than dating itself",
   "You should never date someone your friend liked first",
   "Couples therapy should be mandatory before marriage",
   "Love is a choice, not a feeling",
   "Your partner should be your best friend",
   "Age gaps in relationships are always problematic",
   "You can tell if a relationship will work within the first 3 months",
   "People who say they don't need anyone are lying",
   "A relationship without conflict is a red flag"
  ]
 },
 "finishsentence": {
  "id": "finishsentence",
  "name": "Finish My Sentence",
  "type": "finishsentence",
  "prompts": [
   "The thing I find most attractive about you is...",
   "If I could change one thing about our relationship it would be...",
   "When I imagine us in 5 years I see...",
   "The most romantic thing you've ever done for me is...",
   "I knew I liked you when...",
   "My love language is probably... but I wish it was...",
   "The version of me you haven't met yet is...",
   "If our relationship was a film it would be called...",
   "The thing I'll never say first is...",
   "When I'm having a bad day what I really want from you is...",
   "The way you make me feel when...",
   "I feel most loved when you...",
   "Something I've never told you is...",
   "If I wrote you a letter right now it would start with...",
   "The best thing about us is...",
   "I get nervous when...",
   "The thing you do that I find secretly hilarious is...",
   "If I could give you one thing it would be...",
   "The memory of us I replay the most is...",
   "I feel closest to you when...",
   "Something that always makes me think of you is...",
   "The thing I was most wrong about when I first met you is...",
   "What I want our life to look like in 10 years is...",
   "The thing I respect most about you is...",
   "The last time I really missed you was...",
   "If you could read my mind right now you'd see...",
   "The thing that makes you different from everyone else is...",
   "My favourite small moment with you was...",
   "What I'm most grateful for about you is...",
   "If I could relive one moment with you it would be..."
  ]
 },
 "kma": {
  "id": "kma",
  "name": "Kiss, Marry, Avoid",
  "type": "kma",
  "prompts": [
   [
    "Your partner in the 80s",
    "Your partner in the 90s",
    "Your partner in the 2000s"
   ],
   [
    "A chef who can't clean",
    "A cleaner who can't cook",
    "Someone who orders takeaway every night"
   ],
   [
    "Early bird who wakes you at 6am",
    "Night owl who keeps you up till 4am",
    "Someone who sleeps exactly 8 hours no matter what"
   ],
   [
    "The workaholic",
    "The adventurer",
    "The homebody"
   ],
   [
    "Someone who sings everywhere",
    "Someone who hums constantly",
    "Someone who whistles"
   ],
   [
    "Your partner as a lawyer",
    "Your partner as an artist",
    "Your partner as a chef"
   ],
   [
    "A person who is always cold",
    "A person who is always hot",
    "A person who is always hungry"
   ],
   [
    "Someone who never uses social media",
    "Someone who posts everything",
    "Someone who only uses LinkedIn"
   ],
   [
    "A morning person",
    "An afternoon person",
    "A night person"
   ],
   [
    "Your partner as a teenager",
    "Your partner now",
    "Your partner in 20 years"
   ],
   [
    "Someone who cries at everything",
    "Someone who never cries",
    "Someone who only cries at football"
   ],
   [
    "A person who loves surprises",
    "A person who hates surprises",
    "A person who plans everything 6 months ahead"
   ],
   [
    "Someone who reads every night",
    "Someone who games every night",
    "Someone who watches documentaries every night"
   ],
   [
    "A person who never argues",
    "A person who argues about everything",
    "A person who argues only when they're right"
   ],
   [
    "Your partner with unlimited money",
    "Your partner with unlimited time",
    "Your partner with unlimited energy"
   ],
   [
    "Someone who loves PDA",
    "Someone who hates PDA",
    "Someone who only does PDA when they're jealous"
   ],
   [
    "A person who texts back in seconds",
    "A person who texts back in days",
    "A person who only calls, never texts"
   ],
   [
    "Your partner as a doctor",
    "Your partner as a teacher",
    "Your partner as a musician"
   ],
   [
    "Someone who is always early",
    "Someone who is always late",
    "Someone who arrives exactly on time every time"
   ],
   [
    "A person who over-explains everything",
    "A person who under-explains everything",
    "A person who communicates only in memes"
   ],
   [
    "Your partner with a different accent",
    "Your partner speaking a different language",
    "Your partner with a completely different name"
   ],
   [
    "Someone who loves horror films",
    "Someone who only watches romcoms",
    "Someone who only watches documentaries"
   ],
   [
    "A person who cooks every day",
    "A person who orders in every day",
    "A person who only eats cereal"
   ],
   [
    "Your partner as a cat person",
    "Your partner as a dog person",
    "Your partner as a plant person"
   ],
   [
    "Someone who is brutally honest",
    "Someone who tells white lies to protect feelings",
    "Someone who avoids all difficult conversations"
   ]
  ]
 },
 "unpopular": {
  "id": "unpopular",
  "name": "Unpopular Opinions",
  "type": "unpopular",
  "prompts": []
 },
 "mostlikely": {
  "id": "mostlikely",
  "name": "Most Likely To",
  "type": "mostlikely",
  "prompts": [
   "Most likely to cry at a Disney film",
   "Most likely to get lost with Google Maps open",
   "Most likely to start a business",
   "Most likely to befriend a stranger on a flight",
   "Most likely to stay up until 4am for no reason",
   "Most likely to go viral on TikTok",
   "Most likely to move to another country on a whim",
   "Most likely to win an argument they're actually wrong about",
   "Most likely to spend their last money on food",
   "Most likely to become famous",
   "Most likely to forget an anniversary",
   "Most likely to impulse buy something ridiculous",
   "Most likely to cry at an advert",
   "Most likely to talk to animals like they understand",
   "Most likely to be on a reality TV show",
   "Most likely to have a secret talent nobody knows about",
   "Most likely to fall asleep during a film",
   "Most likely to be the loudest person in a restaurant",
   "Most likely to apologise first after an argument",
   "Most likely to know everyone at a party",
   "Most likely to give the best advice",
   "Most likely to panic at the last minute",
   "Most likely to try an extreme sport",
   "Most likely to accidentally start a rumour",
   "Most likely to be a morning person in 10 years",
   "Most likely to write a book",
   "Most likely to adopt five pets",
   "Most likely to learn a random skill just for fun",
   "Most likely to be overdressed for a casual event",
   "Most likely to make friends with the elderly neighbour",
   "Most likely to forget where they put their phone while holding it",
   "Most likely to laugh at the wrong moment",
   "Most likely to quote a film in a serious conversation",
   "Most likely to survive a zombie apocalypse",
   "Most likely to become a morning person",
   "Most likely to end up on the news",
   "Most likely to give a speech at a stranger's wedding",
   "Most likely to invent something",
   "Most likely to still be dancing at the end of a party",
   "Most likely to have the most children"
  ]
 },
 "scenario": {
  "id": "scenario",
  "name": "Scenario Spinner",
  "type": "scenario",
  "prompts": [
   "You wake up and you've swapped bodies with your partner for 24 hours. What's the first thing you do?",
   "You win £50,000 but you have to spend it all in 48 hours. What do you buy?",
   "You can only eat one cuisine for the rest of your life. What is it and why?",
   "You're offered a role in a film but you have to move to another country for 6 months. Do you take it?",
   "Your partner's family doesn't like you for no real reason. How do you handle it?",
   "You find out your best friend has been talking badly about your relationship. What do you do?",
   "You can be famous for one thing. What is it?",
   "You wake up 10 years in the future. What's the first thing you check?",
   "You can only keep 3 apps on your phone. Which ones?",
   "You're given one superpower but your partner gets the opposite. What do you pick?",
   "You have to leave your country tomorrow and never return. Where do you go?",
   "You can bring one person from history to dinner. Who and what do you ask them?",
   "You're given a week completely alone with no responsibilities. What do you do?",
   "You can change one decision you made in the last 5 years. What is it?",
   "You wake up and social media has been deleted forever. How does your life change?",
   "You can only listen to one album for the rest of your life. What is it?",
   "You're told you have to change careers tomorrow. What do you do?",
   "You win a free trip anywhere in the world but you have to leave in 2 hours. Where do you go?",
   "You can make one thing permanently free for everyone in the world. What is it?",
   "You can speak every language fluently but lose the ability to use technology. Worth it?",
   "You're given a TV show with unlimited budget. What is it about?",
   "You can relive one day of your life with full memory of everything that happens. Which day?",
   "You have to rename yourself. What do you choose?",
   "You can only wear one colour for the rest of your life. What do you pick?",
   "You're offered to know exactly when you'll die. Do you want to know?",
   "You have to delete all photos on your phone except 5. Which 5 do you keep?",
   "You can add one subject to every school curriculum worldwide. What is it?",
   "You wake up and you're the most famous person in the world. What's your first move?",
   "You find a bag with £100,000 cash and no ID inside. What do you do?",
   "You can live in any era of history for one year. When do you go and why?",
   "You have 24 hours to do anything you want with no consequences. What happens?",
   "You can only watch films from one decade for the rest of your life. Which decade?",
   "You're given the ability to talk to animals. What's the first animal you speak to?",
   "You have to teach a class on something tomorrow with no preparation. What's the subject?",
   "You can instantly master one skill. What do you choose?"
  ]
 },
 "redgreen": {
  "id": "redgreen",
  "name": "Red Flag or Green Flag",
  "type": "redgreen",
  "prompts": [
   "Someone who has no friends from childhood",
   "A person who is very close to their ex",
   "Someone who splits every bill exactly, always",
   "A person who cries easily at films",
   "Someone who has never been in a long-term relationship",
   "A person who talks to their parents every single day",
   "Someone who doesn't use social media at all",
   "A person who is always the last to reply to messages",
   "Someone who has a very regimented daily routine",
   "A person who is very close to their family",
   "Someone who always needs to be right",
   "A person who has a lot of friends of the opposite gender",
   "Someone who never posts their partner on social media",
   "A person who always posts their partner on social media",
   "Someone who still talks to every ex",
   "A person who doesn't drink alcohol at all",
   "Someone who loves to be the centre of attention",
   "A person who hates surprises",
   "Someone who still lives with their parents at 30",
   "A person who has never had their heart broken",
   "Someone who is best friends with their boss",
   "A person who never apologises first",
   "Someone who always apologises even when they're right",
   "A person who loves planning everything in advance",
   "Someone who hates making plans and prefers to be spontaneous always",
   "A person who cooks elaborate meals for themselves when alone",
   "Someone who doesn't have any hobbies outside of work",
   "A person who has very strong opinions about everything",
   "Someone who has no opinions about anything",
   "A person who is extremely close to their siblings",
   "Someone who tracks their calories every single day",
   "A person who has never lived alone",
   "Someone who talks about their therapist constantly",
   "A person who has never been to therapy",
   "Someone who reads self-help books obsessively",
   "A person who spends a lot of money on their appearance",
   "Someone who saves every single penny and never spends on fun",
   "A person who changes their mind about big life decisions frequently",
   "Someone who is extremely independent and rarely asks for help",
   "A person who needs constant reassurance"
  ]
 },
 "assumptions": {
  "id": "assumptions",
  "name": "Assumptions",
  "type": "assumptions",
  "prompts": [
   "I think your biggest insecurity is...",
   "I think you secretly want to...",
   "I think you find it hard to...",
   "I think the thing you're most proud of is...",
   "I think your love language is actually...",
   "I think the thing you want most right now is...",
   "I think you pretend to be okay when...",
   "I think the thing you miss most is...",
   "I think you're most afraid of...",
   "I think what you need more of in your life is...",
   "I think the thing you judge people for most is...",
   "I think your happiest memory is...",
   "I think the thing you find hardest to say out loud is...",
   "I think you feel most yourself when...",
   "I think what you want from me that you haven't asked for is..."
  ]
 }
};
