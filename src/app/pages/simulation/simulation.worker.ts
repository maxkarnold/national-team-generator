// eslint-disable-next-line spaced-comment
/// <reference lib="webworker" />

import { GroupTeam } from '../../models/nation.model';
import { drawAndSort } from './group-draw.utils';

// ======= draw teams into groups ===========

addEventListener('message', ({ data }) => {
  const response = {
    draw: drawAndSort(
      data.potTeams,
      data.hosts.map((h: GroupTeam) => h.name),
      data.teamsInPot,
      data.availableRegions,
      data.start
    ),
  };
  postMessage(response);
});
