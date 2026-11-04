/* =========================================================
   CASEFILE — Case Data: CASE-004 "The Quiet Room"
   A murder case. The client hires you to find a missing
   roommate — who is already dead, and the client knows.
   ========================================================= */

'use strict';

const CASE_DATA_004 = {

  id: 'case_004',
  code: 'CASE-004',
  title: 'The Quiet Room',
  client: 'Mira Holloway',
  unlockReputation: 30,
  brief: 'Mira Holloway hires you to find her missing roommate, Juno. Four days ago Juno stopped coming home. This morning the police found a body in the river. Mira doesn\'t know yet. Mira hired you before that. Something is wrong here.',

  locations: [
    {
      id: 'loc_apartment',
      name: 'The Shared Apartment',
      tagline: 'Two young women, one lease, one kitchen counter where something happened.',
      unlockRequires: []
    },
    {
      id: 'loc_river',
      name: 'The Riverbank',
      tagline: 'Where the body was found. Mud, reeds, and a walkway nobody uses at night.',
      unlockRequires: []
    },
    {
      id: 'loc_tomas_flat',
      name: 'Tomas\'s Flat',
      tagline: 'The ex-boyfriend\'s place. Recently single, recently angry.',
      unlockRequires: ['ev_004_apartment_key']
    }
  ],

  objects: [
    {
      id: 'obj_004_keys',
      location: 'loc_apartment',
      name: 'Two sets of keys',
      description: 'Juno\'s keys are on the kitchen counter. Mira\'s keys are in her purse. But Mira also has a second set — a spare Juno set — that she hasn\'t mentioned.',
      yield: 'ev_004_apartment_key'
    },
    {
      id: 'obj_004_kitchen',
      location: 'loc_apartment',
      name: 'The kitchen counter',
      description: 'Clean. Too clean. Freshly wiped — no crumbs, no dust, no rings from coffee cups. Someone scrubbed it in the last few days.',
      yield: 'ev_004_clean_counter'
    },
    {
      id: 'obj_004_bank_letters',
      location: 'loc_apartment',
      name: 'Juno\'s bank letters',
      description: 'A stack of statements in Juno\'s drawer. Multiple withdrawals, four or five a month, in small amounts. Juno was losing money for six months.',
      yield: 'ev_004_money_trail'
    },
    {
      id: 'obj_004_river_mud',
      location: 'loc_river',
      name: 'Footprints in the mud',
      description: 'Two sets of prints near the reeds. One large, one smaller. The smaller set leads back to the walkway. The larger set goes into the reeds and doesn\'t come out.',
      yield: 'ev_004_river_mud'
    },
    {
      id: 'obj_004_camera',
      location: 'loc_river',
      name: 'Security camera',
      description: 'A corner camera pointing at the walkway. Owned by the corner shop. Footage goes back two weeks.',
      yield: 'ev_004_camera_footage',
      needsFirst: ['ev_004_river_mud']
    },
    {
      id: 'obj_004_tomas_kettle',
      location: 'loc_tomas_flat',
      name: 'The kettle',
      description: 'Tomas offered tea the moment you walked in. The kettle is still warm. He was expecting someone.',
      yield: null
    },
    {
      id: 'obj_004_tomas_alibi',
      location: 'loc_tomas_flat',
      name: 'Tomas\'s work badge',
      description: 'A badged entry log for the night Juno disappeared. Tomas was clocked in at work from 8 PM to 6 AM. His alibi holds.',
      yield: 'ev_004_tomas_alibi',
      needsFirst: ['ev_004_camera_footage']
    },
    {
      id: 'obj_004_mira_purse',
      location: 'loc_apartment',
      name: 'Mira\'s purse',
      description: 'Left on the couch. Inside, a crumpled receipt for a car wash — dated the morning after the night Juno disappeared.',
      yield: 'ev_004_mira_receipt',
      needsFirst: ['ev_004_money_trail']
    }
  ],

  evidence: [
    {
      id: 'ev_004_apartment_key',
      name: 'The Spare Key',
      foundAt: 'loc_apartment',
      category: 'document',
      description: 'Mira has two sets of keys — her own, and a second Juno set she keeps "for emergencies." She didn\'t mention having it.',
      relevance: 'Mira could get into Juno\'s things anytime. She had access to everything.',
      linksTo: [
        { with: 'ev_004_mira_receipt', reveals: 'Mira had a spare key, and she used her car the morning after Juno disappeared. The two facts don\'t prove she did anything — but they mean she could have.' }
      ]
    },
    {
      id: 'ev_004_clean_counter',
      name: 'The Clean Counter',
      foundAt: 'loc_apartment',
      category: 'document',
      description: 'The kitchen counter has been scrubbed recently — fresh tracks in the wood grain, no dust. Someone cleaned it in the last few days.',
      relevance: 'Something happened there. Someone wanted it gone.',
      linksTo: [
        { with: 'ev_004_camera_footage', reveals: 'The camera footage from the night Juno disappeared shows Mira carrying something heavy out the front door of the building. She looked around first. She didn\'t see the camera.' }
      ]
    },
    {
      id: 'ev_004_money_trail',
      name: 'Juno\'s Bank Statements',
      foundAt: 'loc_apartment',
      category: 'document',
      description: 'Juno had been losing money for six months — small withdrawals, four to five times a month. She never reported it. She must have suspected someone close to her.',
      relevance: 'Someone in Juno\'s life was stealing from her. Small enough to hide, but consistent.',
      linksTo: [
        { with: 'ev_004_mira_receipt', reveals: 'Mira\'s bank records, cross-referenced with Juno\'s, show matching deposits. Mira was the one taking the money — small amounts, on the same days Juno reported withdrawals.' }
      ]
    },
    {
      id: 'ev_004_river_mud',
      name: 'Footprints at the River',
      foundAt: 'loc_river',
      category: 'photo',
      description: 'Two sets of prints in the mud near the reeds. One larger (someone carrying weight), one smaller. The larger set goes into the reeds and doesn\'t come back out the same way.',
      relevance: 'Someone carried something into the reeds. They came back alone.',
      linksTo: [
        { with: 'ev_004_camera_footage', reveals: 'The camera footage from the riverside shop shows a small woman in a dark coat leaving the walkway toward the reeds at 2:47 AM — the same night Juno disappeared. She was alone. She was carrying a bag.' }
      ]
    },
    {
      id: 'ev_004_camera_footage',
      name: 'The Corner Shop Footage',
      foundAt: 'loc_river',
      category: 'photo',
      description: 'Security footage from the night Juno disappeared. Timestamp 2:47 AM. A small figure in a dark coat walks toward the reeds with something over their shoulder. They don\'t come back on camera.',
      relevance: 'Someone was at the river in the middle of the night. They were carrying something. They didn\'t leave the way they came.',
      linksTo: [
        { with: 'ev_004_mira_receipt', reveals: 'The camera timestamp is 2:47 AM. The receipt from Mira\'s car wash is 4:15 AM. Same night. Mira washed her car within 90 minutes of someone leaving the walkway toward the reeds.' }
      ]
    },
    {
      id: 'ev_004_tomas_alibi',
      name: 'Tomas\'s Alibi',
      foundAt: 'loc_tomas_flat',
      category: 'document',
      description: 'Tomas\'s work badge log shows him clocked in at his office from 8 PM to 6 AM on the night Juno disappeared. Multiple coworkers confirm.',
      relevance: 'Tomas was at work. He didn\'t leave. He didn\'t kill her.',
      linksTo: []
    },
    {
      id: 'ev_004_mira_receipt',
      name: 'The Car Wash Receipt',
      foundAt: 'loc_apartment',
      category: 'document',
      description: 'A crumpled receipt in Mira\'s purse. "24-hour car wash, 4:15 AM." Dated the morning after Juno disappeared.',
      relevance: 'Mira washed her car at 4 in the morning. That is not normal behaviour.',
      linksTo: []
    },
    {
      id: 'ev_004_dominik_statement',
      name: 'Dominik\'s Statement',
      foundAt: 'interview',
      category: 'statement',
      description: 'Dominik was staying in the apartment for two weeks before Juno died — broke, sleeping on the couch. He left the apartment at 9 PM the night she disappeared. He didn\'t come back until the next day.',
      relevance: 'Dominik was in the apartment and left at the right time. He has motive. He looks guilty.',
      linksTo: [
        { with: 'ev_004_tomas_alibi', reveals: 'The camera footage clears Dominik for the river — but it puts Mira there. Dominik left at 9 PM, but the walkway footage is 2:47 AM. Mira wasn\'t at the apartment at 2:47 AM. She was at the river.' }
      ]
    }
  ],

  characters: [
    {
      id: 'char_mira',
      name: 'Mira Horáková',
      role: 'Client — Juno\'s roommate',
      intro: 'Mira is composed in a way that doesn\'t quite fit the situation. She should be more upset. She\'s handling it like a business meeting.',
      portraitBase: 'mira',
      dialogue: [
        {
          id: 'mira_intro',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Mira: "Juno didn\'t come home four days ago. She has family up north — I thought she went there. I called her phone — straight to voicemail. I hired you because the police won\'t do anything until it\'s been a full week."'
        },
        {
          id: 'mira_about_juno',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Mira: "Juno and I were fine. We were roommates. We split the rent. She was seeing this guy Tomas, they broke up two months ago. She was a bit of a mess after. That\'s — that\'s the whole story."'
        },
        {
          id: 'mira_about_money',
          requiresEvidence: ['ev_004_money_trail'],
          givesEvidence: [],
          text: 'Mira: "Money? I don\'t know anything about her money. We split the bills and that was it. She never said anything to me." (A pause. She hasn\'t blinked in a while.) "If something was wrong, she would have told me."'
        },
        {
          id: 'mira_about_car',
          requiresEvidence: ['ev_004_mira_receipt'],
          givesEvidence: [],
          text: 'Mira: "The car wash? I couldn\'t sleep. I — I go for drives when I can\'t sleep. I washed the car because it was dirty. That\'s it. That\'s the whole thing."'
        },
        {
          id: 'mira_shut_down',
          requiresEvidence: ['ev_004_camera_footage'],
          givesEvidence: [],
          text: 'Mira: "I think — I think maybe you should stop. I don\'t need this anymore. Juno will come back. She always does. I\'ll pay you for your time, but — I don\'t want to keep looking."'
        },
        {
          id: 'mira_break',
          requiresEvidence: ['ev_004_mira_receipt', 'ev_004_money_trail', 'ev_004_camera_footage'],
          givesEvidence: [],
          text: 'Mira: "You\'re looking at me like — like you know something. Do you know something?" (She stands up.) "I have to go. I have to — I can\'t do this right now." (She leaves the room. She doesn\'t come back.)'
        }
      ]
    },
    {
      id: 'char_tomas',
      name: 'Tomas Reyes',
      role: 'Juno\'s ex-boyfriend',
      intro: 'Tomas is angry in a way that reads as guilt until you notice it isn\'t aimed at you — it\'s aimed at himself.',
      portraitBase: 'tomas',
      dialogue: [
        {
          id: 'tomas_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Tomas: "I broke up with her. Not the other way around. If you\'re here because somebody told you I hurt her, that somebody is lying. I don\'t hurt people. I leave them. That\'s different."'
        },
        {
          id: 'tomas_about_last_night',
          requiresEvidence: [],
          givesEvidence: ['ev_004_tomas_alibi'],
          text: 'Tomas: "The night she disappeared? I was at work. I work nights. The badge log will show it. I\'ve got three guys who can confirm. I wasn\'t — I wasn\'t anywhere near the apartment."'
        },
        {
          id: 'tomas_about_mira',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Tomas: "Mira? I never liked her. There was something — I don\'t know how to say it. She was too calm. Juno would get upset about something, and Mira would just. Handle it. Smile. It made my skin crawl."'
        },
        {
          id: 'tomas_about_dominik',
          requiresEvidence: ['ev_004_dominik_statement'],
          givesEvidence: [],
          text: 'Tomas: "Dominik was crashing at the apartment? Juno never told me that. She would have told me. She told me everything — after. After we broke up, she still told me everything."'
        }
      ]
    },
    {
      id: 'char_adel',
      name: 'Ada Kessler',
      role: 'Juno\'s coworker',
      intro: 'Adéla works in the same office as Juno. She\'s the one person who isn\'t surprised by any of this.',
      portraitBase: 'adel',
      dialogue: [
        {
          id: 'adel_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Adéla: "Juno was upset for months. She didn\'t say about what. She came into work one day and said — she said \'someone\'s been taking my money.\' I said she should go to the police. She said she couldn\'t. She said it was someone she knew."'
        },
        {
          id: 'adel_about_mira',
          requiresEvidence: ['ev_004_money_trail'],
          givesEvidence: [],
          text: 'Adéla: "I only met Mira once. She came to the office to pick up Juno\'s jacket. She was very — she was very polite. Juno didn\'t talk to her about anything personal while she was there. She talked to me about money. She was worried about money. And Mira was right there."'
        },
        {
          id: 'adel_about_dominik',
          requiresEvidence: [],
          givesEvidence: ['ev_004_dominik_statement'],
          text: 'Adéla: "Dominik? I don\'t know who that is. Juno mentioned a cousin of Mira\'s staying with them for a while. She said he was — she said he was \'a lot.\' She was being polite. I don\'t think she liked him."'
        }
      ]
    },
    {
      id: 'char_dominik',
      name: 'Dominik Hale',
      role: 'Mira\'s cousin',
      intro: 'Dominik is jumpy. He\'s broke and he knows he looks like a suspect.',
      portraitBase: 'dominik',
      dialogue: [
        {
          id: 'dominik_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Dominik: "I was staying at the apartment. For a few weeks. Mira said it was fine. I didn\'t — I didn\'t do anything. I left that night. I went to a friend\'s place. I can prove it."'
        },
        {
          id: 'dominik_about_night',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Dominik: "The night she disappeared? I left around nine. I went to my friend Jake\'s. He\'ll tell you. I stayed there the whole night. I didn\'t come back until the next afternoon."'
        },
        {
          id: 'dominik_about_mira',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Dominik: "Mira? Look, Mira\'s — she\'s fine. She helped me out. I don\'t want to — I don\'t want to say anything about Mira. She\'s family. She\'s the only person who\'s been kind to me since I lost my job."'
        }
      ]
    },
    {
      id: 'char_bauer',
      name: 'Mr. Bauer',
      role: 'Building landlord',
      intro: 'Mr. Bauer has lived in this building for forty years. He knows everything. He also called the police the moment he saw something at the river — which is suspicious, if you don\'t think about it.',
      portraitBase: 'bauer',
      dialogue: [
        {
          id: 'bauer_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Bauer: "I keep a key to every apartment. Not because I\'m nosy. Because when a pipe bursts at 3 AM, someone has to open the door. I don\'t use them otherwise. I don\'t."'
        },
        {
          id: 'bauer_about_river',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Bauer: "I walk by the river every morning. Every morning, for forty years. This morning there was something in the reeds. I called the police. I didn\'t know what it was. I just knew it didn\'t belong there."'
        },
        {
          id: 'bauer_about_camera',
          requiresEvidence: ['ev_004_camera_footage'],
          givesEvidence: [],
          text: 'Bauer: "The camera at the corner shop? It\'s been broken for a month. I told the owner. He didn\'t fix it. So the footage from two weeks ago — that\'s not from the shop. The only other camera near the river is the one on the apartment building. The one that points at the walkway."'
        }
      ]
    }
  ],

  truth: {
    culpritId: 'char_mira',
    methodOptions: [
      { id: 'argument_over_money', label: 'She was taking Juno\'s money for months. Juno found out and confronted her. Mira pushed her during a fight.', correct: true },
      { id: 'planned_murder',      label: 'She planned to kill Juno to take over the lease and stop the money trail.',                                          correct: false },
      { id: 'accident_coverup',    label: 'Juno died accidentally and Mira panicked and hid the body to protect herself.',                                       correct: false }
    ],
    proofSet: [
      'ev_004_money_trail', 'ev_004_mira_receipt', 'ev_004_camera_footage', 'ev_004_clean_counter'
    ],
    resolution: {
      correct: 'Mira killed Juno. She had been stealing from her for six months — small amounts, taken while Juno was out. Juno found out two weeks ago and confronted her. There was a fight. Mira pushed her. Juno hit her head on the kitchen counter. She didn\'t get up. Mira cleaned the counter, wrapped the body, drove to the river at 2:47 AM, and dumped her. Then she washed her car at 4:15 and hired you four days later — as a precaution, so nobody could say she hadn\'t tried. When you told her what you knew, she didn\'t deny it. She was arrested an hour later. Juno is dead. The case is closed. You don\'t feel like you solved anything.',
      wrongCulprit: 'You got it wrong. Mira killed Juno — not the person you accused. She was stealing from Juno for six months. Juno found out. They fought. Mira pushed her. She cleaned the counter, wrapped the body, and drove it to the river. Then she hired you to look innocent. She\'s in custody now, but not because of your accusation. Someone else got there first. The case is on your record, but you didn\'t solve it. That\'s going to bother you for a while.'
    }
  },

  rewardTiers: [
    { id: 'perfect',     label: 'Case solved — the killer is in custody', reputation: 22, money: 700, xp: 150,
      check: { culprit: true, method: true, minProof: 3 } },
    { id: 'solid',       label: 'Case solved',                             reputation: 16, money: 500, xp: 100,
      check: { culprit: true, method: true, minProof: 2 } },
    { id: 'thin',        label: 'Case closed — thin evidence',             reputation: 8,  money: 300, xp: 60,
      check: { culprit: true, method: true, minProof: 0 } },
    { id: 'wrongMethod', label: 'Case closed — method unclear',            reputation: 5,  money: 200, xp: 40,
      check: { culprit: true, method: false, minProof: 0 } },
    { id: 'wrongCulprit', label: 'Case closed — wrong conclusion',         reputation: -8, money: 100, xp: 15,
      check: { culprit: false, method: false, minProof: 0 } }
  ]
};