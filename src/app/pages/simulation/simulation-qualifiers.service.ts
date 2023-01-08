import { Injectable } from '@angular/core';
import { GroupTeam } from 'app/models/nation.model';
import { Match, Region } from './simulation.model';
import { compare, groupByProp } from '@shared/utils';
import { addRankings, extraTimeResult, matchScore } from './simulation.utils';
import { get } from 'lodash';
import { getRandomInt } from '@shared/utils';
import { TeamsByRegion } from './simulation.model';
import { SimulationService } from './simulation.service';

@Injectable({
  providedIn: 'root',
})
export class SimulationQualifiersService {
  simulator: SimulationService;
  extraTeams = 0;
  constructor(simulator: SimulationService) {
    this.simulator = simulator;
  }

  chooseQualifyingTeams(regionsSelected: Region[], numberOfTeams: number, nationsList: GroupTeam[], hostNation: GroupTeam): GroupTeam[] {
    // resets
    // create a list of the teams from each region and choose random teams from each region
    // to take up all the spots that are alloted at the world cup for each region
    // this should be realistic based on the number of teams in the tournament
    return this.tournament32Format(regionsSelected, nationsList, hostNation);
  }

  organizeGroups(
    teams: GroupTeam[],
    extraTeams: number,
    teamsInGroup: number,
    numberOfTeams: number,
    hostNation: GroupTeam,
    availableRegions: Region[]
  ): GroupTeam[][] {
    let group = [];
    let count = 0;

    if (numberOfTeams === 32) {
      return this.potDraw32(teams, teamsInGroup, hostNation, availableRegions);
    }

    const groups: GroupTeam[][] = [];

    // if the team numbers don't divide by 4
    // for each team place them in a group until there is 4 in group
    for (let i = 0; i < teams.length; i++) {
      if (teams.length - i <= extraTeams) {
        // if extra teams need a group
        for (let j = 0; j < groups.length; j++) {
          if (groups[j].length < 5) {
            groups[j].push(teams[i]);
            break;
          }
        }
      } else {
        group.push(teams[i]);
        count++;
        if (count === teamsInGroup) {
          // when right group size (usually 4 teams), add the group and create new group
          // console.log(group, count);
          groups.push(group);
          count = 0;
          group = [];
        }
      }
    }

    return groups;
  }

