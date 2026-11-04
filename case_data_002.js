/* =========================================================
   CASEFILE — Case Data: CASE-002 "The Empty Cage"
   A shorter, lighter case. A missing parrot. Three suspects.
   Humorous but not silly. Requires reputation to unlock.
   ========================================================= */

'use strict';

const CASE_DATA_002 = {

  id: 'case_002',
  code: 'CASE-002',
  title: 'The Empty Cage',
  client: 'Mrs. Petrov',
  unlockReputation: 10,
  brief: 'Mrs. Petrov\'s prize parrot, Picasso, has vanished from her apartment. She is offering $200 to find him. Mrs. Petrov has mentioned, several times, that the parrot is worth $1,500. She would like you to ignore that detail and focus on the parrot.',

  locations: [
    {
      id: 'loc_petrov_apt',
      name: 'Mrs. Petrov\'s Apartment',
      tagline: 'Fourth floor, corner unit. Smells faintly of birdseed and lavender.',
      unlockRequires: []
    },
    {
      id: 'loc_hallway',
      name: 'The Building Hallway',
      tagline: 'Chipped green paint, one flickering light, and three very nosy neighbors.',
      unlockRequires: []
    }
  ],

  objects: [
    {
      id: 'obj_cage',
      location: 'loc_petrov_apt',
      name: 'The empty cage',
      description: 'A brass cage, big enough for a small eagle. The door is open. There is no sign of a struggle.',
      yield: 'ev_002_cage'
    },
    {
      id: 'obj_window',
      location: 'loc_petrov_apt',
      name: 'The balcony door',
      description: 'Slightly ajar. Mrs. Petrov swears she keeps it closed. She also swears she feeds Picasso at exactly 7:15 AM, and there is birdseed on the floor.',
      yield: 'ev_002_window'
    },
    {
      id: 'obj_petrov_purse',
      location: 'loc_petrov_apt',
      name: 'Mrs. Petrov\'s handbag',
      description: 'Left on the kitchen counter. Inside: a receipt from a pet store for "one (1) parrot, premium, hand-raised" dated five years ago, and a paperback about parrot training.',
      yield: 'ev_002_petrov_receipt'
    },
    {
      id: 'obj_balcony_feathers',
      location: 'loc_hallway',
      name: 'Feathers near the balcony',
      description: 'Three small green feathers on the hallway floor near the balcony door. Picasso is, according to Mrs. Petrov, "green, mostly."',
      yield: 'ev_002_feathers'
    },
    {
      id: 'obj_window_box',
      location: 'loc_hallway',
      name: 'The window box',
      description: 'A terra-cotta window box, two doors down from Mrs. Petrov. Somebody has clearly been sitting in it. Recently.',
      yield: 'ev_002_window_box'
    },
    {
      id: 'obj_hall_table',
      location: 'loc_hallway',
      name: 'The hall table',
      description: 'A wobbly table by the elevator. Somebody left their phone on it. The phone is unlocked and, unfortunately, mid-conversation with someone named "Steve."',
      yield: 'ev_002_texts'
    }
  ],

  evidence: [
    {
      id: 'ev_002_cage',
      name: 'The Empty Cage',
      foundAt: 'loc_petrov_apt',
      category: 'document',
      description: 'A brass cage, door open, no signs of forced entry. The parrot was either let out or got himself out.',
      relevance: 'If a thief broke in, there would be signs. There are none. Picasso was let out, not taken.',
      linksTo: [
        { with: 'ev_002_window', reveals: 'The cage door is open and the balcony door is ajar. Picasso did not fly out — he was let out. And then he walked.' }
      ]
    },
    {
      id: 'ev_002_window',
      name: 'The Balcony Door',
      foundAt: 'loc_petrov_apt',
      category: 'document',
      description: 'Slightly ajar, despite Mrs. Petrov insisting she keeps it closed. Birdseed scattered on the floor nearby.',
      relevance: 'Someone opened the door. The birdseed was likely bait.',
      linksTo: []
    },
    {
      id: 'ev_002_petrov_receipt',
      name: 'Mrs. Petrov\'s Receipt',
      foundAt: 'loc_petrov_apt',
      category: 'document',
      description: 'A pet store receipt for one "premium, hand-raised" parrot. Dated five years ago. It cost her $1,500.',
      relevance: 'Mrs. Petrov didn\'t make up the value. The parrot really is expensive.',
      linksTo: []
    },
    {
      id: 'ev_002_feathers',
      name: 'Feathers Near the Balcony',
      foundAt: 'loc_hallway',
      category: 'photo',
      description: 'Three small green feathers on the hallway floor. Picasso is green. The neighbor in 4B has a green scarf, but the feathers are not from a scarf.',
      relevance: 'The parrot went down the hall, not out the window.',
      linksTo: [
        { with: 'ev_002_window_box', reveals: 'Picasso made it from the balcony to the hallway, and then to the window box. He was walking, not flying. Someone put him there.' }
      ]
    },
    {
      id: 'ev_002_window_box',
      name: 'The Window Box',
      foundAt: 'loc_hallway',
      category: 'photo',
      description: 'A terra-cotta window box with fresh parrot droppings inside. Somebody, at some point, put a parrot in here.',
      relevance: 'Picasso was moved here. Someone found him and hid him.',
      linksTo: []
    },
    {
      id: 'ev_002_texts',
      name: 'The Neighbor\'s Phone',
      foundAt: 'loc_hallway',
      category: 'statement',
      description: 'A phone left on the hall table, unlocked, mid-text with someone named "Steve." The last message reads: "I didn\'t mean to let it out, Steve. I just wanted it to shut up for one night. Now it\'s in the window box and Mrs. P is going to kill me."',
      relevance: 'The neighbor in 4B let the parrot out. Not to steal him. To get some sleep. And then panicked.',
      linksTo: [
        { with: 'ev_002_window_box', reveals: 'The window box is where the neighbor hid Picasso. The phone confirms she was the one who moved him there — and why.' }
      ]
    }
  ],

  characters: [
    {
      id: 'char_petrov',
      name: 'Mrs. Petrov',
      role: 'Client',
      intro: 'An older woman with strong opinions about parrots, and about the state of modern society.',
      portraitBase: 'petrov',
      dialogue: [
        {
          id: 'petrov_intro',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Mrs. Petrov: "Picasso is the finest parrot in this building. Possibly in this city. I have had him five years. I feed him at 7:15. He does not leave the cage at 7:16. You can see the problem."'
        },
        {
          id: 'petrov_value',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Mrs. Petrov: "He cost $1,500. I have mentioned this. I am not mentioning it for any particular reason. I am simply mentioning it. $1,500."'
        },
        {
          id: 'petrov_suspects',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Mrs. Petrov: "The super is useless. The woman in 4B plays music at all hours. My brother-in-law has always wanted a parrot. That is three suspects for you. I do not like any of them."'
        },
        {
          id: 'petrov_admission',
          requiresEvidence: ['ev_002_texts'],
          givesEvidence: [],
          text: 'Mrs. Petrov: "The woman in 4B? Well. She has been complaining about Picasso for months. I do not blame her for the noise. I do blame her for taking my parrot. But — perhaps I will not call the police. Perhaps I will simply glare at her for the rest of her life. In this building."'
        }
      ]
    },
    {
      id: 'char_neighbor',
      name: 'The Neighbor in 4B',
      role: 'Suspect — exhausted',
      intro: 'A tired-looking woman in her forties who has clearly not slept well in weeks.',
      portraitBase: 'neighbor',
      dialogue: [
        {
          id: 'neighbor_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Neighbor: "I didn\'t do anything. And I don\'t appreciate being questioned. Ask the super. He has keys to every apartment in this building. Ask him how my parrot-related problems are his business."'
        },
        {
          id: 'neighbor_deflect',
          requiresEvidence: ['ev_002_texts'],
          givesEvidence: [],
          text: 'Neighbor: "That is not my phone. Well. It is my phone. That is a private conversation. That is a conversation between me and Steve, and Steve is — Steve is my brother. This is a family matter."'
        },
        {
          id: 'neighbor_confession',
          requiresEvidence: ['ev_002_window_box'],
          givesEvidence: [],
          text: 'Neighbor: "Fine. Fine. I opened the balcony door because I hadn\'t slept in nine days. Just for a few minutes. I thought he\'d fly out and be gone and I\'d feel awful and then I\'d feel better. But he didn\'t fly out. He walked. He walked down the hall. He got into the window box. I found him there at 2 AM and I couldn\'t just leave him. So I left him. I\'m sorry."'
        }
      ]
    },
    {
      id: 'char_super',
      name: 'The Super',
      role: 'Suspect — genuinely helpful',
      intro: 'A man in his sixties with a large ring of keys and an expression that suggests he has seen everything.',
      portraitBase: 'super',
      dialogue: [
        {
          id: 'super_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Super: "Fourth floor, parrot. Yeah, I heard about that. Nice bird. Loud bird. I got a key to every apartment in the building, but I don\'t go in unless I gotta. Sunday night I was in the basement fixing the boiler. You can ask the plumber."'
        },
        {
          id: 'super_about_neighbor',
          requiresEvidence: ['ev_002_feathers'],
          givesEvidence: [],
          text: 'Super: "Woman in 4B? She\'s been on the warpath about noise. I heard her on the phone with somebody — said if she had a way of making that bird disappear, she\'d do it. She meant it. But she\'s not a thief. She\'s just tired."'
        }
      ]
    }
  ],

  truth: {
    culpritId: 'char_neighbor',
    methodOptions: [
      { id: 'accidental_release', label: 'She opened the balcony door to get some sleep — then panicked and hid the parrot in the window box', correct: true },
      { id: 'theft_ransom',       label: 'She stole the parrot and planned to sell him',                                        correct: false },
      { id: 'super_key_access',   label: 'She used the super\'s keys to enter the apartment',                                    correct: false }
    ],
    proofSet: [
      'ev_002_cage', 'ev_002_window', 'ev_002_feathers',
      'ev_002_window_box', 'ev_002_texts'
    ],
    resolution: {
      correct: 'You found Picasso in the window box, alive, hungry, and unbothered. The neighbor in 4B opened the balcony door because she had not slept in nine days. She did not steal the parrot. She let him out. She found him in the window box at 2 AM and, panicking, left him there. Mrs. Petrov has decided not to press charges — she plans to "glare at her for the rest of her life, in this building." You collected your $200. Picasso collected a strawberry.',
      wrongCulprit: 'You named the wrong person. The parrot wasn\'t stolen — it was let out by the neighbor in 4B, who was just trying to sleep. Mrs. Petrov has called you "an expensive mistake." You still found the parrot, but your reputation has taken a small hit. The parrot is fine. The parrot is very fine. The parrot is, in fact, eating a strawberry.'
    }
  },

  rewardTiers: [
    { id: 'perfect',     label: 'Case solved — the parrot is safe', reputation: 8,  money: 200, xp: 60,
      check: { culprit: true, method: true, minProof: 4 } },
    { id: 'solid',       label: 'Case solved',                       reputation: 5,  money: 150, xp: 40,
      check: { culprit: true, method: true, minProof: 2 } },
    { id: 'thin',        label: 'Case solved — the parrot is fine',  reputation: 2,  money: 100, xp: 25,
      check: { culprit: true, method: true, minProof: 0 } },
    { id: 'wrongMethod', label: 'Case closed — incomplete',          reputation: 1,  money: 60,  xp: 15,
      check: { culprit: true, method: false, minProof: 0 } },
    { id: 'wrongCulprit', label: 'Case closed — wrong conclusion',    reputation: -3, money: 30,  xp: 5,
      check: { culprit: false, method: false, minProof: 0 } }
  ]
};