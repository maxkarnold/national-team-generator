import { Component, HostListener, OnInit } from '@angular/core';
import { GroupTeam } from 'app/models/nation.model';
import { originalOrder } from '@shared/utils';
import { RegionName, Tournament } from 'app/pages/simulation/simulation.model';
import { findTeamInTournament, getDisplayRating, getGradeStyle, getGradeSummary } from 'app/pages/simulation/simulation.utils';
import { SimulationService } from 'app/pages/simulation/simulation.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-nation-dialog',
  templateUrl: './nation-dialog.component.html',
  styleUrls: ['./nation-dialog.component.scss'],
})
export class NationDialogComponent implements OnInit {
  service: SimulationService;
  isApp = false;
  nation: GroupTeam | null = null;
  tournament: Tournament | null = null;
  screenWidth: number;
  originalOrder = originalOrder;
  getDisplayRating = getDisplayRating;

  rounds = ['Round of 16', 'Quarter Finals', 'Semi Finals', 'Finals / Third Place Match'];
  stages = [
    {
      heading: 'Qualifiers',
      prop: 'qualifiers',
    },
    {
      heading: 'Group Stage',
      prop: 'group',
    },
    {
      heading: 'Knockout Stage',
      prop: 'bracket',
    },
  ];

  constructor(service: SimulationService) {
    this.screenWidth = window.innerWidth;
    this.getScreenSize();
    this.service = service;
    this.isApp = service.checkForApp();

    service.tournament$.pipe(untilDestroyed(this)).subscribe(t => (this.tournament = t));

    combineLatest([service.tournament$, service.selectedNation$])
      .pipe(untilDestroyed(this))
      .subscribe(([tournament, nation]) => {
        this.tournament = tournament;
        this.nation = nation;
        if (nation && !nation.reportCard.grade && tournament?.groupWinners) {
          this.getNationReportCard(nation);
        }
      });
  }