  tournament32Format(regions: Region[], nationsList: GroupTeam[], hostNation: GroupTeam): GroupTeam[] {
    const teamsQualified: GroupTeam[] = [];
    const regionValues = regions.map(r => r.value);

    const nationsLeft: GroupTeam[] = addRankings(nationsList).filter(team => regionValues.includes(team.region));

    const host = nationsLeft.findIndex(t => t.name === hostNation.name);
    teamsQualified.push(nationsLeft.splice(host, 1)[0]);
    console.log(teamsQualified[0].name, teamsQualified[0].ranking, 'qualifies as host');
    // three options
    // 1. one region that has all the teams
    // x = region.numberOfTeams - 32, top ${32 - x - 1} and host qualify auto, x number of playoffs to determine rest
    if (regions.length === 1) {
      const [region] = regions;
      const playoffMatches = region.numOfTeams - 32;
      this.extraTeams = playoffMatches;
      const qualifyingSpots = 32 - playoffMatches - 1;
      nationsLeft.slice(0, qualifyingSpots);
      if (Math.random() > 0.8) {
        const team = nationsLeft.splice(getRandomInt(1, qualifyingSpots), 1)[0];
        nationsLeft.splice(32 - playoffMatches, 0, team);
      }
      console.log(
        `qualified automatically for World Cup from ${region.label}`,
        [`${teamsQualified[0].name} ${teamsQualified[0].ranking} - ${teamsQualified[0].rating}`],
        nationsLeft.slice(0, qualifyingSpots).map(a => `${a.name} ${a.ranking} - ${a.rating}`)
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
      const ratio = numOfNationsLeft / 31;
      const teamsByRegion: TeamsByRegion = groupByProp(nationsLeft, 'region');
      console.log(teamsByRegion, 'Available Nations', numOfNationsLeft, 'Ratio', ratio);
      // ====== Automatic Qualifiers =======
      // assign qualifying spot to each region based on the total number of teams and then dividing by the same ratio
      Object.entries(teamsByRegion).forEach(([region, nations]: [string, GroupTeam[]]) => {
        const nationsInRegion = nations.length;
        const qualifyingSpots = Math.floor(nationsInRegion / ratio);
        const extraSpots = Math.round(nationsInRegion % ratio);
        console.log(
          region.toLocaleUpperCase(),
          `\n`,
          '# of nations from region',
          nationsInRegion,
          'Qualifying spots from this region',
          qualifyingSpots,
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
          nations.slice(0, regions[index].qualifiers.auto).map(a => `${a.name} ${a.ranking} - ${a.rating}`)
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
        // console.log(numQualified);
        // console.log('test', extra, nations.length, auto);
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
      const qualifyingSpots = { uefa: 10, conmebol: 4, caf: 0, afc: 4, concacaf: 3, ofc: 0 };
      const teamsByRegion: TeamsByRegion = groupByProp(nationsLeft, 'region');
      // console.log(teamsByRegion);

      Object.entries(teamsByRegion).forEach(([region, nations]: [string, GroupTeam[]], i) => {
        const qualifyingSpot = get(qualifyingSpots, region, 0);
        if (qualifyingSpot === 0) {
          return;
        }
        if (Math.random() > 0.8 && region !== 'conmebol') {
          const team = nations.splice(getRandomInt(1, qualifyingSpot - 1), 1)[0];
          nations.splice(qualifyingSpot, 0, team);
        }
        console.log(
          `qualified automatically for World Cup from ${region.toLocaleUpperCase()}`,
          teamsQualified[0].region === region
            ? [`${teamsQualified[0].name} ${teamsQualified[0].ranking} - ${teamsQualified[0].rating}`]
            : '',
          nations.slice(0, qualifyingSpot).map(a => `${a.name} ${a.ranking} - ${a.rating}`)
        );
        console.log(
          `didn't qualify automatically from ${region.toLocaleUpperCase()}`,
          nations.slice(qualifyingSpot).map(t => `${t.name}-${t.ranking}`)
        );
        teamsQualified.push(...nations.slice(0, qualifyingSpot));
      });
      return this.regionSpecificQualifiers(teamsQualified, teamsByRegion, regions);
    }
  }

  autoQualifiers(matches: number, availableNations: GroupTeam[], alreadyQualified: number, region: Region): Match[] {
    const qualifiers: Match[] = [];
    for (let i = 0; i < matches; i++) {
      const wtIndex = alreadyQualified + (matches * 2 - 1 - i);
      qualifiers.push(matchScore(availableNations[alreadyQualified + i], availableNations[wtIndex]));
      console.log(alreadyQualified + i, wtIndex);
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
    console.log(
      `qualified from ${region.label} via playoff`,
      qualifiers.map(a => `${a.winner.name} ${a.winner.ranking} - ${a.winner.rating}`)
    );
    console.log(
      `didn't qualify from ${region.label} via playoff`,
      qualifiers.map(t => `${t.loser.name}-${t.loser.ranking}`)
    );
    return qualifiers;
  }

  regionSpecificQualifiers(teamsQualified: GroupTeam[], teamsByRegion: TeamsByRegion, regions: Region[]): GroupTeam[] {
    // ====== Playoff Qualifiers =======
    // ====== Confederation Qualifiers ======
    const { uefa, afc, caf, concacaf, conmebol, ofc } = teamsByRegion;
    if (caf) {
      // ====== CAF Qualifiers ======
      const cafQualifiers = [
        matchScore(caf[0], caf[9]),
        matchScore(caf[1], caf[8]),
        matchScore(caf[2], caf[7]),
        matchScore(caf[3], caf[6]),
        matchScore(caf[4], caf[5]),
      ];

      cafQualifiers.forEach(match => {
        match.winner.matchHistory.qualifiers.push({ match, opp: match.loser });
        match.loser.matchHistory.qualifiers.push({ match, opp: match.winner });
        console.log(
          `${match.winner.region.toLocaleUpperCase()} qualifier playoff where ${match.winner.name} defeated ${
            match.loser.name
          } with a score of ${match.score}${extraTimeResult(match)}`
        );
      });

      teamsQualified.push(...cafQualifiers.map(m => m.winner));

      console.log(
        `qualified from ${cafQualifiers[0].winner.region}`,
        cafQualifiers.map(a => `${a.winner.name} ${a.winner.ranking} - ${a.winner.rating}`)
      );
      console.log(
        `didn't qualify from ${cafQualifiers[0].loser.region}`,
        caf.slice(10).map(t => `${t.name} ${t.ranking} - ${t.rating}`),
        cafQualifiers.map(t => `${t.loser.name}-${t.loser.ranking}`)
      );
    }
    if (uefa) {
      // ===== UEFA Qualifiers =====
      const uefaFirstRound = [
        matchScore(uefa[10], uefa[21]),
        matchScore(uefa[11], uefa[20]),
        matchScore(uefa[12], uefa[19]),
        matchScore(uefa[13], uefa[18]),
        matchScore(uefa[14], uefa[17]),
        matchScore(uefa[15], uefa[16]),
      ];
      uefaFirstRound.forEach(match => {
        match.winner.matchHistory.qualifiers.push({ match, opp: match.loser });
        match.loser.matchHistory.qualifiers.push({ match, opp: match.winner });
        console.log(
          `${match.winner.region} qualifier playoff where ${match.winner.name} defeated ${match.loser.name} with a score of ${
            match.score
          }${extraTimeResult(match)}`
        );
      });
      const uefaQualifiers = [
        matchScore(uefaFirstRound[0].winner, uefaFirstRound[5].winner),
        matchScore(uefaFirstRound[1].winner, uefaFirstRound[4].winner),
        matchScore(uefaFirstRound[2].winner, uefaFirstRound[3].winner),
      ];
      uefaQualifiers.forEach(match => {
        match.winner.matchHistory.qualifiers.push({ match, opp: match.loser });
        match.loser.matchHistory.qualifiers.push({ match, opp: match.winner });
        console.log(
          `${match.winner.region} qualifier playoff where ${match.winner.name} defeated ${match.loser.name} with a score of ${
            match.score
          }${extraTimeResult(match)}`
        );
      });
      teamsQualified.push(...uefaQualifiers.map(m => m.winner));
      console.log(
        `qualified from ${uefaQualifiers[0].winner.region}`,
        uefaQualifiers.map(a => `${a.winner.name} ${a.winner.ranking} - ${a.winner.rating}`)
      );
      console.log(
        `didn't qualify from ${uefaQualifiers[0].loser.region}`,
        uefa.slice(22).map(t => `${t.name}-${t.ranking}`),
        uefaFirstRound.map(t => `${t.loser.name}-${t.loser.ranking}`),
        uefaQualifiers.map(t => `${t.loser.name}-${t.loser.ranking}`)
      );
    }
    if (afc && conmebol && concacaf) {
      // ===== AFC Qualifier =====
      const afcQualifier = matchScore(afc[4], afc[5]);
      afcQualifier.winner.matchHistory.qualifiers.push({
        match: afcQualifier,
        opp: afcQualifier.loser,
      });
      afcQualifier.loser.matchHistory.qualifiers.push({
        match: afcQualifier,
        opp: afcQualifier.winner,
      });
      console.log(
        `${afcQualifier.winner.region} qualifier playoff where ${afcQualifier.winner.name} defeated ${
          afcQualifier.loser.name
        } with a score of ${afcQualifier.score}${extraTimeResult(afcQualifier)}`
      );
      let ofcQualifier: Match | null = null;
      if (ofc) {
        ofcQualifier = matchScore(ofc[0], ofc[1]);
        ofcQualifier.winner.matchHistory.qualifiers.push({
          match: ofcQualifier,
          opp: ofcQualifier.loser,
        });
        ofcQualifier.loser.matchHistory.qualifiers.push({
          match: ofcQualifier,
          opp: ofcQualifier.winner,
        });
        console.log(
          `${ofcQualifier.winner.region} qualifier playoff where ${ofcQualifier.winner.name} defeated ${
            ofcQualifier.loser.name
          } with a score of ${ofcQualifier.score}${extraTimeResult(ofcQualifier)}`
        );
        console.log(
          `teams in ${ofcQualifier.loser.region}`,
          ofc.map(t => `${t.name}-${t.ranking}`)
        );
      }
      // ===== Inter-confederation Qualifiers =====
      const playoff1 = matchScore(afcQualifier.winner, conmebol[4]);
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
        `playoff between ${afcQualifier.winner.name} and ${conmebol[4].name} resulted in a win for ${playoff1.winner.name}
       with a score of ${playoff1.goalsFor}-${playoff1.goalsAg}${extraTimeResult(playoff1)}`
      );
      const playoff2 = ofcQualifier ? matchScore(concacaf[3], ofcQualifier.winner) : null;
      if (playoff2 && ofcQualifier) {
        playoff2.winner.matchHistory.qualifiers.push({
          match: playoff2,
          opp: playoff2.loser,
        });
        playoff2.loser.matchHistory.qualifiers.push({
          match: playoff2,
          opp: playoff2.winner,
        });
        console.log(
          `playoff between ${concacaf[3].name} and ${ofcQualifier.winner.name} resulted in a win for ${playoff2.winner.name}
         with a score of ${playoff2.goalsFor}-${playoff2.goalsAg}${extraTimeResult(playoff2)}`
        );
      } else {
        console.log(`${concacaf[3].name} qualifies from ${concacaf[3].region.toLocaleUpperCase()} automatically via bye`);
      }
      const playoff2Winner = playoff2?.winner || concacaf[3];
      teamsQualified.push(playoff2Winner);
      console.log(playoff1.winner.name, 'and', playoff2Winner.name, 'qualify via inter-confederation play-off');
    }

    return teamsQualified;
  }

  potDraw32(teams: GroupTeam[], teamsInGroup: number, hostNation: GroupTeam, availableRegions: Region[]): GroupTeam[][] {
    const pots = teamsInGroup;
    const teamsInPot = teams.length / pots;
    const extraTeams = this.extraTeams;
    // ====== remove playoff teams and put them at the back and sort teams by rating
    const playoffTeams = teams.splice(-extraTeams, extraTeams);
    teams.sort((a, b) => b.rating - a.rating);
    teams.push(...playoffTeams);
    // ======= assign teams to pots ===========

    const potTeams: GroupTeam[][] = [];
    let index = teamsInPot - 1;
    const host = teams.splice(
      teams.findIndex(t => t.name === hostNation.name),
      1
    )[0];
    for (let i = 0; i < pots; i++) {
      if (i === 0) {
        potTeams.push([host, ...teams.slice(0, index)]);
      } else {
        potTeams.push(teams.slice(index, index + teamsInPot));
        index += teamsInPot;
      }
    }
    const start = Date.now();

    // ======= draw teams into groups ===========
    const draw = (pts: GroupTeam[][], nbrOfGroups: number): GroupTeam[][] => {
      const allTeams: GroupTeam[] = pts.flatMap((p, i) => {
        const team = p.map(x => ({ ...x, pot: i + 1 }));
        if (availableRegions.length > 1) {
          team.sort(({ region: a }, { region: b }) => compare(a, b, true));
        }
        return team;
      });
      const groups: GroupTeam[][] = Array.from({ length: teamsInPot }, _ => []);
      for (let i = 0; i < allTeams.length; i++) {
        // for each team in the draw
        const team = allTeams[i];
        // console.log('TEAM', team.region, team.pot);
        const candidateGroups = groups.filter(
          // return each group that returns true to ...
          group => {
            if (availableRegions.length > 4) {
              // check the group has less teams than is needed in each group
              return (
                group.length < allTeams.length / nbrOfGroups &&
                group.every(member => {
                  // console.log('MEMBER', member.region, member.pot);
                  return (
                    member.pot !== team.pot &&
                    (team.region !== 'uefa'
                      ? group.every(m => m.region !== team.region) // checking that every member of this group does not match region
                      : group.filter(m => m.region === 'uefa').length < 2)
                  );
                })
              ); // if team is uefa, the group can have a uefa team
            }
            return (
              group.length < allTeams.length / nbrOfGroups &&
              group.every(
                member =>
                  // console.log(member.pot, team.pot);
                  member.pot !== team.pot
              )
            );
          }
        );
        if (candidateGroups.length < 1) {
          if (Date.now() > start + 5000) {
            console.log(
              'ERROR WITH POT DRAW',
              allTeams.map(t => `${t.name} ${t.pot} ${t.region}`)
            );
            return groups;
          }
          return draw(pts, nbrOfGroups);
        }
        candidateGroups[Math.floor(Math.random() * candidateGroups.length)].push(team);
      }
      console.log(
        'potTeams',
        potTeams.map(g => g.map(t => `${t.name} ${t.region}`))
      );
      return groups;
    };
    const compareFn = (first: string, a: string, b: string) => {
      let returnValue;
      if (a === first) {
        returnValue = -1;
      } else if (b === first) {
        returnValue = 1;
      } else if (a < b) {
        returnValue = -1;
      } else if (b < a) {
        returnValue = 1;
      } else {
        returnValue = 0;
      }
      return returnValue;
    };

    const sortGroups = (h: string) => (t: GroupTeam[][]) =>
      t
        .map(team => team.sort(({ name: a }: { name: string }, { name: b }: { name: string }) => compareFn(h, a, b)))
        .sort(([{ name: a }], [{ name: b }]) => compareFn(h, a, b));

    const drawAndSort = (t: GroupTeam[][], h: string, nbrOfGroups: number) => sortGroups(h)(draw(t, nbrOfGroups));

    return drawAndSort(potTeams, host.name, teamsInPot);
  }
}
