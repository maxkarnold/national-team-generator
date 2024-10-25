export interface SquadRule {
  text: string;
  check: '❌' | '→' | '✅';
}

export const SQUAD_RULES: SquadRule[] = [
  {
    text: '1 starting goalkeeper',
    check: '❌',
  },
  {
    text: 'EXACTLY 3 goalkeepers in squad',
    check: '❌',
  },
  {
    text: '3-4 starting defenders',
    check: '❌',
  },
  {
    text: 'min. 6 defenders in squad',
    check: '❌',
  },
  {
    text: '2-6 starting midfielders',
    check: '❌',
  },
  {
    text: 'min. 5 midfielders in squad',
    check: '❌',
  },
  {
    text: 'Valid formation',
    check: '❌',
  },
  {
    text: 'Backup player in each position',
    check: '❌',
  },
  {
    text: '',
    check: '→',
  },
];
