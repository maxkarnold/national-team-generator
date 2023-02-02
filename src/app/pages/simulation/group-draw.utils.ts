import { compare } from '@shared/utils';
import { GroupTeam } from 'app/models/nation.model';
import { Region } from './simulation.model';

export const compareFn = (first: string[], a: string, b: string) => {
  let returnValue;
  if (first.includes(a)) {
    returnValue = -1;
  } else if (first.includes(b)) {
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

export const sortGroups = (h: string[]) => (t: GroupTeam[][]) =>
  t
    .map(team => team.sort(({ name: a }: { name: string }, { name: b }: { name: string }) => compareFn(h, a, b)))
    .sort(([{ name: a }], [{ name: b }]) => compareFn(h, a, b));

export const draw = (
  pts: GroupTeam[][],
  nbrOfGroups: number,
  availableRegions: Region[],
  startTime: number,
  failed = false
): GroupTeam[][] => {
  const regionValues = availableRegions.map(r => r.value);
  const allTeams: GroupTeam[] = pts.flatMap((p, i) => {
    const team = p.map(x => ({ ...x, pot: i + 1 }));
    if (availableRegions.length > 1) {
      team.sort(({ region: a }, { region: b }) => compare(a, b, true));
    }
    return team;
  });
  let test = false;
  // console.log(allTeams.map(a => a.name));
  const groups: GroupTeam[][] = Array.from({ length: nbrOfGroups }, _ => []);
  for (let i = 0; i < allTeams.length; i++) {
    // for each team in the draw
    const team = allTeams[i];
    // console.log('TEAM', team.region, team.pot);
    const candidateGroups = groups.filter(
      // return each group that returns true to ...
      group => {
        if (failed) {
          return group.length < allTeams.length / nbrOfGroups && group.every(member => member.pot !== team.pot);
        }
        if ((availableRegions.length > 4 && !regionValues.includes('ofc')) || availableRegions.length > 5) {
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

        const regions2 = availableRegions
          .filter(r => r.qualifiers.auto + r.qualifiers.extra > 7 && r.qualifiers.auto + r.qualifiers.extra < 9)
          .map(r => r.value);
        const regions3 = availableRegions
          .filter(r => r.qualifiers.auto + r.qualifiers.extra > 8 && r.qualifiers.auto + r.qualifiers.extra < 13)
          .map(r => r.value);
        const regions4 = availableRegions.filter(r => r.qualifiers.auto + r.qualifiers.extra > 12).map(r => r.value);
        if (!test) {
          // console.log(availableRegions, regions2, regions3, regions4);
          test = false;
        }
        return (
          group.length < allTeams.length / nbrOfGroups &&
          group.every(member => {
            if (availableRegions.length < 4) {
              return member.pot !== team.pot;
            }
            if (regions4.includes(team.region)) {
              return member;
            }
            if (regions3.includes(team.region)) {
              return group.filter(m => regions3.includes(m.region)).length < 3;
            }
            // console.log(member.pot, team.pot);
            return regions2.includes(team.region)
              ? group.filter(m => regions2.includes(m.region)).length < 2
              : group.every(m => m.region !== team.region);
          })
        );
      }
    );
    if (candidateGroups.length < 1) {
      if (Date.now() > startTime + 4000) {
        // console.log(
        //   'ERROR WITH POT DRAW initiate failsafe',
        //   allTeams.map(t => `${t.name} ${t.pot} ${t.region}`)
        // );
        return draw(pts, nbrOfGroups, availableRegions, startTime, true);
      }
      return draw(pts, nbrOfGroups, availableRegions, startTime);
    }
    candidateGroups[Math.floor(Math.random() * candidateGroups.length)].push(team);
  }

  console.log(
    'groups',
    groups.map(g => g.map(t => `${t.name} ${t.region}`))
  );
  return groups;
};

export const backupDraw = (pts: GroupTeam[][], nbrOfGroups: number, availableRegions: Region[]) => {
  const regionValues = availableRegions.map(r => r.value);
  const allTeams: GroupTeam[] = pts.flatMap((p, i) => {
    const team = p.map(x => ({ ...x, pot: i + 1 }));
    if (availableRegions.length > 1) {
      team.sort(({ region: a }, { region: b }) => compare(a, b, true));
    }
    return team;
  });
  const groups: GroupTeam[][] = Array.from({ length: nbrOfGroups }, _ => []);
  for (let i = 0; i < allTeams.length; i++) {
    // for each team in the draw
    const team = allTeams[i];
    // console.log('TEAM', team.region, team.pot);
    const candidateGroups = groups.filter(
      // return each group that returns true to ...
      group => {
        if ((availableRegions.length > 4 && !regionValues.includes('ofc')) || availableRegions.length > 5) {
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
        return group.length < allTeams.length / nbrOfGroups && group.every(member => member.pot !== team.pot);
      }
    );
    candidateGroups[Math.floor(Math.random() * candidateGroups.length)].push(team);
  }
  console.log(
    'groups',
    groups.map(g => g.map(t => `${t.name} ${t.region}`))
  );
  return groups;
};

export const drawAndSort = (t: GroupTeam[][], h: string[], nbrOfGroups: number, availableRegions: Region[], startTime?: number) => {
  if (startTime) {
    return sortGroups(h)(draw(t, nbrOfGroups, availableRegions, startTime));
  } else {
    return sortGroups(h)(backupDraw(t, nbrOfGroups, availableRegions));
  }
};
