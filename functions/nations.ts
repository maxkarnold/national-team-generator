import { Player } from '../src/app/models/player.model';
import * as nations from '../src/assets/json/nations.json';
import * as clubs from '../src/assets/json/clubs.json';
import {
  OutfieldAttributes,
  GkAttributes,
} from 'src/app/models/player-attributes.model';

interface NationRoster {
  nation: string;
  fullSquad: Player[];
  region: string;
}

const nationRosters: NationRoster[] = [];

// Weak Foot Attribute
// 1-4 very weak, 5-8 weak, 8-11 reasonable, 12-14 fairly strong, 15-17 strong, 18-20 very strong
// very weak and weak is right/left only, reasonable and fairly strong is right/left, and strong and very strong is either footed
// Height is in inches
// Weight is in pounds
const rosters: Player[][] = [
  [
    {
      firstNames: ['Kevin'],
      lastNames: ['De Bruyne'],
      mainPositions: ['MC', 'AMC'],
      altPositions: ['MR', 'ML'],
      competentPositions: ['AMR', 'AML', 'DM'],
      unconvincingPositions: [],
      rating: 94,
      foot: 'right',
      firstInitial: 'K',
      nationality: '',
      nationalityLogo: '',
      age: 30,
      club: 'manchester city',
      clubLogo:
        'https://tmssl.akamaized.net/images/wappen/normal/281.png?lm=1467356331',
      playerFace: '',
      preferredRole: 'MEZ',
      preferredDuty: 'At',
      attributes: {} as OutfieldAttributes,
      weakFoot: 16,
      height: 71,
      weight: 150,
    },
  ],
];

// kdb mc, amc, MEZ, At, - MR, ML - AMR, AML, DM right footed/strong
// thibaut gk GK, De left footed/reasonable
// lukaku ST, PF, At left footed/fairly strong
// tielemans MC, AP, Su - DM, AMC - awkward ML, MR right footed/fairly strong
// salelemaekers MR, AMR, WB, De - RWB - AML, RB, - AMC, ML, LWB - LB right footed/fairly strong
// praet MC, AMC, CM, Su -  MR, AMR - DM right footed/fairly strong
// mignolet GK, SK, De right footed/weak
// meunier RB, RWB, WB, At - MR - MC - CB, DM, AMR, ST - AMC, AML, ML - right footed/weak
// mertens AMC, ST, IW, Su - AML, AMR right footed/fairly strong
// thorgan ML, MR, AML, AMR, IW, Su - AMC, ST - MC - LWB - DM, LB, RWB, RB right footed/fairly strong
// eden AML, AMC, IW, Su - AMR - ML, MC - ST, MR right footed/strong
// doku AML, ST, IW, Su - AMR right footed/reasonable
for (let i = 0; i < nations.length; i++) {
  for (const nation of nations[i].nations) {
    nationRosters[i].nation = nation.name;
    nationRosters[i].region = nation.region;
    for (const player of rosters[i]) {
      player.nationality = nation.name;
      player.nationalityLogo = nation.logo;
    }
  }
}
