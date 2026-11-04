/* =========================================================
   CASEFILE — Case Data: CASE-003 "The Photograph"
   A missing-person case with a twist. The client thinks her
   sister is in danger. The truth is more complicated.
   ========================================================= */

'use strict';

const CASE_DATA_003 = {

  id: 'case_003',
  code: 'CASE-003',
  title: 'The Photograph',
  client: 'Elise Varga',
  unlockReputation: 20,
  brief: 'Elise Varga hires you to find her missing twin sister, Iris. Everyone says Iris went on a trip. There are photos of her at the airport. But Elise is sure something is wrong — and Elise is usually right.',

  locations: [
    {
      id: 'loc_varga_home',
      name: 'The Varga Apartment',
      tagline: 'Fourth floor walkup. Cluttered, warm, and full of two sisters\' things.',
      unlockRequires: []
    },
    {
      id: 'loc_coffee_shop',
      name: 'Cafe Near the Airport',
      tagline: 'Elise\'s friend works here. The coffee is bad. The information is good.',
      unlockRequires: []
    },
    {
      id: 'loc_iris_apartment',
      name: 'Iris\'s Apartment',
      tagline: 'Locked, but Elise has a key. She shouldn\'t have brought it.',
      unlockRequires: ['ev_003_photo']
    }
  ],

  objects: [
    {
      id: 'obj_003_photo',
      location: 'loc_varga_home',
      name: 'The photograph',
      description: 'A photo of Iris at an airport, smiling with a coffee cup. The timestamp on the back reads "March 15."',
      yield: 'ev_003_photo'
    },
    {
      id: 'obj_003_elise_phone',
      location: 'loc_varga_home',
      name: 'Elise\'s phone',
      description: 'Left on the kitchen counter. Not locked. Recent calls to Iris — the last one was the day before Iris "left."',
      yield: 'ev_003_elise_calls',
      needsFirst: ['ev_003_photo']
    },
    {
      id: 'obj_003_barista',
      location: 'loc_coffee_shop',
      name: 'The barista (Elise\'s friend)',
      description: 'A young woman with tired eyes and a kind smile. She remembers Iris. She remembers a lot, actually.',
      yield: 'ev_003_friend_statement'
    },
    {
      id: 'obj_003_iris_apt_window',
      location: 'loc_iris_apartment',
      name: 'The apartment window',
      description: 'Frosted glass. The plant on the sill hasn\'t been watered in weeks. So Iris hasn\'t been here in weeks.',
      yield: 'ev_003_iris_empty',
      needsFirst: ['ev_003_friend_statement']
    },
    {
      id: 'obj_003_iris_laptop',
      location: 'loc_iris_apartment',
      name: 'Iris\'s laptop',
      description: 'Password is her cat\'s name — Elise guesses it on the first try. On the desktop, a single document: "Things I need to do."',
      yield: 'ev_003_iris_notes',
      needsFirst: ['ev_003_friend_statement']
    },
    {
      id: 'obj_003_cole_trail',
      location: 'loc_iris_apartment',
      name: 'The parking garage log',
      description: 'A slip of paper taped to the fridge. Cole\'s car was in the garage the night Iris disappeared.',
      yield: 'ev_003_cole_car',
      needsFirst: ['ev_003_iris_empty']
    }
  ],

  evidence: [
    {
      id: 'ev_003_photo',
      name: 'The Photograph',
      foundAt: 'loc_varga_home',
      category: 'photo',
      description: 'Iris at an airport, smiling, holding a paper coffee cup. The back reads "March 15." Elise says Iris disappeared on April 3. The photo is 19 days before she went missing.',
      relevance: 'The photo isn\'t from the trip Iris supposedly took. It\'s from an earlier one.',
      linksTo: [
        { with: 'ev_003_friend_statement', reveals: 'The friend confirms: that March 15 photo was from a weekend trip to Prague. Not the April trip. Elise is looking at the wrong photo.' }
      ]
    },
    {
      id: 'ev_003_elise_calls',
      name: 'Elise\'s Call Log',
      foundAt: 'loc_varga_home',
      category: 'statement',
      description: 'Elise called Iris the day before Iris "left." The call lasted four minutes. Elise says they didn\'t talk about the trip — but she also says she can\'t remember what they did talk about.',
      relevance: 'Elise talked to Iris the day before. She knows more than she is telling.',
      linksTo: []
    },
    {
      id: 'ev_003_friend_statement',
      name: 'The Barista\'s Statement',
      foundAt: 'loc_coffee_shop',
      category: 'statement',
      description: 'The barista says Iris came in two weeks before she disappeared and asked about a friend\'s cabin. She seemed scared. She mentioned "Cole." She didn\'t say who Cole was.',
      relevance: 'Iris was scared of someone named Cole. She made plans to go somewhere.',
      linksTo: [
        { with: 'ev_003_iris_notes', reveals: 'The laptop notes confirm it: Iris wrote "the cabin. Not the apartment. Leave the phone. Tell Lila first." Lila is the barista.' }
      ]
    },
    {
      id: 'ev_003_iris_empty',
      name: 'The Empty Apartment',
      foundAt: 'loc_iris_apartment',
      category: 'document',
      description: 'The plant on the sill is dead. Iris hasn\'t been home in weeks. But her things are still here — her clothes, her laptop, her mail uncollected in the hall.',
      relevance: 'Iris packed nothing. She left in a hurry. Or she didn\'t leave on her own.',
      linksTo: []
    },
    {
      id: 'ev_003_iris_notes',
      name: 'Iris\'s Notes',
      foundAt: 'loc_iris_apartment',
      category: 'document',
      description: 'A document on Iris\'s laptop titled "Things I need to do." The list includes: "the cabin. Not the apartment. Leave the phone. Tell Lila first. Don\'t tell Elise."',
      relevance: 'Iris left on purpose. She told her friend, not her sister. She was hiding.',
      linksTo: [
        { with: 'ev_003_cole_car', reveals: 'Iris wrote "Don\'t tell Elise" — but Cole\'s car was in the garage that night. Somebody knew where she was going. Somebody who wasn\'t Elise.' }
      ]
    },
    {
      id: 'ev_003_cole_car',
      name: 'Cole\'s Parking Log',
      foundAt: 'loc_iris_apartment',
      category: 'document',
      description: 'Cole\'s car was in the apartment parking garage on the night Iris disappeared. He lives in a different part of town. He had no reason to be there.',
      relevance: 'Cole was looking for Iris the night she left. He knew something was happening.',
      linksTo: [
        { with: 'ev_003_iris_notes', reveals: 'Iris was hiding from Cole. Her notes say "the cabin" — Cole went looking at the apartment. She was one step ahead of him.' }
      ]
    }
  ],

  characters: [
    {
      id: 'char_elise',
      name: 'Elise Varga',
      role: 'Client — Iris\'s twin sister',
      intro: 'Elise is scared. She has brought a photograph, a spare key, and a certainty that something is very wrong.',
      portraitBase: 'elise',
      dialogue: [
        {
          id: 'elise_intro',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Elise: "My sister Iris is missing. She went on a trip and she hasn\'t called and her phone is off and everyone keeps telling me she\'s fine. She is not fine. Please find her."'
        },
        {
          id: 'elise_about_cole',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Elise: "Cole is her ex. He was — difficult. Possessive. I told her to leave him months ago. She did. Or she said she did. I don\'t know if it stuck."'
        },
        {
          id: 'elise_about_photo',
          requiresEvidence: ['ev_003_photo'],
          givesEvidence: [],
          text: 'Elise: "That\'s the last photo of her. She sent it to me. I keep looking at it. She looks happy, doesn\'t she? She looks like she\'s about to get on a plane and go somewhere good."'
        },
        {
          id: 'elise_pressed',
          requiresEvidence: ['ev_003_iris_notes'],
          givesEvidence: [],
          text: 'Elise: "She wrote \'Don\'t tell Elise\'? She — she told me she was leaving Cole. She told me everything. Why would she hide from me?" (She pauses.) "Unless... she thought I\'d try to talk her out of it. Or she thought Cole would find out through me."'
        },
        {
          id: 'elise_honest',
          requiresEvidence: ['ev_003_cole_car'],
          givesEvidence: [],
          text: 'Elise: "Okay. I called her that night. The night before she left. She told me not to worry. She told me she was going to stay with a friend for a few weeks. I told her I\'d call the police if she didn\'t come back by Sunday. Maybe that\'s why she wrote \'Don\'t tell Elise.\' Maybe she thought I\'d make it worse."'
        }
      ]
    },
    {
      id: 'char_lila',
      name: 'Lila',
      role: 'Barista, Iris\'s friend',
      intro: 'Lila has been Iris\'s friend for years. She\'s been waiting for someone to ask the right questions.',
      portraitBase: 'lila',
      dialogue: [
        {
          id: 'lila_first',
          requiresEvidence: [],
          givesEvidence: ['ev_003_friend_statement'],
          text: 'Lila: "You\'re looking for Iris. I thought someone would come eventually. She came in two weeks before she left. She looked — scared. She asked about a cabin. She said she needed to get out of town for a while. She said don\'t tell Elise."'
        },
        {
          id: 'lila_about_cole',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Lila: "Cole. He used to come here looking for her. He\'d sit at that table in the corner and just watch the door. He stopped coming a few months ago. But I saw his car outside her building last week. He hasn\'t stopped."'
        },
        {
          id: 'lila_about_cabin',
          requiresEvidence: ['ev_003_iris_notes'],
          givesEvidence: [],
          text: 'Lila: "The cabin. It\'s her grandmother\'s old place, up past the reservoir. She used to go there as a kid. It\'s the only place she ever felt safe. If I were her, that\'s where I\'d be."'
        }
      ]
    },
    {
      id: 'char_cole',
      name: 'Cole Renner',
      role: 'Iris\'s ex-boyfriend',
      intro: 'Cole is polite, calm, and — when you meet him — completely aware of what you think of him.',
      portraitBase: 'cole',
      dialogue: [
        {
          id: 'cole_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Cole: "You must be the private investigator. Elise hired you, presumably. Let me save you some time: I haven\'t seen Iris in weeks. I don\'t know where she is. And — this is important — I don\'t think she\'s in danger. I think she ran away."'
        },
        {
          id: 'cole_car_pressed',
          requiresEvidence: ['ev_003_cole_car'],
          givesEvidence: [],
          text: 'Cole: "Yes, I was near her building that night. I was — I was worried about her. She hadn\'t answered my texts for a week. I wanted to make sure she was okay. I didn\'t go inside. I didn\'t know she was leaving. I still don\'t know where she went."'
        },
        {
          id: 'cole_honest',
          requiresEvidence: ['ev_003_iris_notes'],
          givesEvidence: [],
          text: 'Cole: "Fine. Fine. I knew she was leaving. She told me — two weeks before. She said she was going to a cabin, and she said if I ever came near her again she would get a restraining order. She also said — she said she forgave me. For whatever that\'s worth. I don\'t know if I believe her. But I know she meant it about the restraining order. So I stopped. I went home. That\'s the truth."'
        }
      ]
    }
  ],

  truth: {
    culpritId: 'char_cole',
    methodOptions: [
      { id: 'staged_disappearance', label: 'Iris staged her own disappearance to escape Cole. Cole was looking for her, but never found her.', correct: true },
      { id: 'kidnapping',           label: 'Cole kidnapped Iris and is hiding her.',                                            correct: false },
      { id: 'elise_lying',          label: 'Elise is lying about everything and knows exactly where Iris is.',                correct: false }
    ],
    proofSet: [
      'ev_003_photo', 'ev_003_friend_statement', 'ev_003_iris_notes',
      'ev_003_cole_car', 'ev_003_iris_empty', 'ev_003_elise_calls'
    ],
    resolution: {
      correct: 'Iris isn\'t missing. She left. She went to her grandmother\'s cabin outside the city, told her friend Lila, and specifically asked Lila not to tell Elise. Cole found out she was leaving — Iris told him herself — but he never found her. The photograph was from an earlier trip, not the day she disappeared. When you tell Elise the truth, she cries — not because Iris is gone, but because Iris is safe and didn\'t trust her with the location. "She must have thought I\'d try to talk her out of it," Elise says. "She\'s not wrong. But she\'s alive." You leave the case open. Iris is safe. That\'s what matters.',
      wrongCulprit: 'You got it wrong. Iris wasn\'t kidnapped, and Elise wasn\'t lying. Iris staged her own disappearance to get away from Cole — told her friend Lila, asked her not to tell Elise. Cole was looking for her, but never found her. Iris is safe. When Elise hears this, she is quiet for a long time. Then she says: "So she wasn\'t in danger." A pause. "Well. She was. Just not from who I thought." The case closes with a small mistake on the record, and a small truth told.'
    }
  },

  rewardTiers: [
    { id: 'perfect',     label: 'Case solved — Iris is safe', reputation: 15, money: 400, xp: 100,
      check: { culprit: true, method: true, minProof: 4 } },
    { id: 'solid',       label: 'Case solved',                 reputation: 10, money: 300, xp: 70,
      check: { culprit: true, method: true, minProof: 2 } },
    { id: 'thin',        label: 'Case closed — thin evidence', reputation: 5,  money: 200, xp: 40,
      check: { culprit: true, method: true, minProof: 0 } },
    { id: 'wrongMethod', label: 'Case closed — incomplete',    reputation: 2,  money: 120, xp: 20,
      check: { culprit: true, method: false, minProof: 0 } },
    { id: 'wrongCulprit', label: 'Case closed — wrong conclusion', reputation: -5, money: 60, xp: 10,
      check: { culprit: false, method: false, minProof: 0 } }
  ]
};