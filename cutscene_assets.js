/* =========================================================
   CASEFILE — Cutscene asset manifest
   Every image path and fallback lives here. Nothing in
   cutscene.js should hard-code an image URL.
   ========================================================= */

'use strict';

const CUTSCENE_ASSETS = {

  /* Backgrounds — one image per key used in CUTSCENE_PANELS.
     Files go in assets/backgrounds/opening/                     */
  backgrounds: {
    establishing_city:   'assets/backgrounds/opening/opening_establishing.svg',
    establishing_office: 'assets/backgrounds/opening/opening_office_empty.svg',
    office_window:       'assets/backgrounds/opening/opening_detective_window.svg',
    office_door:         'assets/backgrounds/opening/opening_door.svg',
    office_room:         'assets/backgrounds/opening/opening_conversation.svg',
    office_two_shot:     'assets/backgrounds/opening/opening_two_shot.svg'
  },

  /* Character portraits — who × expression.
     Files go in assets/characters/<who>/                        */
  portraits: {
    adrian: {
      neutral:    'assets/characters/detective/adrian_neutral.svg',
      wry:        'assets/characters/detective/adrian_wry.svg',
      resolved:   'assets/characters/detective/adrian_resolved.svg',
      focused:    'assets/characters/detective/adrian_focused.svg',
      thoughtful: 'assets/characters/detective/adrian_thoughtful.svg'
    },
    marc: {
      nervous:   'assets/characters/friend/marc_nervous.svg',
      worried:   'assets/characters/friend/marc_worried.svg',
      sheepish:  'assets/characters/friend/marc_sheepish.svg',
      honest:    'assets/characters/friend/marc_honest.svg',
      relieved:  'assets/characters/friend/marc_relieved.svg'
    }
  },

  /* Per-background focal point (0..1) used as background-position
     when cropping. Keeps faces in frame on narrow screens.       */
  backgroundFocalPoints: {
    establishing_city:   'center 40%',
    establishing_office: 'center 45%',
    office_window:       'center 35%',
    office_door:         'center 50%',
    office_room:         'center 45%',
    office_two_shot:     'center 45%'
  }
};