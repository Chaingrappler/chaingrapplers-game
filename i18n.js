(function () {
  const STORAGE_KEY = "chaingrapplers-language";
  const DEFAULT_LANG = "en";

  const sv = {
    "A BJJ Card Game": "Ett BJJ-kortspel",
    "Primary": "Primär",
    "Play the Demo": "Spela demon",
    "Inside the Game": "Om spelet",
    "Buy the Physical Game": "Köp det fysiska spelet",
    "Rules": "Regler",
    "Demo": "Demo",
    "Game": "Spelet",
    "Buy": "Köp",
    "Language": "Språk",
    "English": "Engelska",
    "Swedish": "Svenska",
    "ChainGrapplers logo": "ChainGrapplers-logotyp",
    "Chaingrapplers": "ChainGrapplers",
    "Chain attacks. Break pressure. Win the exchange.": "Kedja attacker. Försvara. Vinn duellen.",
    "ChainGrapplers is a head-to-head card game about timing, position, and tactics. The boxed game is the main event, but please try the digital demo so you can feel the system before it hits the table.": "ChainGrapplers är ett taktiskt kortspel för två spelare. Det fysiska spelet är huvudupplevelsen, men testa gärna den digitala demon för att förstå systemet innan korten hamnar på bordet.",
    "Inside ChainGrapplers": "Om ChainGrapplers",
    "Learn how ChainGrapplers turns positions, submissions, escapes, and pressure into a tactical head-to-head card game.": "Lär dig hur ChainGrapplers gör positioner, press och avslut till ett taktiskt kortspel för två.",
    "A tactical BJJ card game built around position, pressure, submissions, and escapes.": "Ett taktiskt BJJ-kortspel byggt runt positioner, press och avslut.",
    "A tactical grappling duel built for the table.": "En taktisk grapplingduell byggd för bordet.",
    "ChainGrapplers is about sequence quality. Better transitions create better pressure, better pressure creates better finishing chances, and one bad choice can flip the whole exchange.": "ChainGrapplers handlar om kvaliteten i sekvensen. Farliga övergångar skapar bättre press, bättre press skapar bättre avslutslägen, och ett dåligt taktiskt val kan vända hela utbytet.",
    "Position": "Position",
    "The colors are not just colors": "Färgerna är inte bara färger",
    "Every card pushes the exchange from one position into another. The system is meant to feel positional, not abstract.": "Varje kort för utbytet från en position till en annan. Systemet ska kännas positionellt, inte abstrakt.",
    "Tempo": "Tempo",
    "Your turn is a resource": "Din tur är en resurs",
    "Playing a second card can build momentum, but it can also leave you exposed on the return if the chain turns against you.": "Att spela ett andra kort kan bygga momentum, men det kan också lämna dig sårbar om kedjan vänder emot dig.",
    "Pressure": "Press",
    "Red is a real threat": "Rött är ett verkligt hot",
    "Submissions demand an answer immediately, which gives the end of the chain real weight.": "Submissions kräver ett svar direkt, annars avslutas kedjan, och därmed spelet.",
    "Why It Works": "Men varför?",
    "A BJJ gift kids can actually play": "En BJJ-present som barn faktiskt kan spela",
    "ChainGrapplers is a Brazilian Jiu-Jitsu card game made for families, kids, and teammates, not only experienced grapplers. If you are looking for a": "ChainGrapplers är ett BJJ-kortspel gjort för familjer, barn och träningskompisar, inte bara erfarna grapplers. Om du letar efter en",
    "BJJ gift": "BJJ-present",
    ", Jiu-Jitsu accessory, or martial arts game for a child who trains, it gives them a way to bring the academy home.": ", en jiu-jitsu-pryl eller ett kampsportsspel till ett barn som tränar, ger det dem ett sätt att ta hem känslan från klubben.",
    "ChainGrapplers is a Brazilian Jiu-Jitsu card game made for families, kids, and teammates, not only experienced grapplers. If you are looking for a BJJ gift, Jiu-Jitsu accessory, or martial arts game for a child who trains, it gives them a way to bring the academy home.": "ChainGrapplers är ett BJJ-kortspel gjort för familjer, barn och träningskompisar, inte bara erfarna grapplers. Om du letar efter en BJJ-present, en jiu-jitsu-pryl eller ett kampsportsspel till ett barn som tränar, ger det dem ett sätt att ta hem känslan från klubben.",
    "You do not need to know BJJ to play. The colors and card flow make the game easy to learn, while quietly teaching how positions, pressure, escapes, and submissions connect. Parents and grandparents can play along, and young grapplers get a better understanding of the sport they already love.": "Du behöver inte kunna BJJ för att spela. Färgerna och kortflödet gör spelet lätt att lära sig, samtidigt som det visar hur positioner, press och avslut hänger ihop. Föräldrar och mor- eller farföräldrar kan spela, och unga grapplers får en bättre förståelse för sporten de redan älskar.",
    "BJJ Positions": "BJJ-positioner",
    "The position ladder behind the cards": "Positionsstegen bakom korten",
    "ChainGrapplers uses grappling positions as the links between cards. Each card moves the exchange from a starting position toward a better, worse, or more dangerous position. Depending on what side of the table you are sitting on.": "ChainGrapplers använder grapplingpositioner som spelets länkar. Varje kort flyttar utbytet från en startposition till en bättre, sämre eller farligare position beroende på vilken sida av bordet du sitter på.",
    "Half guard": "Half guard",
    "Half guard position in Brazilian Jiu-Jitsu": "Half guard-position i brasiliansk jiu-jitsu",
    "Half guard position": "Half guard-position",
    "Half guard sits close to neutral in the game. Both players still have options, but the exchange is starting to take shape.": "Half guard ligger nära neutralt i spelet. Båda spelarna har fortfarande alternativ, men utbytet börjar ta form.",
    "Mount/Full Guard": "Mount/Full guard",
    "Mount or full guard position in Brazilian Jiu-Jitsu": "Mount- eller full guard-position i brasiliansk jiu-jitsu",
    "Mount or full guard position": "Mount- eller full guard-position",
    "Mount/Full Guard represents stronger positional pressure. The attacker has control and direct access to serious submission threats.": "Mount/Full guard representerar starkare positionell press. Angriparen har kontroll och direkt tillgång till farliga avslut.",
    "Back control": "Ryggkontroll",
    "Back control position in Brazilian Jiu-Jitsu": "Ryggkontroll i brasiliansk jiu-jitsu",
    "Back control position": "Ryggkontroll",
    "Back control is a major advantage. It gives the attacker strong control and creates some of the clearest finishing routes.": "Ryggkontroll är ett stort övertag. Det ger angriparen stark kontroll och några av de tydligaste vägarna till avslut.",
    "BJJ Submissions": "BJJ-submissions",
    "Why red cards matter": "Varför röda kort spelar roll",
    "Submissions are the finishers in Brazilian Jiu-Jitsu. In ChainGrapplers, they are represented by red pressure: once a submission is active, the defender cannot ignore it, and only an escape can keep the match alive.": "Submissions är avsluten i brasiliansk jiu-jitsu. I ChainGrapplers representeras de av röd press: när en submission är aktiv kan försvararen inte ignorera den, motståndaren måste fly för att hålla matchen vid liv.",
    "Armbar": "Armbar",
    "Armbar submission": "Armbar-submission",
    "Armbar submission in Brazilian Jiu-Jitsu": "Armbar-submission i brasiliansk jiu-jitsu",
    "Armbar submission attacking the elbow in Brazilian Jiu-Jitsu": "Armbar-submission som attackerar armbågen i brasiliansk jiu-jitsu",
    "The armbar isolates one arm and uses hip pressure to attack the elbow joint. The armbar can be applied from mount, full guard or back control with some minor positional adjustments.": "Armbaren isolerar en arm och använder höftpress för att attackera armbågsleden. Den kan sättas från mount, full guard eller ryggkontroll med några mindre positionsjusteringar.",
    "Rear naked choke": "Rear naked choke",
    "Rear naked choke submission": "Rear naked choke-submission",
    "Rear naked choke submission from back control in Brazilian Jiu-Jitsu": "Rear naked choke från ryggkontroll i brasiliansk jiu-jitsu",
    "Rear naked choke from back control in Brazilian Jiu-Jitsu": "Rear naked choke från ryggkontroll i brasiliansk jiu-jitsu",
    "The classic rear naked choke is applied from the back. That means you will always need to play from orange to apply it.": "Den klassiska rear naked choke sätts från ryggen. Det betyder att du alltid behöver spela från orange för att använda den.",
    "Bow and arrow choke": "Bow and arrow choke",
    "Bow and arrow choke submission": "Bow and arrow choke-submission",
    "Bow and arrow choke submission using lapel control in Brazilian Jiu-Jitsu": "Bow and arrow choke med kragkontroll i brasiliansk jiu-jitsu",
    "Bow and arrow choke using lapel control in Brazilian Jiu-Jitsu": "Bow and arrow choke med kragkontroll i brasiliansk jiu-jitsu",
    "The bow and arrow choke is a gi choke usually built from back control with strong collar and body control. The attacker stretches the defender's posture, which makes the finishing pressure hard to ignore.": "Bow and arrow choke är en gi-strypning som ofta byggs från ryggkontroll med stark krag- och kroppskontroll. Angriparen sträcker ut försvararens hållning, vilket gör avslutspressen svår att ignorera.",
    "Triangle": "Triangle",
    "Triangle submission": "Triangle-submission",
    "Triangle choke submission": "Triangle choke-submission",
    "Triangle choke using the legs around the neck and arm": "Triangle choke med benen runt hals och arm",
    "Triangle choke submission using the legs around the neck and arm": "Triangle choke med benen runt hals och arm",
    "The triangle choke traps the opponent's neck and one arm inside the attacker's legs. It often appears when a defender leaves one arm exposed, turning a scramble into submission danger.": "Triangle choke fångar motståndarens hals och ena arm mellan angriparens ben. Den dyker ofta upp när en försvarare lämnar en arm exponerad och gör en scramble till submissionfara.",
    "Kimura": "Kimura",
    "Kimura submission": "Kimura-submission",
    "Kimura shoulder lock and control position": "Kimura-axellås och kontrollposition",
    "Kimura shoulder lock submission and control position in Brazilian Jiu-Jitsu": "Kimura-axellås och kontrollposition i brasiliansk jiu-jitsu",
    "The Kimura is a shoulder lock built around a strong figure-four grip. It is also a control tool, because the same grip can force reactions, open transitions, or lead directly to the finish.": "Kimura är ett axellås byggt runt ett starkt figure-four-grepp. Det är också ett kontrollverktyg, eftersom samma grepp kan tvinga fram reaktioner, öppna övergångar eller leda direkt till avslut.",
    "Submission escape": "Submission-escape",
    "Submission escape and defensive recovery in Brazilian Jiu-Jitsu": "Submission-escape och defensiv återhämtning i brasiliansk jiu-jitsu",
    "An escape is the defensive answer to a finishing threat. In the game, escaping does more than survive the attack: it pulls the exchange back to a neutral position and keeps the chain alive.": "En escape är det defensiva svaret på ett avslutshot. I spelet gör en escape mer än att överleva attacken: den drar utbytet tillbaka till en neutral position och håller kedjan vid liv.",
    "Buy ChainGrapplers": "Köp ChainGrapplers",
    "Bring the pressure to the table.": "Ta spelet till bordet.",
    "Fast rounds, real submission threats, and constant tactical decisions. Try the browser demo, then get the boxed game through our Shopify store.": "Snabba rundor, verkliga submissionhot och ständiga taktiska beslut. Testa webbdemon och köp sedan det fysiska spelet via vår Shopify-butik.",
    "Open the Shopify store": "Öppna Shopify-butiken",
    "Buy Now": "Köp nu",
    "Shopify Store": "Shopify-butik",
    "Open the store": "Öppna butiken",
    "ChainGrapplers Rules": "ChainGrapplers regler",
    "Learn the game fast, then check the full rules.": "Lär dig spelet snabbt, läs sedan de fullständiga reglerna.",
    "Start with the short version, then move into the exact chain logic, submission pressure, and special card effects.": "Börja med den korta versionen och gå sedan vidare till exakt kedjelogik, submissionpress och specialkortens effekter.",
    "Quick Rules": "Snabbregler",
    "Give the youngest player the": "Ge den yngsta spelaren",
    "card.": "kortet.",
    "Shuffle the deck and deal the cards.": "Blanda leken och dela ut korten.",
    "Each player starts with 6 cards.": "Varje spelare börjar med 6 kort.",
    "The round opens with": "Rundan öppnas med",
    "On your turn, you may play up to 2 cards.": "Vid din tur får du spela upp till 2 kort.",
    "Most cards follow the chain. Your card's": "De flesta kort följer kedjan. Ditt korts",
    "Start color": "Startfärg",
    "(top) must match the current card's": "(överst) måste matcha det aktuella kortets",
    "Result color": "Resultatfärg",
    "(bottom).": "(nederst).",
    "If a player plays an offensive card, the opponent must answer with a defensive card that matches the color.": "Om en spelare spelar ett offensivt kort måste motståndaren svara med ett defensivt kort som matchar färgen.",
    "At the end of your turn, you may draw 1 card (if you are not holding": "I slutet av din tur får du dra 1 kort (om du inte håller",
    ", which prevents you from drawing new cards).": ", vilket hindrar dig från att dra nya kort).",
    "If a submission is active, the defender must answer with an escape. If they have no playable card, they get one": "Om en submission är aktiv måste försvararen svara med en escape. Om spelaren inte har något spelbart kort får spelaren en",
    "draw from the pile. If the Hail Mary card is not playable on the submission, the defender has been submitted.": "dragning från högen. Om chans-kortet inte kan spelas på submissionen har försvararen blivit avslutad.",
    "How to Read a Card": "Så läser du ett kort",
    "Each positional card shows a move from one position into another.": "Varje positionskort visar en rörelse från en position till en annan.",
    ": where the move begins.": ": där rörelsen börjar.",
    ": where the move ends.": ": där rörelsen slutar.",
    "Think of every normal card as a positional transition.": "Varje kort ska ses som en positionsövergång.",
    "Green": "Grön",
    ": the most neutral state. Momentum can swing here.": ": det mest neutrala läget. Momentum kan svänga här.",
    "Yellow": "Gul",
    ": stronger pressure and stronger control.": ": starkare press och starkare kontroll.",
    "Orange": "Orange",
    ": major advantage and high finishing pressure.": ": stort övertag och hög avslutspress.",
    "Red": "Röd",
    ": submission threat or submission escape.": ": avslut eller flykt.",
    "Defensive cards": "Defensiva kort",
    "pull the exchange back toward near-neutral half guard.": "drar utbytet tillbaka mot neutral halv guard.",
    "Visual Guide": "Visuell guide",
    "How the chain works": "Så fungerar kedjan",
    "This is one example of how cards can connect through matching colors.": "Det här är ett exempel på hur kort kan kopplas ihop genom matchande färger.",
    "Takedown card": "Takedown-kort",
    "Yellow to green defensive card": "Gult till grönt defensivt kort",
    "Green to orange offensive card": "Grönt till orange offensivt kort",
    "Orange to red offensive card": "Orange till rött offensivt kort",
    "Red to green escape card": "Rött till grönt escape-kort",
    "Player 1": "Spelare 1",
    "starts each match with the": "börjar varje match med",
    "needs a": "behöver ett",
    "defensive": "defensivt",
    "response.": "svar.",
    "always end on": "slutar alltid på",
    ", so": ", så",
    "can attack again with a green-start card.": "kan attackera igen med ett kort som startar på grönt.",
    "can continue the attack with a second offensive card because the chain now ends on": "kan fortsätta attacken med ett andra offensivt kort eftersom kedjan nu slutar på",
    "must answer the red submission threat with an": "måste svara på det röda submissionhotet med ett",
    "escape card": "escape-kort",
    ". With no playable card, one": ". Utan spelbart kort kan en",
    "draw can save them.": "dragning rädda spelaren.",
    "Full Rules": "Fullständiga regler",
    "Setup": "Förberedelser",
    "The game is for 2 players.": "Spelet är för 2 spelare.",
    "Shuffle the deck and deal 6 cards to each player (the": "Blanda leken och dela 6 kort till varje spelare (",
    "card should be one of them).": "kortet ska vara ett av dem).",
    "One player opens the round with": "En spelare öppnar rundan med",
    "(must be played alone.).": "(måste spelas ensamt.).",
    "How cards become legal": "Hur kort blir spelbara",
    "Any defensive card is legal to play on": "Alla defensiva kort är spelbara på",
    "After that, a card is legal when its": "Efter det är ett kort spelbart när dess",
    "matches the current card's": "matchar det aktuella kortets",
    "If a player plays a defensive card, the next response is offensive.": "Om en spelare spelar ett defensivt kort är nästa kort offensivt.",
    "If an attacker still has a second legal offensive card, they may continue the attack on the same turn.": "Om angriparen fortfarande har ett andra spelbart offensivt kort får attacken fortsätta på samma tur.",
    "Turn structure": "Turstruktur",
    "You may play up to 2 cards on your turn.": "Du får spela upp till 2 kort på din tur.",
    "You may choose to stop and draw even if you still have a legal move.": "Du får välja att stanna och dra även om du fortfarande har ett spelbart drag.",
    "If": "Om",
    "is in your hand, drawing is blocked. You must either play a legal card, or end the turn without drawing.": "finns på handen är dragning blockerad. Du måste antingen spela ett kort eller avsluta turen utan att dra.",
    "Submissions": "Submissions",
    "A red offensive card creates an active submission threat.": "Ett rött offensivt kort skapar ett aktivt submissionhot.",
    "When you are under submission, you may not draw, pass, or end turn unless the Hail Mary rule triggers.": "När du är under submission får du inte dra, passa eller avsluta turen.",
    "You must answer with an escape.": "Du måste svara med en escape.",
    "If you have no playable card after a red submission is played, draw one": "Om du inte har något spelbart kort efter att en röd submission har spelats, dra ett",
    "card from the pile.": "kort från högen.",
    "If the Hail Mary card is an escape card, play it immediately and continue as normal. If it is not an escape card, you are submitted and lose immediately.": "Om chans-kortet är ett escape-kort spelas det direkt och spelet fortsätter som vanligt. Om det inte är ett escape-kort blir du avslutad och förlorar direkt.",
    "Special Cards": "Specialkort",
    ": draw 3 cards. It counts as one played card. The chain does not change, and the card is thrown into the discard pile.": ": dra 3 kort. Det räknas som ett spelat kort. Kedjan ändras inte (kortet läggs i \"skräphögen\" för använda kort).",
    ": play it into the chain. The next card may be any follow-up.": ": spela det in i kedjan. Nästa kort får spelaren själv välja.",
    ": play it into the chain, then pick up the most recently played card, except Takedown. The next card may be any follow-up.": ": spela det in i kedjan och plocka sedan upp det senast spelade kortet, förutom Takedown. Nästa kort får spelaren själv välja.",
    ": can only be played as your first and only card of the turn. After Fatigue, the next player may play any card.": ": kan bara spelas som ditt första och enda kort den turen. Efter Fatigue får nästa spelare spela vilket kort som helst.",
    "cards: steal 1 random card from your opponent. The chain does not change, and the card is thrown into the discard pile.": "kort: stjäl 1 slumpmässigt kort från motståndaren. Kedjan ändras inte (kortet läggs i \"skräphögen\" för använda kort).",
    "Winning": "Vinst",
    ": if your opponent cannot answer an active submission and fails the Hail Mary draw, you win.": ": om din motståndare inte kan svara på en aktiv submission och misslyckas med chans-dragningen vinner du.",
    "Card advantage": "Kortövertag",
    ": if the deck is exhausted and the chain can no longer continue, the player with fewer cards left wins.": ": om leken är slut och kedjan inte längre kan fortsätta vinner spelaren med färst kort kvar på handen.",
    "Draw": "Oavgjort",
    ": if both players are equally stuck, the round is a draw.": ": om båda spelarna är lika fast blir rundan oavgjord.",
    "New Match": "Ny match",
    "Bot": "Bot",
    "Cards in hand": "Kort på hand",
    "Start match.": "Starta matchen.",
    "Discard": "Använda kort",
    "Chain Area": "Kedjeområde",
    "Draw Pile": "Draghög",
    "Card back": "Kortbaksida",
    "Draw / End Turn": "Dra / avsluta tur",
    "Your Hand": "Din hand",
    "Round Over": "Rundan är över",
    "Bot Thinking": "Botten tänker",
    "End Turn": "Avsluta tur",
    "Hail Mary": "Chanskort",
    "Winner!": "Vinnare!",
    "Close": "Stäng",
    "Card preview": "Kortförhandsvisning",
    "Play Card": "Spela kort",
    "takedown": "takedown",
    "half guard": "half guard",
    "full guard/mount": "full guard/mount",
    "back control": "ryggkontroll",
    "submission": "submission",
    "Mat Enforcer": "Mat Enforcer",
    "Teenage Rage": "Teenage Rage",
    "The Black Belt": "The Black Belt",
    "Fatigue": "Fatigue",
    "Ultra Heavy": "Ultra Heavy",
    "3 cards drawn from pile.": "3 kort drogs från högen.",
    "Follow up with any card.": "Följ upp med valfritt kort.",
    "Opponent may play any card.": "Motståndaren får spela vilket kort som helst.",
    "stole a random card.": "stal ett slumpmässigt kort.",
    "Round finished. Start a new match when ready.": "Rundan är slut. Starta en ny match när du är redo.",
    "Open the round with Takedown.": "Öppna rundan med Takedown.",
    "Bot is choosing the next link in the chain.": "Botten väljer nästa länk i kedjan.",
    "No escape in hand. Take one Hail Mary draw from the pile.": "Ingen escape på handen. Ta en Hail Mary-dragning från högen.",
    "Submission is active. You must answer with an in-chain escape.": "Submission är aktiv. Du måste svara med en escape i kedjan.",
    "No legal cards to play. Use the highlighted button to draw and pass the turn.": "Inga spelbara kort att spela. Använd den markerade knappen för att dra och passa turen.",
    "Fatigue is in your hand. Play a legal card before you can end the turn.": "Fatigue finns på handen. Spela ett spelbart kort innan du kan avsluta turen.",
    "You may end the turn now, but Fatigue prevents drawing a new card.": "Du får avsluta turen nu, men Fatigue hindrar dig från att dra ett nytt kort.",
    "You have used both plays this turn. End the turn to continue.": "Du har använt båda spelen den här turen. Avsluta turen för att fortsätta.",
    "Play up to two legal cards, then draw to pass the turn.": "Spela upp till två spelbara kort och dra sedan för att passa turen.",
    "move": "drag",
    "in-chain escape": "escape i kedjan",
    "follow-up move": "uppföljningsdrag",
    "offensive move": "offensivt drag",
    "defensive move": "defensivt drag",
    "No escape in hand. Take the Hail Mary draw.": "Ingen escape på handen. Ta chans-dragningen.",
    "Submission active. Escape if possible!": "Submission aktiv. Fly om du kan!",
    "Fatigue blocks drawing and you have no legal move.": "Fatigue blockerar dragning av nya kort och du har inget spelbart drag.",
    "Draw a card.": "Dra ett kort.",
    "End turn.": "Avsluta turen.",
    "You have no legal move. {nextAction}": "Du har inget spelbart drag. {nextAction}",
    "You have no matching {moveLabel}. {nextAction}": "Du har inget matchande {moveLabel}. {nextAction}",
    "Bot thinking.": "Botten tänker.",
    "Open with Takedown.": "Öppna med Takedown.",
    "Play an escape card.": "Spela ett escape-kort.",
    "Fatigue blocks drawing. You may play a legal card.": "Fatigue blockerar dragning. Du kan spela ett spelbart kort.",
    "Fatigue blocks drawing. Play a legal follow-up or end turn.": "Fatigue blockerar dragning. Spela en spelbar uppföljning eller avsluta turen.",
    "or end turn.": "eller avsluta turen.",
    "or draw a card.": "eller dra ett kort.",
    "Play a legal move {nextAction}": "Spela ett spelbart drag {nextAction}",
    "Play an in-chain escape.": "Spela en escape i kedjan.",
    "Play a matching {moveLabel} {nextAction}": "Spela ett matchande {moveLabel} {nextAction}",
    "card": "kort",
    "Takedown": "Takedown",
    "Escape submission": "Escapa submission",
    "{from} to {to}": "{from} till {to}",
    "You": "Du",
    "{actor} played {cardName} and {instruction}": "{actor} spelade {cardName} och {instruction}",
    "{actor} played {cardName}. {instruction}": "{actor} spelade {cardName}. {instruction}",
    "{actor} played {cardName}. Opponent must play defensive.": "{actor} spelade {cardName}. Motståndaren måste spela defensivt.",
    "escaped a submission": "flydde en submission",
    "{actor} {escapeText}!": "{actor} {escapeText}!",
    "{actor} played {transition}.": "{actor} spelade {transition}.",
    "Round complete.": "Rundan klar.",
    "Bot is active.": "Botten är aktiv.",
    "Bot is under submission pressure.": "Botten är under submissionpress.",
    "{player} {verb} by {method}.": "{player} {verb} genom {method}.",
    "win": "vinner",
    "wins": "vinner",
    "empty hand": "tom hand",
    "No escape in hand. Draw one Hail Mary card from the pile.": "Ingen escape på handen. Dra ett chans-kort från högen.",
    "Hail Mary found an escape. The match continues.": "Du flydde. Matchen fortsätter.",
    "{winner} wins by submission. Hail Mary failed: {cardTitle} was not an escape.": "{winner} vinner genom submission. Chansningen misslyckades: {cardTitle} var inte en escape.",
    "You can play at most 2 cards per turn.": "Du får spela högst 2 kort per tur.",
    "Takedown must be played alone.": "Takedown måste spelas ensamt.",
    "Fatigue must be played alone.": "Fatigue måste spelas ensamt.",
    "Fatigue cannot answer a submission.": "Fatigue kan inte svara på en submission.",
    "That card is not legal now.": "Detta kort är inte spelbart nu.",
    "{player} played Ultra Heavy. Opponent has no cards.": "{player} spelade Ultra Heavy. Motståndaren har inga kort.",
    "{player} is under submission and must play an escape card.": "{player} är under submission och måste spela ett escape-kort.",
    "{player} holds Fatigue and cannot pass/draw.": "{player} håller Fatigue och kan inte passa/dra.",
    "{player} ends the turn without drawing because of Fatigue.": "{player} avslutar turen utan att dra på grund av Fatigue.",
    "No cards left and no legal moves. Draw game.": "Inga kort kvar och inga spelbara drag. Oavgjort."
  };

  const dictionary = { en: {}, sv };
  const textOriginals = new WeakMap();
  let applying = false;

  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "sv" || stored === "en" ? stored : DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
    window.dispatchEvent(new CustomEvent("cg-language-change", { detail: { lang } }));
  }

  function fillTemplate(text, vars = {}) {
    return String(text).replace(/\{(\w+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{${key}}`;
    });
  }

  function translate(text, vars = {}) {
    const lang = getLang();
    const key = normalize(text);
    const translated = dictionary[lang][key] || text;
    return fillTemplate(translated, vars);
  }

  function withWhitespace(original, translated) {
    const leading = String(original).match(/^\s*/)[0];
    const trailing = String(original).match(/\s*$/)[0];
    return `${leading}${translated}${trailing}`;
  }

  function translateTextNode(node) {
    if (!textOriginals.has(node)) {
      textOriginals.set(node, node.nodeValue);
    } else if (!applying) {
      const previousOriginal = textOriginals.get(node);
      const previousKey = normalize(previousOriginal);
      const previousTranslated = dictionary[getLang()][previousKey];
      const translatedValue = previousTranslated ? withWhitespace(previousOriginal, previousTranslated) : previousOriginal;
      if (node.nodeValue !== previousOriginal && node.nodeValue !== translatedValue) {
        textOriginals.set(node, node.nodeValue);
      }
    }
    const original = textOriginals.get(node);
    const key = normalize(original);
    if (!key) return;
    const lang = getLang();
    const translated = dictionary[lang][key];
    const nextValue = lang === "en" || !translated ? original : withWhitespace(original, translated);
    if (node.nodeValue !== nextValue) {
      node.nodeValue = nextValue;
    }
  }

  function translateAttributes(root) {
    const attrs = ["alt", "title", "aria-label", "data-mobile", "content", "placeholder"];
    const elements = [];
    if (root.nodeType === Node.ELEMENT_NODE) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll("*"));
    elements.forEach((el) => {
      attrs.forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const store = `data-i18n-original-${attr.replace(/[^a-z0-9]/gi, "-")}`;
        if (!el.hasAttribute(store)) {
          el.setAttribute(store, el.getAttribute(attr));
        }
        const original = el.getAttribute(store);
        const lang = getLang();
        el.setAttribute(attr, lang === "en" ? original : translate(original));
      });
    });
  }

  function translateTitle() {
    if (!document.documentElement.dataset.i18nOriginalTitle) {
      document.documentElement.dataset.i18nOriginalTitle = document.title;
    }
    const original = document.documentElement.dataset.i18nOriginalTitle;
    document.title = getLang() === "en" ? original : translate(original);
  }

  function walkText(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);
  }

  function injectSelector() {
    const nav = document.querySelector(".landing-nav");
    if (!nav || nav.querySelector(".language-switcher")) return;
    const switcher = document.createElement("div");
    switcher.className = "language-switcher";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Language");
    switcher.innerHTML = `
      <button type="button" class="language-option" data-lang-option="en">EN</button>
      <button type="button" class="language-option" data-lang-option="sv">SV</button>
    `;
    switcher.querySelectorAll("[data-lang-option]").forEach((button) => {
      button.addEventListener("click", () => setLang(button.dataset.langOption));
    });
    nav.appendChild(switcher);
  }

  function applyTranslations(root = document.body) {
    if (!root || applying) return;
    applying = true;
    document.documentElement.lang = getLang() === "sv" ? "sv" : "en";
    injectSelector();
    translateTitle();
    walkText(root);
    translateAttributes(root);
    const switcher = document.querySelector(".language-switcher");
    if (switcher) {
      switcher.setAttribute("aria-label", translate("Language"));
      switcher.querySelectorAll("[data-lang-option]").forEach((button) => {
        const isActive = button.dataset.langOption === getLang();
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }
    applying = false;
  }

  function observeMutations() {
    const observer = new MutationObserver((mutations) => {
      if (applying || getLang() === "en") return;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) applyTranslations(node);
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        });
        if (mutation.type === "characterData") translateTextNode(mutation.target);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.cgTranslate = translate;
  window.cgGetLanguage = getLang;
  window.cgApplyTranslations = applyTranslations;

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    observeMutations();
  });
})();
