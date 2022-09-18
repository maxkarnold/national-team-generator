import { Component } from '@angular/core';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
})
export class RosterComponent {
  constructor() {}

  sortData(sort: Sort) {
    const data = this.pitchPlayers.concat(this.players);
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return compare(a.lastNames[0], b.lastNames[0], isAsc);
        case 'club':
          return compare(a.club, b.club, isAsc);
        case 'mainPositions':
          return compare(a.mainPositions[0], b.mainPositions[0], isAsc);
        case 'altPositions':
          return compare(a.altPositions[0], b.altPositions[0], isAsc);
        case 'foot':
          return compare(a.foot, b.foot, isAsc);
        case 'rating':
          return compare(a.rating, b.rating, isAsc);
        case 'age':
          return compare(a.age, b.age, isAsc);
        case 'nationality':
          return compare(a.nationality, b.nationality, isAsc);
        case 'roleDuty':
          return compare(a.preferredRole, b.preferredRole, isAsc);
        // case 'displayHeight': return compare(a.height, b.height, isAsc);
        // case 'weight': return compare(a.weight, b.weight, isAsc);
        default:
          return 0;
      }
    });
  }
}
