# PROJECT TODO LIST

## PRIORITIES
- Moba Draft Page
  <!-- - Add PvE functionality -->
  - Add Synergy combos
    - add combos for jungle/mid, jungle/top
  - Adjust draft score
    - changing role of champ should change draft score
    - should give error, "champ can't be selected, because you have already selected a champ with one role in that role"
  - Add Counters
  - Make it easier to draft a team that has one champion in each role and make sure scoring is worse if that is not the case.

- Continue work on Career page
  - Small Changes:
    - player should receive injuries
    - player progression should have more of a random factor and should improve faster at higher reputation clubs
  - account for substitute appearances
  - include games in cup and continental competitions
  - adjust wage amounts offered to be more accurate
  - add more teams to clubs.json so that I can add more playable leagues in the simulation
  - maybe introduce a system that could relegate/promote a team or reflect their progress
- Tournament simulation page
  <!-- - add tournament format for 48 teams and allow for 3 nation host -->
  - FIXES
    <!-- - fix so that 32 team format is playable again -->
    <!-- - enable different hosts for 48 team world cup -->
    - when switching from 32 teams to 48, there's a bug where the draw doesn't work and it uses 34 teams; also uses 32 team function.
    - re-enable regions so that they can be selected for all formats
  - OPTIMIZATION
    - like autoBracketQualifiers(), add additional functions for other formats like (round-robin groups and two leg playoff ties)
  - Create a popup when creating a new tournament/simulating
    - user can choose a nation of those that qualified and the simulation will continue and show that nation
    - nations should appear as a list of buttons in ranked order
    - To make this easier: this can be enabled for only hitting the 'simulate' button first, then later on add the functionality for all simulations

## LONG TERM PLANS

- Create playable tournaments
- potentially move to React
- potentially move to IndexedDB (something on the client side, like local storage)

## SECONDARY (NEED TO VERIFY IF NECESSARY)

- Optimize file sizes to fit build size budget for Angular
- Fix loading leaderboard bug
- Fix alt positions so that they aren't undefined and duplicate positions
- Fix first name and last name creation so that the right number of names is created
- Create tooltip modal for players to better view their stats/attributes

## TERTIARY (NEED TO VERIFY IF NECESSARY)

- add more clubs to clubs.json in the lower tiers to add more variety
- change the foot property to have no "either" string (very weak, weak, reasonable, strong, very strong), descriptions for each foot
- Add the ability to click on players, to move them to a new position. (For Mobile)
- Two options:
  1. Allow the ability to move pitchPlayers from the expansion panels.
  2. Create an alert/warning that you can't move players off the pitch from the expansion panel.
- Add chemistry to UI with FM (partnerships) or FIFA (chemistry) method
- Add random cities as birthplaces for players
- create a guide page or a tutorial to help understand the generator
- When dragging a player within the pitch UI, the original position box goes away. Add a placeholder, so that it doesn't look weird and you can place the player back.
- Update the UI so the buttons are more compact and the data/players are easier to get to.
- Need to fix bulgarian surnames to not include feminine surnames
- Add a function that creates or grabs a random Brazilian/Spanish nickname

## COMPONENT STRUCTURE

- @nav-bar
- login
- leaderboard
- home
  - build-roster
  - lineup
    - @squad-rules
    - @lineup-accordion
    - @pitch-view
      - @player-card
  - roster
    - @position-breakdown
