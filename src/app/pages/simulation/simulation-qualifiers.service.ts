import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { compare, getRandomInt, groupByProp } from '@shared/utils';
import { GroupTeam } from 'app/models/nation.model';
import { get } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { drawAndSort } from './group-draw.utils';
import { Match, Region, TeamsByRegion, Tournament32 } from './simulation.model';
import { SimulationService } from './simulation.service';
import { extraTimeResult, matchScore } from './simulation.utils';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class SimulationQualifiersService {
  simulator: SimulationService;
  extraTeams = 0;
  drawData$: BehaviorSubject<GroupTeam[][]> = new BehaviorSubject([] as GroupTeam[][]);
  tournament: Tournament32 | null = null;
  constructor(simulator: SimulationService) {
    this.simulator = simulator;

    this.simulator.tournament$.pipe(untilDestroyed(this)).subscribe(t => (this.tournament = t));
  }

  chooseQualifyingTeams(regionsSelected: Region[], numberOfTeams: number, nationsList: GroupTeam[], hostNations: GroupTeam[]): GroupTeam[] {
    // resets
    // create a list of the teams from each region and choose random teams from each region
    // to take up all the spots that are alloted at the world cup for each region
    // this should be realistic based on the number of teams in the tournament
    return this.tournament32Format(regionsSelected, nationsList, hostNations);
  }

  organizeGroups(
    teams: GroupTeam[],
    extraTeams: number,
    teamsInGroup: number,
    numberOfTeams: number,
    hostNations: GroupTeam[],
    availableRegions: Region[]
  ) {
    if (numberOfTeams === 32) {
      this.potDraw32(teams, teamsInGroup, hostNations, availableRegions);
    }
  }

  tournament32Format(regions: Region[], nationsList: GroupTeam[], hostNations: GroupTeam[]): GroupTeam[] {
    const teamsQualified: GroupTeam[] = [];
    const regionValues = regions.map(r => r.value);

    const nationsLeft: GroupTeam[] = nationsList.filter(team => regionValues.includes(team.region));

    hostNations.forEach((nation, i) => {
      const host = nationsLeft.findIndex(t => t.name === nation.name);
      teamsQualified.push(nationsLeft.splice(host, 1)[0]);
      console.log(teamsQualified[i].name, teamsQualified[i].ranking, 'qualifies as host');
    });

    // three options
    // 1. one region that has all the teams
    // x = region.numberOfTeams - 32, top ${32 - x - 1} and host qualify auto, x number of playoffs to determine rest
    if (regions.length === 1) {
      const [region] = regions;
      const playoffMatches = region.numOfTeams - 32;
      this.extraTeams = playoffMatches;
      const qualifyingSpots = 32 - playoffMatches - hostNations.length;
      if (Math.random() > 0.8) {
        const team = nationsLeft.splice(getRandomInt(1, qualifyingSpots), 1)[0];
        nationsLeft.splice(32 - playoffMatches, 0, team);
      }
      console.log(
        `qualified automatically for World Cup from ${region.label}`,
        hostNations.length > 1
          ? teamsQualified.slice(0, hostNations.length).map(t => `${t.name} ${t.ranking}`)
          : `${teamsQualified[0].name} ${teamsQualified[0].ranking}`,
        nationsLeft.slice(0, qualifyingSpots).map(a => `${a.name} ${a.ranking}`)
      );
      console.log(
        `didn't qualify automatically from ${region.label}`,
        nationsLeft.slice(qualifyingSpots).map(t => `${t.name}-${t.ranking}`)
      );
      teamsQualified.push(...nationsLeft.slice(0, qualifyingSpots));

      const qualifiers = this.autoQualifiers(playoffMatches, nationsLeft, qualifyingSpots, region);

      teamsQualified.push(...qualifiers.map(m => m.winner));

      return teamsQualified;
    }
    // 2. multiple regions but not all the regions
    else if (regions.length < 5 || (regionValues.includes('ofc') && regions.length === 5)) {
      const numOfNationsLeft = nationsLeft.length;
      const ratio = numOfNationsLeft / (32 - hostNations.length);
      const teamsByRegion: TeamsByRegion = groupByProp(nationsLeft, 'region');
      // console.log(teamsByRegion, 'Available Nations', numOfNationsLeft, 'Ratio', ratio);
      // ====== Automatic Qualifiers =======
      // assign qualifying spot to each region based on the total number of teams and then dividing by the same ratio
      Object.entries(teamsByRegion).forEach(([region, nations]: [string, GroupTeam[]]) => {
        const nationsInRegion = nations.length;
        // const hosts = hostNations.filter(h => h.region === region).length;
        const qualifyingSpots = Math.floor(nationsInRegion / ratio);
        const extraSpots = Math.round(nationsInRegion % ratio);
        console.log(
          region.toLocaleUpperCase(),
          '\n',
          '# of nations from region',
          nationsInRegion,
          '\n',
          'Qualifying spots from this region',
          qualifyingSpots,
          '\n',
          'Extra spots available for this region',
          extraSpots
        );
        const index = regions.findIndex(r => r.value === region);
        regions[index].qualifiers = {
          auto: qualifyingSpots,
          extra: extraSpots,
        };
        teamsQualified.push(...nations.slice(0, qualifyingSpots));
        console.log(
          `qualified automatically for World Cup from ${region.toLocaleUpperCase()}`,
          nations.slice(0, regions[index].qualifiers.auto).map(a => `${a.name} ${a.ranking}`)
        );
        console.log(
          `didn't qualify automatically from ${region.toLocaleUpperCase()}`,
          nations.slice(regions[index].qualifiers.auto).map(t => `${t.name}-${t.ranking}`)
        );
      });

      // console.log(
      //   '# automatically qualified spots',
      //   regions.reduce((a, b) => a + b.qualifiers.auto, 0) + 1,
      //   '# of extra spots',
      //   regions.reduce((a, b) => a + b.qualifiers.extra, 0),
      //   teamsQualified
      // );
      // ====== Playoff Qualifiers =======
      let numQualified = teamsQualified.length;
      Object.entries(teamsByRegion).forEach(([region, nations]: [string, GroupTeam[]]) => {
        const index = regions.findIndex(r => r.value === region);
        const extra = regions[index].qualifiers.extra + numQualified <= 32 ? regions[index].qualifiers.extra : 32 - numQualified;
        const auto = regions[index].qualifiers.auto;
        if (numQualified === 32 || extra === 0) {
          return;
        }
        const qualifiers = this.autoQualifiers(extra, nations, auto, regions[index]);
        teamsQualified.push(...qualifiers.map(m => m.winner));
        numQualified += extra;
        this.extraTeams += extra;
      });
      return teamsQualified;
    }
    // 3. and the normal version with all the regions available or all the regions except OFC
    else {
      this.extraTeams = 2;
      const autoQualifyingSpots = { uefa: 10, conmebol: 4, caf: 0, afc: 4, concacaf: 3, ofc: 0 };
      const teamsByRegion: TeamsByRegion = groupByProp(nationsLeft, 'region');
      // console.log(teamsByRegion);

      Object.entries(teamsByRegion).forEach(([region, nations]: [string, GroupTeam[]], i) => {
        const qualifyingSpot = get(autoQualifyingSpots, region, 0);
        if (qualifyingSpot === 0) {
          return;
        }
        if (Math.random() > 0.8 && region !== 'conmebol') {
          const team = nations.splice(getRandomInt(1, qualifyingSpot - 1), 1)[0];
          nations.splice(qualifyingSpot, 0, team);
        }
        console.log(
          `qualified automatically for World Cup from ${region.toLocaleUpperCase()}`,
          teamsQualified[0].region === region ? [`${teamsQualified[0].name} ${teamsQualified[0].ranking}`] : '',
          nations.slice(0, qualifyingSpot).map(a => `${a.name} ${a.ranking}`)
        );
        console.log(
          `didn't qualify automatically from ${region.toLocaleUpperCase()}`,
          nations.slice(qualifyingSpot).map(t => `${t.name}-${t.ranking}`)
        );
        teamsQualified.push(...nations.slice(0, qualifyingSpot));
      });
      return this.regionSpecificQualifiers(teamsQualified, teamsByRegion, regions, hostNations);
    }
  }

  autoQualifiers(
    matches: number,
    availableNations: GroupTeam[],
    alreadyQualified: number,
    region: Region,
    isFinalQualifier = true
  ): Match[] {
    const qualifiers: Match[] = [];
    for (let i = 0; i < matches; i++) {
      const wtIndex = alreadyQualified + (matches * 2 - 1 - i);
      qualifiers.push(matchScore(availableNations[alreadyQualified + i], availableNations[wtIndex], true));
    }
    qualifiers.forEach(match => {
      match.winner.matchHistory.qualifiers.push({ match, opp: match.loser });
      match.loser.matchHistory.qualifiers.push({ match, opp: match.winner });
      console.log(
        `${region.label} qualifier playoff where ${match.winner.name} defeated ${match.loser.name} with a score of ${
          match.score
        }${extraTimeResult(match)}`
      );
    });
    if (isFinalQualifier && matches > 0) {
      console.log(
        `qualified from ${region.label} via playoff`,
        qualifiers.map(a => `${a.winner.name} ${a.winner.ranking}`)
      );
      console.log(
        `didn't qualify from ${region.label} via playoff`,
        qualifiers.map(t => `${t.loser.name} ${t.loser.ranking}`)
      );
    }
    return qualifiers;
  }

  regionSpecificQualifiers(
    teamsQualified: GroupTeam[],
    teamsByRegion: TeamsByRegion,
    regions: Region[],
    hostNations: GroupTeam[]
  ): GroupTeam[] {
    // ====== Playoff Qualifiers =======
    // ====== Confederation Qualifiers ======

    const { uefa, afc, caf, concacaf, conmebol, ofc } = teamsByRegion;
    const hostRegions = hostNations.map(h => h.region);
    let hasFirstPlayoff = true;
    let hasSecondPlayoff = true;
    if (caf) {
      // ====== CAF Qualifiers ======
      const matches =
        (hostNations.every(n => n.region === 'caf') && hostNations.length === 2) ||
        (hostRegions.includes('caf') && hostRegions.includes('uefa'))
          ? 4
          : 5;
      const alreadyQualified = 0;
      const region = regions[1];

      const cafQualifiers = this.autoQualifiers(matches, caf, alreadyQualified, region);

      teamsQualified.push(...cafQualifiers.map(m => m.winner));

      console.log(
        `qualified from ${cafQualifiers[0].winner.region}`,
        cafQualifiers.map(a => `${a.winner.name} ${a.winner.ranking}`)
      );
      console.log(
        `didn't qualify from ${cafQualifiers[0].loser.region}`,
        caf.slice(matches * 2).map(t => `${t.name} ${t.ranking}`),
        cafQualifiers.map(t => `${t.loser.name}-${t.loser.ranking}`)
      );
    }
    if (uefa) {
      // ===== UEFA Qualifiers =====
      const doubleHosts = hostNations.length === 2 && hostNations.every(n => n.region === 'uefa');
      const matches = doubleHosts ? 4 : 6;
      const matches2 = doubleHosts ? 2 : 3;
      const alreadyQualified = 10;
      const region = regions[0];

      const uefaFirstRound = this.autoQualifiers(matches, uefa, alreadyQualified, region, false);
      const winners = uefaFirstRound.map(m => m.winner);
      const uefaQualifiers = this.autoQualifiers(matches2, winners, 0, region);

      teamsQualified.push(...uefaQualifiers.map(m => m.winner));
      // console.log(
      //   `didn't qualify from ${uefaQualifiers[0].loser.region}`,
      //   uefa.slice(22).map(t => `${t.name}-${t.ranking}`),
      //   uefaFirstRound.map(t => `${t.loser.name}-${t.loser.ranking}`),
      //   uefaQualifiers.map(t => `${t.loser.name}-${t.loser.ranking}`)
      // );
    }
    if (afc && conmebol && concacaf) {
      // ===== AFC Qualifier =====
      const matches =
        (hostNations.length === 2 && hostNations.every(n => n.region === 'afc')) ||
        (hostRegions.includes('uefa') && hostRegions.includes('afc'))
          ? 0
          : 1;
      const alreadyQualified = 4;
      const region = regions[2];
      const afcQualifiers: (Match | undefined)[] = this.autoQualifiers(matches, afc, alreadyQualified, region, false);
      const ofcQualifiers: (Match | undefined)[] = [];
      if (ofc) {
        const ofcMatches = hostRegions.includes('afc') && hostRegions.includes('ofc') ? 0 : 1;
        const ofcQualified = 0;
        const ofcRegion = regions[5];
        ofcQualifiers.push(...this.autoQualifiers(ofcMatches, ofc, ofcQualified, ofcRegion, false));
      }
      // ===== Inter-confederation Qualifiers =====
      if (afcQualifiers[0] === undefined) {
        hasFirstPlayoff = false;
        // console.log(`${conmebol[4].name} automatically qualified from CONMEBOL via bye`);
      } else if (hostNations.length === 2 && hostNations.every(n => n.region === 'conmebol')) {
        hasFirstPlayoff = false;
        // console.log(`${afcQualifiers[0].winner.name} automatically qualified from AFC via bye`);
      } else {
        const playoff1 = matchScore(afcQualifiers[0].winner, conmebol[4], true);
        playoff1.winner.matchHistory.qualifiers.push({
          match: playoff1,
          opp: playoff1.loser,
        });
        playoff1.loser.matchHistory.qualifiers.push({
          match: playoff1,
          opp: playoff1.winner,
        });
        teamsQualified.push(playoff1.winner);
        console.log(
          `playoff between ${afcQualifiers[0].winner.name} and ${conmebol[4].name} resulted in a win for ${playoff1.winner.name}
        with a score of ${playoff1.goalsFor}-${playoff1.goalsAg}${extraTimeResult(playoff1)}`
        );
      }

      if ((hostNations.length === 2 && hostNations.every(n => n.region === 'concacaf')) || (ofcQualifiers[0] === undefined && ofc)) {
        hasSecondPlayoff = false;
      } else if (!ofc || ofcQualifiers[0] === undefined) {
        teamsQualified.push(concacaf[3]);
        console.log(`${concacaf[3].name} automatically qualified from CONCACAF via bye`);
      } else {
        const playoff2 = matchScore(ofcQualifiers[0].winner, concacaf[3], true);
        playoff2.winner.matchHistory.qualifiers.push({
          match: playoff2,
          opp: playoff2.loser,
        });
        playoff2.loser.matchHistory.qualifiers.push({
          match: playoff2,
          opp: playoff2.winner,
        });
        teamsQualified.push(playoff2.winner);
        console.log(
          `playoff between ${concacaf[3].name} and ${ofcQualifiers[0].winner.name} resulted in a win for ${playoff2.winner.name}
        with a score of ${playoff2.goalsFor}-${playoff2.goalsAg}${extraTimeResult(playoff2)}`
        );
      }
    }
    if (hasFirstPlayoff && hasSecondPlayoff) {
      console.log(
        teamsQualified.slice(-1)[0].name,
        'and',
        teamsQualified.slice(-2, -1)[0].name,
        'qualify via inter-confederation play-off'
      );
    } else {
      console.log(teamsQualified.slice(-1)[0].name, 'qualify via inter-confederation play-off');
    }

    // console.log(teamsQualified.length, teamsQualified);
    return teamsQualified;
  }

  potDraw32(teams: GroupTeam[], teamsInGroup: number, hostNations: GroupTeam[], availableRegions: Region[]) {
    const pots = teamsInGroup;
    const teamsInPot = teams.length / pots;
    const extraTeams = this.extraTeams;
    // ====== remove playoff teams and put them at the back and sort teams by rating
    const playoffTeams = teams.splice(-extraTeams, extraTeams);
    const hosts = teams.splice(0, hostNations.length);
    teams.sort((a, b) => b.rating - a.rating);
    teams.push(...playoffTeams);
    // ======= assign teams to pots ===========

    const potTeams: GroupTeam[][] = [];
    let index = teamsInPot - hostNations.length;
    for (let i = 0; i < pots; i++) {
      if (i === 0) {
        potTeams.push([...hosts, ...teams.slice(0, index)]);
      } else {
        potTeams.push(teams.slice(index, index + teamsInPot));
        index += teamsInPot;
      }
    }
    console.log(
      'potTeams',
      potTeams.map(g => g.map(t => `${t.name} ${t.region}`))
    );
    const start = Date.now();

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./simulation.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        this.simulator.tournament$.next({ groups: data.draw });

        this.simulator.isLoading$.next(false);
      };
      this.simulator.isLoading$.next(true);
      worker.postMessage({ potTeams, teamsInPot, availableRegions, start, hosts });
    } else {
      console.log('test: worker not working');

      this.simulator.tournament$.next({
        groups: drawAndSort(
          potTeams,
          hosts.map(h => h.name),
          teamsInPot,
          availableRegions
        ),
      });
    }
  }
}
