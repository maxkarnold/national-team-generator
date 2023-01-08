import { Injectable } from '@angular/core';
import { compare, getRandFloat, getRandomInt } from '@shared/utils';
import { addRankings, calcScore, extraTimeResult } from './simulation.utils';
import { get } from 'lodash';
import { GroupTeam } from 'app/models/nation.model';

import { Match, Region, TeamsByRegion, Tournament32 } from './simulation.model';
import { BehaviorSubject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { groupByProp } from '@shared/utils';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  selectedNation$ = new BehaviorSubject<GroupTeam | null>(null);
  tournament$ = new BehaviorSubject<Tournament32 | null>(null);
  tournament: Tournament32 | null = null;
  extraTeams = 0;

  constructor() {
    this.tournament$.pipe(untilDestroyed(this)).subscribe(t => {
      this.tournament = t;
    });
  }

  changeSelectedNation(value: null | GroupTeam) {
    this.selectedNation$.next(value);
  }

  chooseQualifyingTeams(regionsSelected: Region[], numberOfTeams: number, nationsList: GroupTeam[], hostNation: GroupTeam): GroupTeam[] {
    // resets
    // create a list of the teams from each region and choose random teams from each region
    // to take up all the spots that are alloted at the world cup for each region
    // this should be realistic based on the number of teams in the tournament
    return this.tournament32Format(regionsSelected, nationsList, hostNation);
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
      qualifiers.push(this.matchScore(availableNations[alreadyQualified + i], availableNations[wtIndex]));
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
        this.matchScore(caf[0], caf[9]),
        this.matchScore(caf[1], caf[8]),
        this.matchScore(caf[2], caf[7]),
        this.matchScore(caf[3], caf[6]),
        this.matchScore(caf[4], caf[5]),
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
        this.matchScore(uefa[10], uefa[21]),
        this.matchScore(uefa[11], uefa[20]),
        this.matchScore(uefa[12], uefa[19]),
        this.matchScore(uefa[13], uefa[18]),
        this.matchScore(uefa[14], uefa[17]),
        this.matchScore(uefa[15], uefa[16]),
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
        this.matchScore(uefaFirstRound[0].winner, uefaFirstRound[5].winner),
        this.matchScore(uefaFirstRound[1].winner, uefaFirstRound[4].winner),
        this.matchScore(uefaFirstRound[2].winner, uefaFirstRound[3].winner),
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
      const afcQualifier = this.matchScore(afc[4], afc[5]);
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
        ofcQualifier = this.matchScore(ofc[0], ofc[1]);
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
      const playoff1 = this.matchScore(afcQualifier.winner, conmebol[4]);
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
      const playoff2 = ofcQualifier ? this.matchScore(concacaf[3], ofcQualifier.winner) : null;
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

  matchScore(team: GroupTeam, otherTeam: GroupTeam, homeTeam = false): Match {
    if (this.tournament?.hostNation?.name === team.name) {
      homeTeam = true;
    }
    const tm = {
      attRating: team.attRating,
      midRating: team.midRating,
      defRating: team.defRating,
    };
    const opp = {
      attRating: otherTeam.attRating,
      midRating: otherTeam.midRating,
      defRating: otherTeam.defRating,
    };
    const [goalsFor, goalsAg] = calcScore(tm, opp, !!homeTeam);

    const etWin = getRandFloat(0, 1) > 0.9 && goalsFor !== goalsAg && Math.abs(goalsFor - goalsAg) < 2;
    const penaltyWin = goalsFor === goalsAg;

    const whoWon = (gf: number, ga: number): { winner: GroupTeam; loser: GroupTeam; score: string } => {
      if (penaltyWin) {
        const rand = getRandFloat(0, 1);
        return rand > 0.5
          ? { winner: team, loser: otherTeam, score: `${goalsFor}-${goalsAg}` }
          : { winner: otherTeam, loser: team, score: `${goalsAg}-${goalsFor}` };
      }
      return gf > ga
        ? { winner: team, loser: otherTeam, score: `${goalsFor}-${goalsAg}` }
        : { winner: otherTeam, loser: team, score: `${goalsAg}-${goalsFor}` };
    };

    const { winner, loser, score } = whoWon(goalsFor, goalsAg);

    return {
      goalsFor,
      goalsAg,
      etWin,
      penaltyWin,
      winner,
      loser,
      score,
    };
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

  simulateGroups(groupGamesPerOpponent: number, groups: GroupTeam[][]): GroupTeam[][] {
    const g: GroupTeam[][] = groups || [];

    for (let i = 0; i < g.length; i++) {
      for (let j = 0; j < g[i].length; j++) {
        // resets
        g[i][j].points = 0;
        g[i][j].gDiff = 0;
        g[i][j].gFor = 0;
        g[i][j].gOpp = 0;
        g[i][j].matchesPlayed = 0;
        g[i][j].matchHistory = {
          qualifiers: g[i][j].matchHistory.qualifiers,
          group: [],
          bracket: [],
        };
        g[i][j].grade = undefined;
      }
    }
    // go through each group
    // simulate each game and reward that team that many points
    // sort the teams by points
    for (let c = 0; c < groupGamesPerOpponent; c++) {
      let goalsFor = 0;
      let goalsAg = 0;
      for (
        let i = 0;
        i < g.length;
        i++ // for each group
      ) {
        for (let j = 0; j < g[i].length; j++) {
          // for each team
          const team = g[i][j];
          for (let k = j + 1; k < g[i].length; k++) {
            // for each of the other teams play a match
            const otherTeam = g[i][k];
            const matchScore = this.matchScore(team, otherTeam);
            matchScore.winner.matchHistory.group.push({
              match: matchScore,
              opp: matchScore.loser,
            });
            matchScore.loser.matchHistory.group.push({
              match: matchScore,
              opp: matchScore.winner,
            });
            goalsFor = matchScore.goalsFor;
            goalsAg = matchScore.goalsAg;
            if (goalsFor > goalsAg) {
              team.points += 3;
              team.gDiff += goalsFor - goalsAg;
              otherTeam.gDiff += goalsAg - goalsFor;
            } else if (goalsFor < goalsAg) {
              otherTeam.points += 3;
              team.gDiff += goalsFor - goalsAg;
              otherTeam.gDiff += goalsAg - goalsFor;
            } else {
              team.points += 1;
              otherTeam.points += 1;
            }
            team.gFor += goalsFor;
            team.gOpp += goalsAg;
            otherTeam.gFor += goalsAg;
            otherTeam.gOpp += goalsFor;
            team.matchesPlayed++;
            otherTeam.matchesPlayed++;
          }
        }
        g[i].sort((a, b) => b.points - a.points || b.gDiff - a.gDiff || b.gFor - a.gFor || compare(a.name, b.name, true));
      }
    }
    return g;
  }

  simulateBracket(groups: GroupTeam[][]): {
    groupWinners: GroupTeam[];
    bracket: {
      roundOf16: [GroupTeam, GroupTeam, Match][];
      quarterFinals: [GroupTeam, GroupTeam, Match][];
      semiFinals: [GroupTeam, GroupTeam, Match][];
      finals: [GroupTeam, GroupTeam, Match][];
    };
  } {
    const gWinners = groups.map(group => group.slice(0, 2));
    const [a, b, c, d, e, f, g, h] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // assign numbers to letter values, to improve readability of code

    const roundOf16: [GroupTeam, GroupTeam, Match][] = [
      [gWinners[a][0], gWinners[b][1], this.matchScore(gWinners[a][0], gWinners[b][1])],
      [gWinners[c][0], gWinners[d][1], this.matchScore(gWinners[c][0], gWinners[d][1])],
      [gWinners[e][0], gWinners[f][1], this.matchScore(gWinners[e][0], gWinners[f][1])],
      [gWinners[g][0], gWinners[h][1], this.matchScore(gWinners[g][0], gWinners[h][1])],
      [gWinners[d][0], gWinners[c][1], this.matchScore(gWinners[d][0], gWinners[c][1])],
      [gWinners[b][0], gWinners[a][1], this.matchScore(gWinners[b][0], gWinners[a][1])],
      [gWinners[f][0], gWinners[e][1], this.matchScore(gWinners[f][0], gWinners[e][1])],
      [gWinners[h][0], gWinners[g][1], this.matchScore(gWinners[h][0], gWinners[g][1])],
    ];

    roundOf16.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const quarterFinals: [GroupTeam, GroupTeam, Match][] = [
      [roundOf16[0][2].winner, roundOf16[1][2].winner, this.matchScore(roundOf16[0][2].winner, roundOf16[1][2].winner)],
      [roundOf16[2][2].winner, roundOf16[3][2].winner, this.matchScore(roundOf16[2][2].winner, roundOf16[3][2].winner)],
      [roundOf16[4][2].winner, roundOf16[5][2].winner, this.matchScore(roundOf16[4][2].winner, roundOf16[5][2].winner)],
      [roundOf16[6][2].winner, roundOf16[7][2].winner, this.matchScore(roundOf16[6][2].winner, roundOf16[7][2].winner)],
    ];

    quarterFinals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const semiFinals: [GroupTeam, GroupTeam, Match][] = [
      [quarterFinals[0][2].winner, quarterFinals[1][2].winner, this.matchScore(quarterFinals[0][2].winner, quarterFinals[1][2].winner)],
      [quarterFinals[2][2].winner, quarterFinals[3][2].winner, this.matchScore(quarterFinals[2][2].winner, quarterFinals[3][2].winner)],
    ];

    semiFinals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    const finals: [GroupTeam, GroupTeam, Match][] = [
      [semiFinals[0][2].winner, semiFinals[1][2].winner, this.matchScore(semiFinals[0][2].winner, semiFinals[1][2].winner)],
      [semiFinals[0][2].loser, semiFinals[1][2].loser, this.matchScore(semiFinals[0][2].loser, semiFinals[1][2].loser)],
    ];
    finals.forEach(t => {
      t[2].winner.matchHistory.bracket.push({ match: t[2], opp: t[2].loser });
      t[2].loser.matchHistory.bracket.push({ match: t[2], opp: t[2].winner });
    });

    // console.log(groups.map(z => z.map(t => [t.name, t.ranking, `Pot${t.pot}`, t.tier, t.region])));

    const groupWinners = gWinners.flat() as GroupTeam[];

    return {
      groupWinners,
      bracket: {
        roundOf16,
        quarterFinals,
        semiFinals,
        finals,
      },
    };
  }

  getTournamentAwards(
    bracket: {
      roundOf16: [GroupTeam, GroupTeam, Match][];
      quarterFinals: [GroupTeam, GroupTeam, Match][];
      semiFinals: [GroupTeam, GroupTeam, Match][];
      finals: [GroupTeam, GroupTeam, Match][];
    },
    groups: GroupTeam[][],
    availableRegions?: Region[]
  ): [GroupTeam, GroupTeam, GroupTeam, GroupTeam, GroupTeam, GroupTeam?, GroupTeam?, GroupTeam?, GroupTeam?, GroupTeam?, GroupTeam?] {
    const first = bracket.finals[0][2].winner;
    const second = bracket.finals[0][2].loser;
    const third = bracket.finals[1][2].winner;

    const finalists = bracket.finals.flatMap(m => [m[2].winner, m[2].loser]);

    const overPerformer = finalists.find((t: GroupTeam) => {
      if (t.ranking && availableRegions) {
        return availableRegions.length > 4 ? t.ranking > 12 : t.ranking > 30;
      }
      return 0 > 1;
    })
      ? finalists.reduce((prev, curr) => (prev.rating < curr.rating ? prev : curr))
      : groups.flatMap(group => group.slice(0, 2)).reduce((prev, curr) => (prev.rating < curr.rating ? prev : curr));
    const underPerformer = groups.flatMap(group => group.slice(-2)).reduce((prev, curr) => (prev.rating > curr.rating ? prev : curr));

    return [first, second, third, underPerformer, overPerformer];
  }
}
