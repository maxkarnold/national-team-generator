import { Role } from '../player/player.model';

export interface Champion {
  id: number;
  name: string;
  roles: Role[];
  gameStateStrength: GameState;
  img: string;
  dmgType: 'high ad' | 'high ap' | 'high mix' | 'low ad' | 'low ap' | 'low mix' | 'utility';
  archetypes?: Archetype[];
  attributes: TypeAttributes;
}

export interface GameState {
  early: number;
  mid: number;
  late: number;
}

export interface TypeAttributes {
  mobility: {
    engage: boolean;
    reposition: boolean;
  };
  dmg: {
    aoe: boolean;
    burst: boolean;
    singleTarget: boolean;
    skirmish: boolean;
    dps: boolean;
    poke: boolean;
    siege: boolean;
    waveClear: boolean;
    splitPush: boolean;
  };
  crowdControl: {
    impact: boolean;
    aoe: boolean;
    singleTarget: boolean;
    ranged: boolean;
  };
  defense: {
    mitigation: boolean;
    sustain: boolean;
  };
  support: {
    peel: boolean;
    utility: boolean;
    zoneControl: boolean;
  };
}

export type Archetype =
  | 'bruiser'
  | 'tank'
  | 'mage'
  | 'assassin'
  | 'enchanter'
  | 'fighter'
  | 'crit-marksman'
  | 'lethality-marksman'
  | 'terrainAbuser'
  | 'split-pusher'
  | 'immobile'
  | 'mobile'
  | 'lane-bully'
  | 'aoe'
  | 'duelist';

export type CompRole = 'hard-engage' | 'engage' | 'poke' | 'isolator' | 'anti-engage' | 'team-fight-burst' | 'team-fight-sustain' | 'carry';

// export const AllGameStates: GameState[] = ['early-game', 'mid-game', 'late-game'];

