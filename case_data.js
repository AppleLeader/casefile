/* =========================================================
   CASEFILE — Case Data: CASE-001 "The Missing Figures"
   Rewritten so the evidence points at multiple suspects,
   not just one. The player has to reason through who is
   actually responsible.

   Evidence IDs match the UI. Do not change an ID without
   also changing any linksTo that references it.
   ========================================================= */

'use strict';

const CASE_DATA = {

  id: 'case_intro_001',
  code: 'CASE-001',
  title: 'The Missing Figures',
  client: 'Marc Osei',
  brief: 'Marc Osei is an accountant at a small shipping company. He noticed that some bills the company paid were higher than what his boss agreed to pay — by small amounts, over and over, for months. He thinks someone at the company is stealing. Find out who, how, and how to prove it.',

  locations: [
    {
      id: 'loc_office',
      name: 'Vale Investigations',
      tagline: 'Your own office. One desk, one lamp, one case to work.',
      unlockRequires: []
    },
    {
      id: 'loc_company',
      name: 'Shipping Company Office',
      tagline: 'A rented floor above a warehouse. Fluorescent lights, cheap carpet, real money moving.',
      unlockRequires: []
    },
    {
      id: 'loc_warehouse',
      name: 'Shipping Warehouse',
      tagline: 'Loading bays, forklifts, and a foreman who has been here longer than the current owners.',
      unlockRequires: []
    },
    {
      id: 'loc_annex',
      name: 'The Storage Unit',
      tagline: 'A rented storage unit listed as a company address. It should not exist.',
      unlockRequires: ['ev_halcyon_card', 'ev_empty_bay_photo']
    }
  ],

  objects: [
    /* --- Your office --- */
    {
      id: 'obj_desk',
      location: 'loc_office',
      name: 'Your desk',
      description: 'A desk you got off a guy named Patel for too much money. The drawer sticks.',
      yield: null
    },
    {
      id: 'obj_case_folder',
      location: 'loc_office',
      name: 'Marc\'s case folder',
      description: 'Marc left a folder on your desk. A single-page summary, a USB stick labelled "last quarter," and a note that says "call me when you start."',
      yield: 'ev_payment_list'
    },
    {
      id: 'obj_marc_email',
      location: 'loc_office',
      name: 'Printed email thread',
      description: 'Marc printed an email exchange with the office manager. Two questions from Marc, two very smooth answers from someone named Dana.',
      yield: 'ev_marc_email'
    },

    /* --- Shipping company office --- */
    {
      id: 'obj_bill_folder',
      location: 'loc_company',
      name: 'Folder of bills',
      description: 'Three drawers of bills, sorted by month. One folder is a little too neat.',
      yield: 'ev_approved_bill'
    },
    {
      id: 'obj_payment_receipts',
      location: 'loc_company',
      name: 'Payment receipts',
      description: 'The receipts showing what the company actually paid, stapled to the back of each bill. Comparing the two numbers is the whole job.',
      yield: 'ev_paid_receipt',
      needsFirst: ['ev_approved_bill']
    },
    {
      id: 'obj_company_list',
      location: 'loc_company',
      name: 'List of company suppliers',
      description: 'A shoebox of index cards, one per supplier. Most are decades old. A few are not.',
      yield: 'ev_halcyon_card',
      needsFirst: ['ev_approved_bill']
    },
    {
      id: 'obj_signoff_sheet',
      location: 'loc_company',
      name: 'Sign-off sheet',
      description: 'A cheap spiral notebook by the coffee machine. Anyone who says yes to a bill before it gets paid writes their initials here.',
      yield: 'ev_signoff_sheet'
    },
    {
      id: 'obj_trask_note',
      location: 'loc_company',
      name: 'Trask\'s travel memo',
      description: 'A printed memo from Owen Trask: "Travelling to Chicago week of the 14th. Dana has approval authority in my absence." Signed in his own hand.',
      yield: 'ev_trask_memo'
    },

    /* --- Warehouse --- */
    {
      id: 'obj_delivery_log',
      location: 'loc_warehouse',
      name: 'Delivery log',
      description: 'A clipboard on a nail. Every delivery that arrives is written down: which bay, what time, who delivered it, and who received it.',
      yield: 'ev_delivery_log'
    },
    {
      id: 'obj_storage_list',
      location: 'loc_warehouse',
      name: 'Storage fee list',
      description: 'A separate list, kept by the office, of "storage fees" billed to companies. Each line is initialed — not all by the same person.',
      yield: 'ev_storage_list',
      needsFirst: ['ev_delivery_log']
    },
    {
      id: 'obj_bay_4',
      location: 'loc_warehouse',
      name: 'Bay 4',
      description: 'Bay 4 is listed on the storage list as the place where paid storage is kept. It is empty. Not recently emptied — empty.',
      yield: 'ev_empty_bay_photo',
      needsFirst: ['ev_storage_list']
    },
    {
      id: 'obj_reyes_note',
      location: 'loc_warehouse',
      name: 'Stuck under the delivery clipboard',
      description: 'A handwritten note, folded small. It is in Reyes\'s handwriting.',
      yield: 'ev_reyes_note',
      needsFirst: ['ev_delivery_log']
    },

    /* --- Storage unit --- */
    {
      id: 'obj_annex_door',
      location: 'loc_annex',
      name: 'The door',
      description: 'A metal roll-down door with a padlock. It is not locked. Someone has been here recently.',
      yield: null
    },
    {
      id: 'obj_annex_shelves',
      location: 'loc_annex',
      name: 'Shelves inside',
      description: 'Cardboard boxes, some opened, some not. Delivery receipts in a plastic tray by the door.',
      yield: 'ev_delivery_receipts'
    }
  ],

  evidence: [

    /* --- Foundation --- */
    {
      id: 'ev_payment_list',
      name: 'Payment List, Last Quarter',
      foundAt: 'loc_office',
      category: 'document',
      description: 'A list Marc pulled from the company books. Twelve supplier payments per month; three of them are consistently 4–9% higher than the amount the company originally agreed to.',
      relevance: 'This shows the pattern. It does not yet show who is doing it.',
      linksTo: [
        { with: 'ev_approved_bill', reveals: 'The bigger amounts on the payment list match bills that were agreed at one price, then paid at a higher one. The gap is systematic, not random.' }
      ]
    },
    {
      id: 'ev_approved_bill',
      name: 'Approved Bill #4417',
      foundAt: 'loc_company',
      category: 'document',
      description: 'A bill from a company called Halcyon Freight. It was approved for $2,140.',
      relevance: 'This is the amount the company agreed to pay.',
      linksTo: [
        { with: 'ev_paid_receipt', reveals: 'The company actually paid $2,331 for bill #4417 — $191 more than the $2,140 that was approved. Someone changed the amount between the "yes" and the payment.' }
      ]
    },
    {
      id: 'ev_paid_receipt',
      name: 'Payment Receipt #4417',
      foundAt: 'loc_company',
      category: 'document',
      description: 'The receipt showing what was actually paid for bill #4417. $2,331. The payment was processed by the office manager.',
      relevance: 'This proves the higher amount was paid — not just approved.',
      linksTo: []
    },

    /* --- Halcyon is fake --- */
    {
      id: 'ev_halcyon_card',
      name: 'Halcyon Freight Supplier Card',
      foundAt: 'loc_company',
      category: 'document',
      description: 'A supplier card for Halcyon Freight Services. The registered contact is a P.O. box. The business address is a rented storage unit.',
      relevance: 'Halcyon is not a real freight company. Its only address is a storage unit — which happens to be somewhere you can visit.',
      linksTo: [
        { with: 'ev_empty_bay_photo', reveals: 'Halcyon\'s listed address is a rented storage unit, and the case\'s only "stored" crates were for a bay that is empty. The fraud uses storage as its cover.' }
      ]
    },

    /* --- Sign-off sheet — ambiguous initials --- */
    {
      id: 'ev_signoff_sheet',
      name: 'Sign-Off Sheet',
      foundAt: 'loc_company',
      category: 'document',
      description: 'A notebook where anyone who approves a bill before payment writes their initials and the date. The initials are a mix: M.O. most weeks in a single batch; individual entries signed D.W., O.T., L.F., and V.R. on various dates.',
      relevance: 'Four different people initialed bills in this period. Whoever altered #4417\'s amount must appear on the sheet on the right day.',
      linksTo: [
        { with: 'ev_paid_receipt', reveals: 'The only initials between "approved" and "paid" on #4417\'s chain — on the specific day it moved — are D.W. The person with those initials was the last hand on the paper.' },
        { with: 'ev_dana_alibi', reveals: 'D.W. appears on the sign-off sheet for #4417 on the same date Dana claims she was out sick. If she signed it, she was there. If she was not there, someone used her initials — and neither possibility is innocent.' }
      ]
    },

    /* --- The deflections — now more neutral --- */
    {
      id: 'ev_marc_email',
      name: 'Marc\'s Email to Dana',
      foundAt: 'loc_office',
      category: 'statement',
      description: 'Marc asked Dana twice about the discrepancies. First reply: "Probably a rounding issue in the supplier system — I\'ll look into it." Second reply: "I\'ve checked. Nothing on my side. Ask the warehouse."',
      relevance: 'Dana was asked directly, twice, and deflected both times — then redirected suspicion at the warehouse.',
      linksTo: [
        { with: 'ev_storage_list', reveals: 'Dana\'s deflection — "ask the warehouse" — points at a storage fee list kept and filed by the office. Her deflection is not a mistake. It is a prepared answer.' }
      ]
    },

    /* --- Warehouse --- */
    {
      id: 'ev_delivery_log',
      name: 'Delivery Log',
      foundAt: 'loc_warehouse',
      category: 'document',
      description: 'The foreman\'s clipboard. Three deliveries from Halcyon are logged as received — but the driver fields are blank and every bay number is bay 4.',
      relevance: 'Three deliveries that supposedly happened never arrived with a named driver.',
      linksTo: [
        { with: 'ev_storage_list', reveals: 'The three Halcyon "deliveries" in the log are the same dates the storage fee list billed for — fees billed for crates that never arrived.' }
      ]
    },
    {
      id: 'ev_storage_list',
      name: 'Storage Fee List',
      foundAt: 'loc_warehouse',
      category: 'document',
      description: 'A list of "storage fees" billed to suppliers. Every line is initialed, but the initials are mixed: mostly D.W., but O.T. on two lines and M.O. on one. The foreman\'s signature is nowhere on the list.',
      relevance: 'Storage fees were billed for crates that did not exist. Multiple people initialed entries, but none of them are the warehouse foreman.',
      linksTo: [
        { with: 'ev_empty_bay_photo', reveals: 'The storage fees are billed for bay 4 — and bay 4 has been empty for months. The fees are made up.' }
      ]
    },
    {
      id: 'ev_empty_bay_photo',
      name: 'Photo of Bay 4',
      foundAt: 'loc_warehouse',
      category: 'photo',
      description: 'A photograph of bay 4 taken this morning. Empty, swept, no dust on the floor. Nobody has stored anything here in a long time.',
      relevance: 'Storage fees for bay 4 cannot be real.',
      linksTo: [
        { with: 'ev_halcyon_card', reveals: 'Halcyon\'s business address is a storage unit. Bay 4 is a storage bay. The fraud uses storage as its cover.' }
      ]
    },
    {
      id: 'ev_reyes_note',
      name: 'Reyes\'s Note',
      foundAt: 'loc_warehouse',
      category: 'statement',
      description: 'A handwritten note in Reyes\'s hand, tucked under the delivery clipboard. It says: "Do NOT sign for Halcyon unless DW calls. She said it\'s handled." Reyes initialed it.',
      relevance: 'Reyes was told not to sign for Halcyon deliveries unless Dana called. He followed that instruction. It looks bad for him — but it also shows he was being directed by someone else.',
      linksTo: [
        { with: 'ev_delivery_receipts', reveals: 'Reyes was told to sign Halcyon deliveries only on Dana\'s word. The storage unit receipts are signed by Dana herself. Reyes was the fall guy, not the thief.' }
      ]
    },

    /* --- Testimony --- */
    {
      id: 'ev_reyes_statement',
      name: 'Reyes\'s Statement',
      foundAt: 'interview',
      category: 'statement',
      description: 'The warehouse foreman says he complained about the storage fees two months ago to "the office." He was told it was a "supplier accounting thing" and to sign the delivery log as usual.',
      relevance: 'Someone at the office overrode the foreman\'s complaint. That someone has the power to make storage billing go away.',
      linksTo: [
        { with: 'ev_storage_list', reveals: 'The person who told Reyes it was a "supplier accounting thing" is the same person whose initials dominate the storage fee list. Reyes was silenced by the person billing the fees.' }
      ]
    },
    {
      id: 'ev_dana_alibi',
      name: 'Dana\'s Alibi',
      foundAt: 'interview',
      category: 'statement',
      description: 'Dana says she was out sick the week bill #4417 was processed. She is very specific about the dates. She volunteered the alibi before anyone asked about the bill.',
      relevance: 'An alibi volunteered is an alibi prepared. It also contradicts the sign-off sheet.',
      linksTo: [
        { with: 'ev_signoff_sheet', reveals: 'The sign-off sheet shows D.W. on #4417 on a day Dana claims to have been out sick. Her alibi is false — and false for a reason.' },
        { with: 'ev_paid_receipt', reveals: 'The payment receipt for #4417 is stamped with the office manager\'s signature on the same date she claims she wasn\'t there.' }
      ]
    },

    /* --- New: each other suspect gets one incriminating-looking item --- */
    {
      id: 'ev_trask_memo',
      name: 'Trask\'s Travel Memo',
      foundAt: 'loc_company',
      category: 'document',
      description: 'A printed memo: "Travelling to Chicago week of the 14th. Dana has approval authority in my absence." Signed O.T. in his own hand.',
      relevance: 'This is Trask admitting he was in Chicago on the week #4417 was processed. He has an alibi — but only if the memo is dated the week it says it is. It doesn\'t have a printed date. It could be from another month.',
      linksTo: [
        { with: 'ev_trask_uncomfortable', reveals: 'Trask says the memo is old, but he can\'t remember exactly when he wrote it. His alibi isn\'t a lie — it\'s just not as airtight as he wants it to be.' }
      ]
    },
    {
      id: 'ev_trask_uncomfortable',
      name: 'Trask\'s Statement',
      foundAt: 'interview',
      category: 'statement',
      description: 'Trask says he was in Chicago the week #4417 was processed, and that Dana has approval authority in his absence. He doesn\'t remember signing anything that week.',
      relevance: 'Trask is providing his own alibi. He is not a suspect unless the alibi is false. Nothing on file says it is.',
      linksTo: []
    },
    {
      id: 'ev_lian_override',
      name: 'Dispatch Override Note',
      foundAt: 'interview',
      category: 'statement',
      description: 'A note in dispatch records: "Halcyon deliveries — override approved. See Dana." Signed L.F.',
      relevance: 'Lian overrode dispatch to approve Halcyon deliveries. To a suspicious eye, she approved the extra payments. To a careful one, she was told to by Dana.',
      linksTo: [
        { with: 'ev_delivery_receipts', reveals: 'The override is in dispatch, but the receipts for what was supposedly being dispatched are signed by Dana. Lian moved paperwork. Dana moved money.' }
      ]
    },
    {
      id: 'ev_lian_statement',
      name: 'Lian\'s Statement',
      foundAt: 'interview',
      category: 'statement',
      description: 'Lian says Dana overrode dispatch on the Halcyon bills and told her it was "handled." She flagged it at the time. She did not go to Trask.',
      relevance: 'Lian points at Dana. But Lian also overrode dispatch herself — she had the ability to stop it and didn\'t.',
      linksTo: []
    },
    {
      id: 'ev_marc_statement',
      name: 'Marc\'s Statement',
      foundAt: 'interview',
      category: 'statement',
      description: 'Marc brought you the case. He has access to the books, and he flagged the pattern himself. He says he trusted Dana — but he also says he didn\'t go to Trask with his suspicions.',
      relevance: 'Marc could be innocent — or he could be the one who created the pattern and then "discovered" it to look clean.',
      linksTo: [
        { with: 'ev_paid_receipt', reveals: 'The payment receipts for the altered bills are all processed by Dana, not Marc. Marc\'s access was real, but the alteration happened after his reconciliation. He found the pattern because the pattern wasn\'t in his work.' }
      ]
    },

    /* --- Final --- */
    {
      id: 'ev_delivery_receipts',
      name: 'Halcyon Delivery Receipts',
      foundAt: 'loc_annex',
      category: 'document',
      description: 'A stack of delivery receipts, all on Halcyon letterhead, all signed "D. Whitlock" in the received-by field. Dozens of them, going back five months.',
      relevance: 'Dana Whitlock signed for every Halcyon delivery herself. She isn\'t a victim of the fake company — she IS the fake company.',
      linksTo: []
    }
  ],

  characters: [
    {
      id: 'char_marc',
      name: 'Marc Osei',
      role: 'Your client — accountant at the shipping company',
      intro: 'Marc brought you the case. He trusts you. Or he wants you to think he does.',
      portraitBase: 'marc',
      dialogue: [
        {
          id: 'marc_intro_1',
          requiresEvidence: [],
          givesEvidence: ['ev_marc_statement'],
          text: 'Marc: "I checked the numbers again last night. It\'s not a mistake, Adrian. Someone at my office is moving money and I can\'t prove it without you."'
        },
        {
          id: 'marc_about_dana',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Marc: "Dana runs the office. She handles the bills, the suppliers, all of it. If I didn\'t trust her, I\'d suspect her — but she\'s the one who told me to bring this to someone outside the company."'
        },
        {
          id: 'marc_about_reyes',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Marc: "Reyes runs the warehouse. Gruff, but he\'s been there nine years. He\'s not stealing from us — I\'d bet my job on that."'
        },
        {
          id: 'marc_about_lian',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Marc: "Lian runs dispatch. She and Dana don\'t get along. She thinks everyone blames dispatch for the warehouse paperwork. She might be right, or she might be covering."'
        },
        {
          id: 'marc_about_trask',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Marc: "Owen Trask is one of the owners. He signs off on payments, but he doesn\'t read them. He\'s trusted Dana for years. He also travels constantly — I don\'t know what he signed and when."'
        },
        {
          id: 'marc_have_list',
          requiresEvidence: ['ev_payment_list'],
          givesEvidence: [],
          text: 'Marc: "You have the payment list. Good. Everyone at the office has been told to expect you. Do what you have to."'
        }
      ]
    },

    {
      id: 'char_dana',
      name: 'Dana Whitlock',
      role: 'Office Manager',
      intro: 'Warm, efficient, and genuinely helpful. Six years at the company. She arranged for you to be here.',
      portraitBase: 'dana',
      dialogue: [
        {
          id: 'dana_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Dana: "You must be the investigator Marc mentioned. Please — sit. Whatever you need, I\'ll get it. The bills? The supplier cards? I have everything indexed."'
        },
        {
          id: 'dana_about_warehouse',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Dana: "The warehouse is where I\'d start, honestly. Their receiving paperwork is a mess. Not malicious — just disorganized. Reyes is a good man but the filing there is chaos."'
        },
        {
          id: 'dana_about_trask',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Dana: "Trask is travelling most weeks. I have approval authority in his absence — it\'s in my contract. I don\'t love it, but somebody has to say yes."'
        },
        {
          id: 'dana_alibi',
          requiresEvidence: ['ev_approved_bill'],
          givesEvidence: ['ev_dana_alibi'],
          text: 'Dana: "Bill 4417? Let me think — that was the week I was out with the flu, wasn\'t it? The whole week. Somebody else must have handled that one. Trask, maybe, or Marc."'
        },
        {
          id: 'dana_deflect_log',
          requiresEvidence: ['ev_signoff_sheet'],
          givesEvidence: [],
          text: 'Dana: "The sign-off sheet? Everyone signs it. That\'s not a smoking gun — that\'s just how an office works. If you want to know who did what, you\'ll need the dates too."'
        },
        {
          id: 'dana_deflect_storage',
          requiresEvidence: ['ev_storage_list'],
          givesEvidence: [],
          text: 'Dana: "The storage list is a dispatch problem, not mine. Lian should never have let those crates sit in bay 4 without telling me."'
        },
        {
          id: 'dana_hostile',
          requiresEvidence: ['ev_delivery_receipts'],
          givesEvidence: [],
          text: 'Dana: "I think we\'re done here. I have work to do. Marc knows where to find me if he has questions about how his own company is run." (She stands up. She does not sit back down.)'
        }
      ]
    },

    {
      id: 'char_reyes',
      name: 'Victor Reyes',
      role: 'Warehouse Foreman',
      intro: 'Nine years at the warehouse. Tired, blunt, protective of his crew.',
      portraitBase: 'reyes',
      dialogue: [
        {
          id: 'reyes_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Reyes: "You\'re the outside detective. Dana told me to expect you. I\'ll say what I said to her: my paperwork is fine. Anything wrong with it, someone else wrote it."'
        },
        {
          id: 'reyes_complained',
          requiresEvidence: ['ev_storage_list'],
          givesEvidence: ['ev_reyes_statement'],
          text: 'Reyes: "Two months ago I told the office these storage fees were wrong. Crates I never saw. I got told it was a \'supplier accounting thing\' and to sign the delivery log as usual. So I signed it. I shouldn\'t have. But I did."'
        },
        {
          id: 'reyes_about_bay4',
          requiresEvidence: ['ev_storage_list'],
          givesEvidence: [],
          text: 'Reyes: "Bay 4\'s been empty since spring. Nobody stores in bay 4. Nobody has ever stored in bay 4. If a fee says bay 4, the fee is a lie."'
        },
        {
          id: 'reyes_about_dana',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Reyes: "Dana\'s been here six years. She signs my paychecks. She also files the storage billing, which isn\'t supposed to be her job. Nobody asks why."'
        },
        {
          id: 'reyes_about_note',
          requiresEvidence: ['ev_reyes_note'],
          givesEvidence: [],
          text: 'Reyes: "Yeah, I wrote that note. I sign Halcyon deliveries only when Dana calls. She said the paperwork was handled on her end. I stopped asking."'
        }
      ]
    },

    {
      id: 'char_lian',
      name: 'Lian Farrow',
      role: 'Head of Dispatch',
      intro: 'Forty-something, practical, been at the company nine years. She and Dana do not get along.',
      portraitBase: 'lian',
      dialogue: [
        {
          id: 'lian_first',
          requiresEvidence: [],
          givesEvidence: ['ev_lian_override'],
          text: 'Lian: "Dispatch. So you\'re the one Dana\'s blaming for her paperwork. Let me save you some time: my records are sloppy because I\'m running sixteen drivers a day on a system built in 2009. Sloppy isn\'t the same as criminal."'
        },
        {
          id: 'lian_override',
          requiresEvidence: ['ev_signoff_sheet'],
          givesEvidence: ['ev_lian_statement'],
          text: 'Lian: "You want to know who overrode dispatch on the Halcyon bills? Dana did. She can approve supplier bills when Trask is out. She used that on the Halcyon ones. I flagged it. She told me it was handled."'
        },
        {
          id: 'lian_storage',
          requiresEvidence: ['ev_storage_list'],
          givesEvidence: [],
          text: 'Lian: "Those storage fees? Dispatch never scheduled a pickup for any of those crates. If a crate isn\'t in dispatch, it didn\'t exist. Ask Dana where she got the crate numbers."'
        },
        {
          id: 'lian_softens',
          requiresEvidence: ['ev_reyes_statement'],
          givesEvidence: [],
          text: 'Lian: "Reyes complained to me too. I told him to take it to Trask. He didn\'t — he doesn\'t trust Trask. Fair enough. If you find something solid, I\'ll back you up."'
        }
      ]
    },

    {
      id: 'char_trask',
      name: 'Owen Trask',
      role: 'Company Owner',
      intro: 'One of two owners. Distant. Believes his systems work. Has an alibi he isn\'t fully sure of.',
      portraitBase: 'trask',
      dialogue: [
        {
          id: 'trask_first',
          requiresEvidence: [],
          givesEvidence: [],
          text: 'Trask: "Marc hired you, so you\'re here. Fine. I\'ll tell you what I told him: our process is sound. Approval, signature, payment. Four hands on every dollar. Nobody steals through four hands."'
        },
        {
          id: 'trask_authority',
          requiresEvidence: ['ev_signoff_sheet'],
          givesEvidence: [],
          text: 'Trask: "Dana can approve supplier bills when I\'m travelling. It\'s in her contract. She\'s been doing it for years without incident. If she signed something, she had the authority to sign it."'
        },
        {
          id: 'trask_uncomfortable',
          requiresEvidence: ['ev_dana_alibi'],
          givesEvidence: ['ev_trask_uncomfortable'],
          text: 'Trask: "She told you she was out sick that week? Hm. I don\'t remember signing 4417. I don\'t remember signing anything that week — I was in Chicago." (He pauses. He does not say more.)'
        }
      ]
    }
  ],

  truth: {
    culpritId: 'char_dana',
    methodOptions: [
      { id: 'inflating_bills',  label: 'She was inflating bills and sending the extra money to a fake company', correct: true },
      { id: 'double_billing',   label: 'She was charging the company twice for the same delivery',                correct: false },
      { id: 'fake_hours',       label: 'She was adding fake hours to pay herself more',                         correct: false }
    ],
    proofSet: [
      'ev_approved_bill', 'ev_paid_receipt', 'ev_halcyon_card',
      'ev_signoff_sheet', 'ev_storage_list', 'ev_empty_bay_photo',
      'ev_delivery_receipts', 'ev_dana_alibi', 'ev_reyes_statement'
    ],
    resolution: {
      correct: 'Dana Whitlock was changing the amounts on bills after they were approved and sending the extra money to a fake company called Halcyon Freight. Halcyon had no real business — its only address was a rented storage unit she filled herself, and every Halcyon delivery was signed by Dana. The $6,400 she took over five months is now traceable. The company can recover most of it, and Owen Trask has agreed to handle it quietly with the insurance company rather than press charges. Dana has left the company. Marc, quietly, has offered to keep her from ever working with money again.',
      wrongCulprit: 'You named the wrong person. The real fraud was carried out by Dana Whitlock, not the person you accused. Trask has asked the company to close the matter internally. Your reputation takes a small hit — but the case is not over in your records. The truth is on file. You can review what you missed.'
    }
  },

  rewardTiers: [
    { id: 'perfect', label: 'Case solved — decisively', reputation: 18, money: 650, xp: 120,
      check: { culprit: true, method: true, minProof: 6 } },
    { id: 'solid', label: 'Case solved', reputation: 12, money: 450, xp: 80,
      check: { culprit: true, method: true, minProof: 3 } },
    { id: 'thin', label: 'Case solved — on thin evidence', reputation: 6, money: 300, xp: 50,
      check: { culprit: true, method: true, minProof: 0 } },
    { id: 'wrongMethod', label: 'Case closed — method unclear', reputation: 3, money: 180, xp: 25,
      check: { culprit: true, method: false, minProof: 0 } },
    { id: 'wrongCulprit', label: 'Case closed — wrong conclusion', reputation: -6, money: 75, xp: 10,
      check: { culprit: false, method: false, minProof: 0 } }
  ]
};