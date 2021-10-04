### Special Cases

The `clubs.json` file has a large amount of club information and is more complex than the `nations.json` file. Therefore, it needs explanation.

## Basic Setup

The club info is stored in a json file. It has five main properties.
### Properties
* top50
* top200
* regularInternational
* averagePlayer
* average2ndDivPlayer
* fillerPlayer
Each property represents a rating bracket that every player falls under. The players within these brackets are in these rating ranges, which can be found in the `home.component.ts` file.
### Rating Brackets
* 82-99
* 76-81
* 70-75
* 62-69
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
* Some english clubs are championship and some are premier league. Championship clubs have more altNations.

## Teams left to add
<!-- tottenham
dortmund
leicester city
Arsenal -->
### Change Arsenal and above to top50 (DONE)
<!-- everton
roma
aston villa
wolves
sociedad
west ham
leverkeusen
monaco
lyon
lazio
mönchengladbach
wolfsburg
benfica
lille
marseille
leeds united
valencia
fiorentina
brighton
newcastle
southampton
crystal palace
eintracht frankfurt
real betis -->
### Change Real Betis and above to top200 (DONE)
<!-- ogc nice
sassuolo
hoffenheim
norwich city
athletic bilbao
stade rennais
55. torino $202m
Shaktar
zenit
58. vfB Stuttgart $186m
brentford
60. getafe
PSV
62. cagliari $168m
64. club brugge $165m
65. flamengo $162m
fulham $162m
burnley $159m
celta vigo $158m
69. palmeiras $157m
70. bologna $156m
Hertha $150m
watford $146m
dynamo kyiv $146m -->
### Change dynamo kyiv and above to regularInternational (DONE)
### averagePlayer 62-69
74. besiktas $139m
<!-- https://tmssl.akamaized.net/images/wappen/normal/114.png?lm=1502974502 -->
75. KRC genk $139m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1184.png?lm=1464899410 -->
76. spartak moscow $138m
<!-- https://tmssl.akamaized.net/images/wappen/normal/232.png?lm=1443701948 -->
Freiburg $137m
78. sampdoria $137m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1038.png?lm=1520934353 -->
sheffield united
SC Braga $131m
Olympiakos
82. fenerbaçhe
<!-- https://tmssl.akamaized.net/images/wappen/normal/36.png?lm=1406739123 -->
83. krasnodar
<!-- https://tmssl.akamaized.net/images/wappen/normal/16704.png?lm=1499524238 -->
bournemouth $124m
<!-- https://tmssl.akamaized.net/images/wappen/normal/989.png?lm=1457991811 -->
85. levante $123m
<!-- https://tmssl.akamaized.net/images/wappen/normal/3368.png?lm=1408655062 -->
dinamo zagreb
87. hellas verona
<!-- https://tmssl.akamaized.net/images/wappen/normal/276.png?lm=1617228746 -->
rangers
Celtic $72.27m (Should still be in same tier with Rangers)
89. river plate $114m
<!-- https://tmssl.akamaized.net/images/wappen/normal/209.png?lm=1407647555 -->
90. galatasaray
<!-- https://tmssl.akamaized.net/images/wappen/normal/141.png?lm=1406739071 -->
91. udinese
<!-- https://tmssl.akamaized.net/images/wappen/normal/410.png?lm=1437136398 -->
feyenoord
93. mainz 05
94. espanyol $110m
<!-- https://tmssl.akamaized.net/images/wappen/normal/714.png?lm=1406966369 -->
95. genoa
<!-- https://tmssl.akamaized.net/images/wappen/normal/252.png?lm=1438591281 -->
96. atlético mineiro
97. FC augsburg
98. lokomotiv moscow
<!-- https://tmssl.akamaized.net/images/wappen/normal/932.png?lm=1486195738 -->
99. trabzonspor
<!-- https://tmssl.akamaized.net/images/wappen/normal/449.png?lm=1630858822 -->
100. CA osasuna $102m
<!-- https://tmssl.akamaized.net/images/wappen/normal/331.png?lm=1406739464 -->
st etienne
Bordeaux
~102. RSC anderlecht $100.65m
<!-- https://tmssl.akamaized.net/images/wappen/normal/58.png?lm=1443857722 -->
~103. stade reims $99.85m
CSKA moscow $96m
<!-- https://tmssl.akamaized.net/images/wappen/normal/2410.png?lm=1409222667 -->
granada $96m
<!-- https://tmssl.akamaized.net/images/wappen/normal/16795.png?lm=1620472393 -->
~110. boca juniors $95.12m
<!-- https://tmssl.akamaized.net/images/wappen/normal/189.png?lm=1511621129 -->
dynamo moscow $90m
<!-- https://tmssl.akamaized.net/images/wappen/normal/121.png?lm=1597937447 -->
West Brom $88m
<!-- https://tmssl.akamaized.net/images/wappen/normal/984.png?lm=1457991758 -->
parma $86m
<!-- https://tmssl.akamaized.net/images/wappen/normal/130.png?lm=1530945992 -->
Union Berlin $85m
mallorca $81m
<!-- https://tmssl.akamaized.net/images/wappen/normal/237.png?lm=1407484750 -->
slavia praha $79m
empoli $78m
<!-- https://tmssl.akamaized.net/images/wappen/normal/749.png?lm=1626441481 -->
spezia $77m
<!-- https://tmssl.akamaized.net/images/wappen/normal/3522.png?lm=1504611067 -->
venezia $73m
<!-- https://tmssl.akamaized.net/images/wappen/normal/607.png?lm=1504794638 -->
deportivo alavés $72m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1108.png?lm=1596131395 -->
standard liège $71m
<!-- https://tmssl.akamaized.net/images/wappen/normal/3057.png?lm=1496825940 -->
vélez $70m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1029.png?lm=1412763033 -->
FC Basel $68m
Young Boys $68m
royal antwerp $65m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1096.png?lm=1623758865 -->
stoke city $64m
<!-- https://tmssl.akamaized.net/images/wappen/normal/512.png?lm=1472243727 -->
real valladolid $63m
<!-- https://tmssl.akamaized.net/images/wappen/normal/366.png?lm=1407484674 -->
red star belgrade $62m
elche $57m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1531.png?lm=1421955260 -->
rayo vallecano $57m
<!-- https://tmssl.akamaized.net/images/wappen/normal/367.png?lm=1408654926 -->
KAA gent $56m
<!-- https://tmssl.akamaized.net/images/wappen/normal/157.png?lm=1442954733 -->
sparta praha $57m
monza $55m
<!-- https://tmssl.akamaized.net/images/wappen/normal/2919.png?lm=1562072734 -->
nottingham forest $54m
<!-- https://tmssl.akamaized.net/images/wappen/head/703.png?lm=1598890289 -->
almería $53m
<!-- https://tmssl.akamaized.net/images/wappen/normal/3302.png?lm=1408654801 -->
cádiz $52m
<!-- https://tmssl.akamaized.net/images/wappen/normal/2687.png?lm=1417193371 -->
middlesbrough $51m
<!-- https://tmssl.akamaized.net/images/wappen/head/641.png?lm=1443702192 -->
reading $48m
<!-- https://tmssl.akamaized.net/images/wappen/head/1032.png?lm=1457723329 -->
lanús $49m
<!-- https://tmssl.akamaized.net/images/wappen/normal/333.png?lm=1411033921 -->
racing club $45m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1444.png?lm=1412762689 -->
independiente $45m 
<!-- https://tmssl.akamaized.net/images/wappen/normal/1234.png?lm=1489920510 -->
blackburn $43m
<!-- https://tmssl.akamaized.net/images/wappen/head/164.png?lm=1495228542 -->
preston north end $43m
<!-- https://tmssl.akamaized.net/images/wappen/head/466.png?lm=1414769167 -->
birmingham city $42m
<!-- https://tmssl.akamaized.net/images/wappen/head/337.png?lm=1522153307 -->
salernitana $42m
<!-- https://tmssl.akamaized.net/images/wappen/normal/380.png?lm=1601390035 --> 
bristol city $42m
<!-- https://tmssl.akamaized.net/images/wappen/head/698.png?lm=1571314125 -->
brescia $41m
<!-- https://tmssl.akamaized.net/images/wappen/normal/19.png?lm=1511961167 -->
leganés $40m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1244.png?lm=1422972468 -->
colón $40m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1070.png?lm=1623030452 -->
derby county $39m
<!-- https://tmssl.akamaized.net/images/wappen/head/22.png?lm=1407654006 -->
millwall $39m
<!-- https://tmssl.akamaized.net/images/wappen/head/1028.png?lm=1564722431 -->
rapid vienna $38m
QPR $37m
<!-- https://tmssl.akamaized.net/images/wappen/head/1039.png?lm=1464680692 -->
talleres $36m
<!-- https://tmssl.akamaized.net/images/wappen/normal/3938.png?lm=1556629967 -->
argentinos juniors $34m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1030.png?lm=1423343744 -->
barnsley $34m
<!-- https://tmssl.akamaized.net/images/wappen/head/349.png?lm=1574162298 -->
fk partizan $33m
san lorenzo $32m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1775.png?lm=1412762842 -->
LASK $32m
sturm graz $32m
hajduk split $32m
estudiantes $31m
<!-- https://tmssl.akamaized.net/images/wappen/normal/288.png?lm=1615331978 -->
defensa y justicia $31m
<!-- https://tmssl.akamaized.net/images/wappen/normal/2402.png?lm=1615331929 -->
girona $31m
<!-- https://tmssl.akamaized.net/images/wappen/normal/12321.png?lm=1407563608 -->
crotone $31m
<!-- https://tmssl.akamaized.net/images/wappen/normal/4083.png?lm=1520933356 -->
huesca $30m
<!-- https://tmssl.akamaized.net/images/wappen/normal/5358.png?lm=1535899179 -->
lecce $30m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1005.png?lm=1417104356 -->
banfield $29m
<!-- https://tmssl.akamaized.net/images/wappen/normal/830.png?lm=1412763415 -->
huddersfield town $28m
<!-- https://tmssl.akamaized.net/images/wappen/head/1110.png?lm=1567439677 -->
viktoria plzen $24m
newell's old boys $23m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1286.png?lm=1622640330 -->
rosario central $20m
<!-- https://tmssl.akamaized.net/images/wappen/normal/1418.png?lm=1615329886 -->
luton town $20m
<!-- https://tmssl.akamaized.net/images/wappen/head/1031.png?lm=1457723228 -->
coventry city $18m
<!-- https://tmssl.akamaized.net/images/wappen/head/990.png?lm=1457991743 -->
blackpool $14m
<!-- https://tmssl.akamaized.net/images/wappen/head/1181.png?lm=1407655321 -->
hull city $12m
<!-- https://tmssl.akamaized.net/images/wappen/head/3008.png?lm=1562662491 -->
peterborough united $9.9m
<!-- https://tmssl.akamaized.net/images/wappen/head/1072.png?lm=1411463544 -->
### 2ndDivPlayer 55-61
> EFL Championship Teams will be in the category above, while EFL League One teams will be below
sheffield wednesday $27m
<!-- https://tmssl.akamaized.net/images/wappen/head/1035.png?lm=1462978198 -->
cukaricki stankom $14m 
<!-- https://fmdataba.com/images/c/s/1301372.png -->
FK vojvodina $13m 
<!-- https://tmssl.akamaized.net/images/wappen/normal/448.png?lm=1543354208 -->

