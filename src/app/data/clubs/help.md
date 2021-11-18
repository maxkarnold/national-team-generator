### Special Cases

The `clubs.json` file has a large amount of club information and is more complex than the `nations.json` file. Therefore, it needs explanation.

## Basic Setup

The club info is stored in a json file. It has seven main properties.
### Properties
* top50
* top200
* regularInternational
* averagePlayer
* championshipPlayer
* leagueOnePlayer
* fillerPlayer

Each property represents a rating bracket that every player falls under. The players within these brackets are in these rating ranges, which can be found in the `home.component.ts` file.
### Rating Brackets
* 82-99
* 76-81
* 70-75
* 65-69
* 60-65
* 55-61
* 40-54

Each rating bracket has an array of clubs. These clubs can show up in multiple rating brackets. The clubs have a name and a logo. They also have arrays for `mainNations` and `altNations`.

These represent countries/nationalities that are the most likely to play for this club. The thought process can be kind of confusing and is difficult to explain. 

Basically, each player has an 60% chance to play for a club with the same `mainNation` as their `nationality`. Then, a 40% chance to play for a club with the same `altNation` as their `nationality`. These percentages are approximate as it's difficult to know the exact chance a player has to have a specific club. If the player doesn't find a `mainNation` or a `altNation` that matches, they will randomly be assigned a club from their rating bracket.

The `mainNations` and `altNations` arrays for each club are decided based on the club's nation and league. The nationalities included also change depending on the rating bracket. For example, players are more likely to play for clubs in their own nation when they are in a lower rating bracket. Most clubs have the same nationalties included in each array when they are from the same league, but there are some exceptions.

## Exceptions
> This is a rolling list that will change as more clubs are added.
* Wolves: Portugal added as `altNation`
* Athletic Bilbao: all nations are removed from both arrays except for Spain
* Chivas: all nations are removed from both arrays except for Mexico
* Some english clubs are championship and some are premier league. Championship clubs have more altNations.


