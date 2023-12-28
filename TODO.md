# PROJECT TODO LIST

## PRIORITIES

- Continue work on Career page
  - Small Changes:
    <!-- - adjust numbers to the 400 percentage -->
    <!-- - player should choose a nationality to be within the career and will be able to start at a club within that nation. -->
    <!-- - player ability limitations should not be a factor for the starting club. -->
    - fix flag emojis for Windows
    - add tournament format for 48 teams and allow for 3 nation host
    - player should receive injuries
    - player progression should have more of a random factor and should improve faster at higher reputation clubs
  - account for substitute appearances
  - include games in cup and continental competitions
  - adjust wage amounts offered to be more accurate
  <!-- - choose a native country, preferably one of the countries that are available as leagues.
    - this can be a different system where as a youngster you are locked to a certain club or nation -->
  <!-- - fix star issue, where it doesn't round correctly to the nearest half integer, might need to change to a different star rating to display -->
  <!-- - introduce loans as an option to get more game time -->
  - add more teams to clubs.json so that I can add more playable leagues in the simulation
  - maybe introduce a system that could relegate/promote a team or reflect their progress

- Restore project to previous functionality on the same level as the deployed website

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