export const champions: Champion[] = [
  {
    id: 0,
    name: "Rek'Sai",
    roles: ['jungle', 'top'],
    img: 'https://gol.gg/_img/champions_icon/RekSai.png',
    dmgType: 'low ad',
    archetypes: ['bruiser'],
    gameStateStrength: {
      early: 13,
      mid: 12,
      late: 5,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: true,
        singleTarget: true,
        skirmish: true,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: true,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 1,
    name: "K'Sante",
    roles: ['top'],
    img: 'https://gol.gg/_img/champions_icon/KSante.png',
    dmgType: 'low ad',
    archetypes: ['bruiser'],
    gameStateStrength: {
      early: 9,
      mid: 10,
      late: 11,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: true,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: true,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 2,
    name: 'Rumble',
    roles: ['top', 'jungle', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Rumble.png',
    dmgType: 'high ap',
    archetypes: ['bruiser', 'mage'],
    gameStateStrength: {
      early: 8,
      mid: 9,
      late: 13,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: true,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: true,
        poke: false,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 3,
    name: 'Aatrox',
    roles: ['top'],
    img: 'https://gol.gg/_img/champions_icon/Aatrox.png',
    dmgType: 'high ad',
    archetypes: ['fighter'],
    gameStateStrength: {
      early: 13,
      mid: 10,
      late: 7,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: true,
        burst: false,
        singleTarget: false,
        skirmish: true,
        dps: true,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: true,
      },
      crowdControl: {
        impact: false,
        aoe: true,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: true,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 4,
    name: 'Jax',
    roles: ['top', 'jungle'],
    img: 'https://gol.gg/_img/champions_icon/Jax.png',
    dmgType: 'high mix',
    archetypes: ['fighter'],
    gameStateStrength: {
      early: 10,
      mid: 7,
      late: 13,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: true,
        dps: true,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: true,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 5,
    name: 'Twisted Fate',
    roles: ['top'],
    img: 'https://gol.gg/_img/champions_icon/TwistedFate.png',
    dmgType: 'low ap',
    archetypes: ['mage', 'crit-marksman'],
    gameStateStrength: {
      early: 9,
      mid: 13,
      late: 8,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: false,
        poke: true,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 6,
    name: 'Udyr',
    roles: ['top'],
    img: 'https://gol.gg/_img/champions_icon/Udyr.png',
    dmgType: 'low mix',
    archetypes: ['bruiser'],
    gameStateStrength: {
      early: 10,
      mid: 10,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: true,
        burst: false,
        singleTarget: false,
        skirmish: true,
        dps: true,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: true,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: true,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 7,
    name: 'Renekton',
    roles: ['top'],
    img: 'https://gol.gg/_img/champions_icon/Renekton.png',
    dmgType: 'low ad',
    archetypes: ['bruiser'],
    gameStateStrength: {
      early: 14,
      mid: 11,
      late: 5,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: true,
        singleTarget: true,
        skirmish: true,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: true,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: true,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 8,
    name: 'Poppy',
    roles: ['top', 'jungle', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Poppy.png',
    dmgType: 'low ad',
    gameStateStrength: {
      early: 12,
      mid: 9,
      late: 9,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: true,
        utility: false,
        zoneControl: true,
      },
    },
  },
  {
    id: 9,
    name: 'Vi',
    roles: ['jungle'],
    img: 'https://gol.gg/_img/champions_icon/Vi.png',
    dmgType: 'low ad',
    gameStateStrength: {
      early: 8,
      mid: 12,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 10,
    name: 'Xin Zhao',
    roles: ['jungle'],
    img: 'https://gol.gg/_img/champions_icon/XinZhao.png',
    dmgType: 'low ad',
    gameStateStrength: {
      early: 12,
      mid: 11,
      late: 7,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: true,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: true,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 11,
    name: 'Maokai',
    roles: ['jungle', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Maokai.png',
    dmgType: 'low ap',
    gameStateStrength: {
      early: 9,
      mid: 10,
      late: 11,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: true,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: true,
      },
    },
  },
  {
    id: 12,
    name: 'Rell',
    roles: ['support', 'jungle'],
    img: 'https://gol.gg/_img/champions_icon/Rell.png',
    dmgType: 'utility',
    gameStateStrength: {
      early: 10,
      mid: 10,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: true,
        utility: false,
        zoneControl: true,
      },
    },
  },
  {
    id: 13,
    name: 'Nocturne',
    roles: ['jungle'],
    img: 'https://gol.gg/_img/champions_icon/Nocturne.png',
    dmgType: 'low ad',
    gameStateStrength: {
      early: 10,
      mid: 13,
      late: 7,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: true,
        dps: false,
        poke: false,
        siege: false,
        waveClear: true,
        splitPush: true,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 14,
    name: 'Lee Sin',
    roles: ['jungle'],
    img: 'https://gol.gg/_img/champions_icon/LeeSin.png',
    dmgType: 'low ad',
    gameStateStrength: {
      early: 11,
      mid: 11,
      late: 8,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: true,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 15,
    name: 'Orianna',
    roles: ['mid'],
    img: 'https://gol.gg/_img/champions_icon/Orianna.png',
    dmgType: 'high ap',
    gameStateStrength: {
      early: 5,
      mid: 10,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: true,
        burst: true,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: true,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 16,
    name: 'Azir',
    roles: ['mid'],
    img: 'https://gol.gg/_img/champions_icon/Azir.png',
    dmgType: 'high ap',
    gameStateStrength: {
      early: 5,
      mid: 10,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: true,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 17,
    name: 'Karma',
    roles: ['mid', 'support', 'top'],
    img: 'https://gol.gg/_img/champions_icon/Karma.png',
    dmgType: 'low ap',
    gameStateStrength: {
      early: 14,
      mid: 10,
      late: 6,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: true,
        siege: true,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: true,
        utility: true,
        zoneControl: true,
      },
    },
  },
  {
    id: 18,
    name: 'Taliyah',
    roles: ['mid', 'jungle'],
    img: 'https://gol.gg/_img/champions_icon/Taliyah.png',
    dmgType: 'high ap',
    gameStateStrength: {
      early: 10,
      mid: 12,
      late: 8,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: true,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: true,
        poke: false,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: true,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 19,
    name: 'Hwei',
    roles: ['mid', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Hwei.png',
    dmgType: 'high ap',
    gameStateStrength: {
      early: 7,
      mid: 10,
      late: 13,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: true,
        burst: true,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 20,
    name: 'Neeko',
    roles: ['mid', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Neeko.png',
    dmgType: 'high ap',
    gameStateStrength: {
      early: 13,
      mid: 10,
      late: 7,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: true,
        burst: true,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 21,
    name: 'Tristana',
    roles: ['mid', 'adc'],
    img: 'https://gol.gg/_img/champions_icon/Tristana.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 8,
      mid: 7,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: true,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 22,
    name: 'Akali',
    roles: ['mid'],
    img: 'https://gol.gg/_img/champions_icon/Akali.png',
    dmgType: 'high ap',
    gameStateStrength: {
      early: 9,
      mid: 8,
      late: 13,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: true,
        singleTarget: true,
        skirmish: true,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: true,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 23,
    name: 'Varus',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Varus.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 9,
      mid: 9,
      late: 12,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 24,
    name: 'Kalista',
    roles: ['adc', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Kalista.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 14,
      mid: 10,
      late: 6,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: false,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 25,
    name: 'Ashe',
    roles: ['adc', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Ashe.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 11,
      mid: 8,
      late: 11,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 26,
    name: 'Senna',
    roles: ['adc', 'support'],
    img: 'https://gol.gg/_img/champions_icon/Senna.png',
    dmgType: 'high ap',
    gameStateStrength: {
      early: 5,
      mid: 10,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: false,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: true,
        zoneControl: false,
      },
    },
  },
  {
    id: 27,
    name: 'Lucian',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Lucian.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 12,
      mid: 10,
      late: 8,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: true,
        dps: true,
        poke: true,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 28,
    name: 'Smolder',
    roles: ['adc', 'mid'],
    img: 'https://gol.gg/_img/champions_icon/Smolder.png',
    dmgType: 'high mix',
    gameStateStrength: {
      early: 5,
      mid: 10,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: true,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: false,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 29,
    name: 'Zeri',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Zeri.png',
    dmgType: 'high mix',
    gameStateStrength: {
      early: 5,
      mid: 10,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: false,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 30,
    name: 'Xayah',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Xayah.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 6,
      mid: 10,
      late: 14,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: false,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 31,
    name: 'Aphelios',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Aphelios.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 6,
      mid: 9,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: true,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 32,
    name: 'Draven',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Draven.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 12,
      mid: 10,
      late: 8,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: false,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 33,
    name: 'Ezreal',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Ezreal.png',
    dmgType: 'high mix',
    gameStateStrength: {
      early: 9,
      mid: 12,
      late: 9,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 34,
    name: "Kai'Sa",
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Kaisa.png',
    dmgType: 'high mix',
    gameStateStrength: {
      early: 5,
      mid: 10,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: false,
        siege: false,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 35,
    name: 'Jinx',
    roles: ['adc'],
    img: 'https://gol.gg/_img/champions_icon/Jinx.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 5,
      mid: 10,
      late: 15,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: false,
        dps: true,
        poke: true,
        siege: true,
        waveClear: true,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 36,
    name: 'Nautilus',
    roles: ['support'],
    img: 'https://gol.gg/_img/champions_icon/Nautilus.png',
    dmgType: 'utility',
    gameStateStrength: {
      early: 10,
      mid: 10,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: true,
        utility: false,
        zoneControl: true,
      },
    },
  },
  {
    id: 37,
    name: 'Rakan',
    roles: ['support'],
    img: 'https://gol.gg/_img/champions_icon/Rakan.png',
    dmgType: 'utility',
    gameStateStrength: {
      early: 8,
      mid: 12,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: true,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 38,
    name: 'Renata Glasc',
    roles: ['support'],
    img: 'https://gol.gg/_img/champions_icon/RenataGlasc.png',
    dmgType: 'utility',
    gameStateStrength: {
      early: 9,
      mid: 10,
      late: 11,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: true,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: true,
        utility: true,
        zoneControl: true,
      },
    },
  },
  {
    id: 39,
    name: 'Milio',
    roles: ['support'],
    img: 'https://gol.gg/_img/champions_icon/Milio.png',
    dmgType: 'utility',
    gameStateStrength: {
      early: 10,
      mid: 10,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: true,
        siege: true,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: false,
        aoe: true,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: true,
        utility: true,
        zoneControl: true,
      },
    },
  },
  {
    id: 40,
    name: 'Alistar',
    roles: ['support'],
    img: 'https://gol.gg/_img/champions_icon/Alistar.png',
    dmgType: 'utility',
    gameStateStrength: {
      early: 10,
      mid: 10,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: true,
      },
      support: {
        peel: true,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 40,
    name: 'Nami',
    roles: ['support'],
    img: 'https://gol.gg/_img/champions_icon/Nami.png',
    dmgType: 'utility',
    gameStateStrength: {
      early: 10,
      mid: 10,
      late: 10,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: true,
        singleTarget: false,
        ranged: true,
      },
      defense: {
        mitigation: false,
        sustain: false,
      },
      support: {
        peel: true,
        utility: true,
        zoneControl: true,
      },
    },
  },
  {
    id: 41,
    name: 'Viego',
    roles: ['jungle'],
    img: 'https://gol.gg/_img/champions_icon/Viego.png',
    dmgType: 'high ad',
    gameStateStrength: {
      early: 9,
      mid: 10,
      late: 11,
    },
    attributes: {
      mobility: {
        engage: false,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: true,
        skirmish: true,
        dps: true,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: true,
      },
      crowdControl: {
        impact: false,
        aoe: false,
        singleTarget: false,
        ranged: false,
      },
      defense: {
        mitigation: false,
        sustain: true,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
  {
    id: 42,
    name: 'Sejuani',
    roles: ['jungle'],
    img: 'https://gol.gg/_img/champions_icon/Sejuani.png',
    dmgType: 'low mix',
    gameStateStrength: {
      early: 8,
      mid: 10,
      late: 12,
    },
    attributes: {
      mobility: {
        engage: true,
        reposition: false,
      },
      dmg: {
        aoe: false,
        burst: false,
        singleTarget: false,
        skirmish: false,
        dps: false,
        poke: false,
        siege: false,
        waveClear: false,
        splitPush: false,
      },
      crowdControl: {
        impact: true,
        aoe: false,
        singleTarget: true,
        ranged: false,
      },
      defense: {
        mitigation: true,
        sustain: false,
      },
      support: {
        peel: false,
        utility: false,
        zoneControl: false,
      },
    },
  },
];