  ngOnInit(): void {
    this.rounds = this.tournament?.bracket?.roundOf32
      ? ['Round of 32', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Finals / Third Place Match']
      : ['Round of 16', 'Quarter Finals', 'Semi Finals', 'Finals / Third Place Match'];
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenWidth = window.innerWidth;
  }

  changeSelectedNation(nation?: GroupTeam) {
    if (nation === this.nation || !this.tournament?.groups) {
      return;
    }
    const nationWithStats = this.tournament.groups.flat().find(a => a.name === nation?.name);
    if (nationWithStats) {
      this.service.changeSelectedNation(nationWithStats);
      return;
    } else if (nation) {
      this.service.changeSelectedNation(nation);
      return;
    }
    this.service.changeSelectedNation(null);
  }

  getNationReportCard(team: GroupTeam) {
    const { tournament } = this;
    if (!team.ranking || !tournament?.groups) {
      return;
    }

    const nation = findTeamInTournament(tournament.groups, team) ?? team;
    let rankingTiers: Array<string | number> = ['s', 'a', 'b', 'c', 'd', 'e', 'f', 'g'];
    if (tournament.availableRegions) {
      const availableRegions = tournament.availableRegions.map(r => r.value);

      if (availableRegions.length === 1) {
        if (availableRegions[0] === RegionName.uefa) {
          rankingTiers = [5, 10, 20, 35, 50, 80, 100, 400];
        } else if (availableRegions[0] === RegionName.caf) {
          rankingTiers = [30, 60, 80, 110, 120, 130, 140, 400];
        }
      } else if (availableRegions.length < 5) {
        if (!availableRegions.includes(RegionName.uefa) && !availableRegions.includes(RegionName.conmebol)) {
          rankingTiers = [30, 60, 80, 110, 120, 130, 140, 400];
        } else if (
          !availableRegions.includes(RegionName.afc) &&
          !availableRegions.includes(RegionName.afc) &&
          !availableRegions.includes(RegionName.concacaf)
        ) {
          rankingTiers = [5, 10, 20, 35, 50, 80, 100, 400];
        } else {
          rankingTiers = [8, 18, 25, 32, 50, 70, 100, 400];
        }
      }
    }
    rankingTiers.every((r, i) => {
      if (nation.ranking && ((typeof r === 'number' && nation.ranking <= r) || nation.tier === r || nation.pot === r)) {
        const { grade, result } = this.calcGrade(nation, i);
        nation.reportCard.grade = grade;
        nation.reportCard.tournamentFinish = result;
        nation.reportCard.gradeStyle = getGradeStyle(grade);
        nation.reportCard.gradeSummary = getGradeSummary(nation);
        return false;
      }
      return true;
    });
  }

  calcGrade(
    nation: GroupTeam,
    rankingIndex: number
  ): {
    grade: string;
    result: string;
  } {
    const { tournament } = this;
    if (tournament?.groupWinners === undefined || tournament.bracket === undefined || tournament.awards === undefined) {
      return { grade: 'n/a', result: 'Did Not Qualify' };
    }
    let gradeArr = ['f', 'f', 'f', 'f', 'f', 'f', 'f', 'f'];
    let result = '';
    if (nation.matchesPlayed < 3) {
      gradeArr = Array(8).fill('n/a');
      result = 'Did Not Qualify';
    } else if (nation.points < 3 && nation.gDiff < -3) {
      gradeArr = ['f', 'f', 'f', 'd', 'c', 'c', 'c', 'b'];
      result = 'Group Stage';
    } else if (nation.points < 3) {
      gradeArr = ['f', 'f', 'd', 'c', 'c', 'b', 'b', 'a'];
      result = 'Group Stage';
    } else if (!tournament.groupWinners.includes(nation)) {
      gradeArr = ['f', 'f', 'c', 'c', 'b', 'b', 'a', 's'];
      result = 'Group Stage';
    } else if (!tournament.bracket.quarterFinals.flat().includes(nation)) {
      gradeArr = ['d', 'd', 'b', 'a', 'a', 's', 's', 's'];
      [result] = this.rounds;
    } else if (!tournament.bracket.semiFinals.flat().includes(nation)) {
      gradeArr = ['c', 'c', 'b', 'a', 's', 's', 's', 's'];
      result = 'Quarter Finals';
    } else if (tournament.bracket.finals[1].includes(nation) && tournament.awards[2] !== nation) {
      gradeArr = ['b', 'b', 'a', 's', 's', 's', 's', 's'];
      result = '4th Place';
    } else if (tournament.awards[2] === nation) {
      gradeArr = ['b', 'a', 'a', 's', 's', 's', 's', 's'];
      result = '3rd Place';
    } else if (tournament.awards[1] === nation) {
      gradeArr = ['b', 'a', 's', 's', 's', 's', 's', 's'];
      result = 'Runner Up';
    } else if (tournament.awards[0] === nation) {
      gradeArr = ['a', 'a', 's', 's', 's', 's', 's', 's'];
      result = 'Winner';
    } else {
      gradeArr = Array(8).fill('n/a');
      result = 'Did Not Qualify';
    }
    return {
      grade: gradeArr[rankingIndex],
      result,
    };
  }

  getCoachRating(rating: number): string {
    if (rating > 96) {
      return 'S+';
    } else if (rating > 92) {
      return 'S';
    } else if (rating > 89) {
      return 'S-';
    } else if (rating > 86) {
      return 'A+';
    } else if (rating > 82) {
      return 'A';
    } else if (rating > 79) {
      return 'A-';
    } else if (rating > 76) {
      return 'B+';
    } else if (rating > 72) {
      return 'B';
    } else if (rating > 69) {
      return 'B-';
    } else if (rating > 66) {
      return 'C+';
    } else if (rating > 62) {
      return 'C';
    } else if (rating > 59) {
      return 'C-';
    } else if (rating > 56) {
      return 'D+';
    } else if (rating > 52) {
      return 'D';
    } else if (rating > 49) {
      return 'D-';
    } else if (rating > 46) {
      return 'E+';
    } else if (rating > 42) {
      return 'E';
    } else if (rating > 39) {
      return 'E-';
    } else {
      return 'F';
    }
  }
}
