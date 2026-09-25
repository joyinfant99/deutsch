import json, sys
sys.path.insert(0, "scripts")

def mc(q, ok, w1, w2, why): return {"t":"mc","q":q,"o":[ok,w1,w2],"a":0,"why":why}
def fill(q, ans, why): return {"t":"fill","q":q,"a":ans if isinstance(ans,list) else [ans],"why":why}
def V(vid, title, src, mins, focus, qs):
    return {"kind":"video","title":title,"source":"YouTube · "+src,"url":"https://www.youtube.com/watch?v="+vid,"minutes":mins,"focus":focus,"questions":qs}

E = {}
E[117] = V("ruJTPQ8Whm4","Welcher Beruf passt zu mir? So findest du deinen Traumjob!","Studyflix",4,"Note the questions the video suggests you ask yourself (interests, strengths, values). Then write three jobs that fit you.",[
 mc("“Berufsberatung” means:","career counselling","job contract","trade union","die Beratung = advice."),
 fill("Ich interessiere mich ___ Technik.",["für","fuer"],"sich interessieren für + Akk."),
 mc("“die Fähigkeit, -en” means:","ability, skill","pension","journey","Welche Fähigkeiten hast du?")])
E[118] = V("cS_aH5wJGME","How Many Languages Do Germans Speak? | Easy German 473","Easy German",11,"Listen for the languages people name and how they describe their level. Then say which languages you speak and how well.",[
 mc("“die Muttersprache” is …","the language you grew up with","the language of your job","a dead language","Meine Muttersprache ist Tamil."),
 fill("Meine Kinder wachsen ___ auf, sie sprechen zwei Sprachen. (zweisprachig)",["zweisprachig"],"zweisprachig aufwachsen."),
 mc("“Ich spreche fließend Englisch” means:","I speak English fluently","I speak English slowly","I don’t speak English","fließend = fluent."),
])
E[119] = V("DvFUkqh0hBs","So formulierst du INDIREKTE Fragen richtig (Deutsch B1)","Rocking German Grammar",10,"Watch for the two patterns: ob for yes/no questions and the W-word for content questions; the verb goes to the end.",[
 mc("Which sentence contains an indirect question?","Kannst du mir sagen, ob der Zug pünktlich ist?","Ist der Zug pünktlich?","Der Zug ist pünktlich.","Indirekte Frage = Nebensatz mit ob / W-Wort."),
 fill("Ich weiß nicht, ___ er heute kommt.",["ob"],"Ja/Nein-Frage → ob."),
 mc("“Wann beginnt der Kurs?” → Ich möchte wissen, …","wann der Kurs beginnt","wann beginnt der Kurs","ob wann der Kurs beginnt","Verb am Ende.")])
E[120] = V("x7VJy0UCqO8","Alle MODALVERBEN | Learn German | Deutsch lernen","Benjamin - Der Deutschlehrer",12,"Collect the six modal verbs (können, müssen, dürfen, wollen, sollen, mögen) with their meanings; make one own sentence for each.",[
 mc("Which modal verb expresses permission?","dürfen","müssen","wollen","Hier darf man nicht rauchen."),
 fill("Ich ___ morgen früh aufstehen, sonst verpasse ich den Zug. (müssen)",["muss"],"ich muss."),
 mc("In a main clause with a modal verb the infinitive stands …","at the end of the sentence","right after the modal verb","at the beginning","Ich muss heute lernen.")])
E[121] = V("8iF_dI7UsSM","NOMINALISIERUNG: wenn aus einem VERB oder ADJEKTIV ein NOMEN wird","Karina Multilingual",9,"Note the three ways to nominalise: infinitive as noun (das Lernen), stem + -ung, adjective + -keit/-heit.",[
 mc("Which nominalisation is correct?","das Lernen","die Lernen","der Lernen","Infinitiv als Nomen ist neutral."),
 fill("üben → die ___",["Übung","Uebung"],"üben → die Übung."),
 mc("schnell → …","die Schnelligkeit","das Schnell","der Schnell","-ig + -keit.")])
E[122] = V("BDrRF3k8nKA","bevor - während - nachdem (Deutsch B1)","Rocking German Grammar",12,"Compare the three conjunctions on a timeline and write one sentence with each about your day.",[
 fill("___ ich frühstücke, lese ich die Zeitung.",["Während","Waehrend"],"während = at the same time."),
 mc("Which sentence is correct?","Bevor ich ins Bett gehe, putze ich die Zähne.","Bevor ich gehe ins Bett, putze ich die Zähne.","Bevor ich putze die Zähne, gehe ich ins Bett.","Nebensatz: Verb am Ende."),
 mc("“Nachdem ich gegessen hatte, ging ich spazieren.” Which tense is in the subordinate clause?","Plusquamperfekt","Präsens","Futur","nachdem + Plusquamperfekt/Perfekt.")])
E[123] = V("Yydu1FrTYT0","How Punctual Are Germans? | Easy German 458","Easy German",11,"Listen for words like pünktlich, zu spät, Verspätung. Then describe how punctual people are in your home country.",[
 mc("“pünktlich” means:","on time","polite","quiet","Ich komme immer pünktlich."),
 fill("Der Zug hat zehn Minuten ___.",["Verspätung","Verspaetung"],"eine Verspätung haben."),
 mc("“Ich komme immer zu spät” means:","I am always late","I always come too early","I never come","zu spät = too late.")])
E[124] = V("4BPolFuzVrE","Indirekte Rede einfach erklärt | Beispiele und Übung","lernfoerderung",6,"Note how direct speech becomes indirect speech (pronouns change). In everyday B1 German a dass-clause is enough; the Konjunktiv I forms you may see only need to be recognised.",[
 fill("“Ich bin müde.” → Er sagt, ___ er müde ist. (that)",["dass"],"dass-Satz, Verb am Ende."),
 mc("“Ich bin müde.” → Er sagt, dass … müde ist.","er","ich","du","Das Pronomen wechselt: ich → er."),
 mc("“Kommst du morgen?” → Sie fragt, … ich morgen komme.","ob","dass","weil","Ja/Nein-Frage → ob.")])
E[125] = V("5zshFtHh8WE","Was ist Heimat für dich? | Was bedeutet Heimat?","Learn German",8,"Note the different meanings of Heimat people give (place, people, feeling). Then say what Heimat means to you.",[
 mc("“die Heimat” means:","homeland, the place you belong","holiday","housing","Meine Heimat ist Indien."),
 mc("“Heimweh haben” means:","to be homesick","to have a headache","to be at home","das Heimweh."),
 fill("Ich vermisse meine ___. (Heimat)",["Heimat"],"die Heimat vermissen.")])
E[126] = V("7R282jceZWM","Unregelmäßige Verben Deutsch | Teste dein Deutsch | Präteritum","Benjamin - Der Deutschlehrer",12,"Pause and answer each verb yourself before the answer appears; note verbs you got wrong.",[
 fill("gehen → er ___ (Präteritum)",["ging"],"gehen – ging – gegangen."),
 mc("kommen → Präteritum:","kam","kommte","gekommen","kommen – kam – gekommen."),
 fill("Wir ___ damals nach Deutschland. (fliegen, Präteritum)",["flogen"],"fliegen – flog – geflogen.")])
E[127] = V("XxWn75LSO48","Die Berliner Mauer einfach erklärt (explainity® Erklärvideo)","explainity",4,"Note the years and the reasons for the Wall. Then retell it in five sentences using Präteritum.",[
 mc("In which year did the Berlin Wall go up?","1961","1945","1989","Der Mauerbau war am 13. August 1961."),
 mc("In which year did the Wall fall?","1989","1961","1990","Am 9. November 1989."),
 fill("Die Mauer ___ 28 Jahre lang die Stadt. (teilen, Präteritum)",["teilte"],"teilen – teilte – geteilt.")])
E[128] = V("VnRBUeD0Ars","Die deutsche Wiedervereinigung 1989/90 | STARK erklärt","STARK Verlag",7,"Note the sequence: Mauerfall, Verhandlungen, Einheit. Write the three key dates.",[
 mc("When is the Day of German Unity celebrated?","3 October","9 November","8 May","Tag der Deutschen Einheit: 3. Oktober 1990."),
 mc("How many federal states does Germany have today?","16","12","20","16 Bundesländer."),
 fill("Am 9. November 1989 ___ die Mauer. (fallen, Präteritum)",["fiel"],"fallen – fiel – gefallen.")])
E[129] = V("wxACZCNAkS4","Deutsch lernen: Nebensätze einfach erklärt","Lingster Academy",12,"Listen for the position of the verb in main clauses vs subordinate clauses; make sentences about problems in your day with weil and dass.",[
 mc("In a subordinate clause the conjugated verb is …","at the end","in second position","at the beginning","Ich bleibe zu Hause, weil ich krank bin."),
 fill("Ich bleibe zu Hause, ___ ich krank bin.",["weil"],"weil + Nebensatz."),
 mc("Which sentence is correct?","Ich glaube, dass er heute kommt.","Ich glaube, dass er kommt heute.","Ich glaube, dass kommt er heute.","Verb am Ende.")])
E[130] = V("sTbqHypqM2M","Do Germans Save Money and Invest? | Easy German 450","Easy German",13,"Collect money words (sparen, Schulden, anlegen, Miete) as you listen; say how you handle money in three sentences.",[
 mc("“sparen” means:","to save (money)","to spend","to earn","Ich spare jeden Monat 100 Euro."),
 mc("“die Schulden” are:","debts","savings","taxes","Er hat viele Schulden."),
 fill("Ich habe kein Geld, ___ kann ich nicht in Urlaub fahren.",["deshalb","deswegen"],"deshalb + Verb an Position 2.")])
E[131] = V("lsfRr2hCOQk","Ratschläge mit \"sollten\" und \"würden\" - B1","Goethe-Institut Ramallah",3,"Note the ways to give advice: du solltest, an deiner Stelle würde ich, wie wäre es mit.",[
 fill("Du ___ mehr schlafen. (sollen, Konjunktiv II)",["solltest"],"du solltest."),
 mc("Which sentence gives advice?","An deiner Stelle würde ich zum Arzt gehen.","Ich gehe zum Arzt.","Er ist beim Arzt.","An deiner Stelle würde ich …"),
 mc("“Wenn ich du wäre, …” introduces …","advice","a question","an order","Wenn ich du wäre, würde ich …")])
E[132] = V("cjBzQ9jTZHU","Konjunktiv II - 5 Situationen im Alltag mit Konjunktiv II (Deutsch B1-B2)","Rocking German Grammar",11,"Note the five situations (wishes, advice, polite requests, hypotheses, comparisons). Give one example for each.",[
 fill("Wenn ich mehr Geld hätte, ___ ich ein Auto kaufen.",["würde","wuerde"],"würde + Infinitiv."),
 mc("Konjunktiv II of “sein” (ich):","wäre","würde","war","ich wäre."),
 mc("“Ich hätte gern einen Kaffee.” is …","a polite request","a complaint","a past event","hätte gern = höfliche Bitte.")])
E[133] = V("_NIjLMWmIuY","German Two-Part Conjunctions Part 2 | Super Easy German 202","Easy German",10,"Write down the pairs: entweder … oder, weder … noch, sowohl … als auch, nicht nur … sondern auch, zwar … aber.",[
 fill("Ich mag weder Tee ___ Kaffee.",["noch"],"weder … noch."),
 mc("Complete: sowohl … ___","als auch","noch","oder","sowohl … als auch."),
 mc("Which sentence is correct?","Entweder gehen wir ins Kino, oder wir bleiben zu Hause.","Entweder gehen wir ins Kino, noch wir bleiben zu Hause.","Weder gehen wir ins Kino, oder wir bleiben zu Hause.","entweder … oder.")])
E[134] = V("Zfa3PAsUs1k","B1 - Lesson 35 | Jobsuche - Stellenanzeigen - Teil 1","Learn German",12,"Collect the typical sections of a job ad (Aufgaben, Anforderungen, Wir bieten).",[
 mc("“die Stelle, -n” means:","job position","place","point","Ich suche eine Stelle."),
 mc("In a job ad “Berufserfahrung” means:","work experience","career advice","career fair","Berufserfahrung erwünscht."),
 mc("“Wir bieten …” introduces:","what the employer offers","what you must do","the address","Wir bieten: 30 Urlaubstage.")])
E[135] = V("jTkRk_ihYBw","Anschreiben Bewerbung Ausbildung - So geht's richtig!","Studyflix",4,"Note the structure: Einleitung, Hauptteil, Schluss. Then draft your own three-sentence opening.",[
 mc("Another word for “Bewerbungsschreiben” is:","Anschreiben","Kündigung","Zeugnis","das Anschreiben."),
 mc("“der Lebenslauf” is:","CV","life insurance","birth certificate","tabellarischer Lebenslauf."),
 fill("Hiermit ___ ich mich um die Stelle. (sich bewerben, ich)",["bewerbe"],"sich bewerben um.")])
E[136] = V("QeNzj72acE4","B1 - Lesson 14 | damit, um...zu | Finalsätze","Learn German",11,"Note when um … zu is possible (same subject) and when damit is needed (different subjects).",[
 fill("Ich lerne Deutsch, ___ in Deutschland zu arbeiten.",["um"],"um … zu = purpose."),
 mc("Use damit instead of um … zu when …","the subjects are different","the sentence is negative","the verb is separable","Ich helfe dir, damit du früher fertig bist."),
 mc("Which sentence is correct?","Ich gehe zum Bäcker, um Brötchen zu kaufen.","Ich gehe zum Bäcker, damit Brötchen zu kaufen.","Ich gehe zum Bäcker, um Brötchen kaufen.","um + zu + Infinitiv.")])
E[137] = V("_bXX1IOo4Eg","8 Things That Happen Only in Germany | Easy German 522","Easy German",12,"Notice which things Germans find normal. Ask yourself: which are true and which are clichés?",[
 mc("“das Klischee, -s” means:","stereotype, cliché","reality","tradition","Klischees über Deutsche."),
 mc("“typisch deutsch” means:","typical of Germany","totally German","not German","typisch = typical."),
 fill("Alle Deutschen trinken nur Bier – das ist ein ___.",["Klischee"],"Klischee.")])
E[138] = V("wccudohysKY","Asking Germans what's their best character trait | Easy German 323","Easy German",10,"Collect adjectives for character (ehrlich, humorvoll, geduldig). Describe a friend with five adjectives.",[
 mc("The ending -los means:","without","with","full of","arbeitslos = without work."),
 fill("Ein Mensch ohne Hoffnung ist hoffnungs___.",["los"],"-los."),
 mc("freundlich → noun:","die Freundlichkeit","das Freund","der Freundlich","-lich + -keit.")])
E[139] = V("ouU1A8I31eE","WEIL - DA - DENN - DESHALB | Learn German: Causal clauses","Deutsch Insomnia",7,"Compare word order: weil/da → verb at the end; denn/deshalb → verb in second position.",[
 fill("Er kommt nicht, denn er ___ krank.",["ist"],"denn + Hauptsatz."),
 mc("After “denn” the verb stands …","in second position","at the end","at the beginning","denn ist eine Konjunktion auf Position 0."),
 fill("Es regnet. ___ bleibe ich zu Hause.",["Deshalb","Deswegen"],"deshalb + Verb an Position 2.")])
E[140] = V("X6XwtaL_4fE","OBWOHL vs. TROTZDEM | Super Easy German 200","Easy German",9,"Note the different word order after obwohl and trotzdem.",[
 fill("___ es regnet, gehe ich spazieren.",["Obwohl"],"obwohl + Nebensatz."),
 fill("Es regnet. ___ gehe ich spazieren.",["Trotzdem"],"trotzdem + Verb an Position 2."),
 mc("obwohl introduces …","a subordinate clause","a main clause","a question","Verb am Ende.")])
E[141] = V("Q7UcjxyjFO8","We Asked Couples in Berlin How They Met | Easy German 426","Easy German",14,"Listen for how the couples met (kennenlernen, verabreden, verlieben). Then tell how you met a friend.",[
 mc("“sich kennenlernen” means:","to get to know each other","to recognise","to remember","Wir haben uns kennengelernt."),
 fill("Wir haben uns auf einer Party ___. (kennenlernen, Partizip II)",["kennengelernt"],"kennengelernt."),
 mc("“sich verabreden” means:","to arrange to meet","to break up","to marry","Wir verabreden uns morgen.")])
E[142] = V("QQCBksqogHg","Infinitiv mit zu | A2/B1/B2 | Learn German","Benjamin - Der Deutschlehrer",10,"Note the rule for separable verbs: aufzustehen, anzurufen.",[
 fill("Ich habe keine Lust, heute ___ arbeiten.",["zu"],"Lust haben + zu."),
 mc("With separable verbs zu stands …","between prefix and verb","before the prefix","after the verb","aufzustehen."),
 mc("Which sentence is correct?","Es ist wichtig, pünktlich zu sein.","Es ist wichtig, zu pünktlich sein.","Es ist wichtig pünktlich sein zu.","zu + Infinitiv am Ende.")])
E[143] = V("ovLYEkzb0sY","Aber or Sondern | B1 | Terrible German","Schrecklich Deutsch",6,"Note the rule: sondern follows a negation and corrects it; aber adds a contrast.",[
 fill("Er ist nicht müde, ___ hungrig.",["sondern"],"nicht … sondern."),
 mc("sondern is used after …","a negation","a question","a command","Nicht A, sondern B."),
 mc("Which sentence is correct?","Ich trinke keinen Kaffee, sondern Tee.","Ich trinke keinen Kaffee, aber Tee.","Ich trinke keinen Kaffee, sondern nicht Tee.","sondern nach Verneinung.")])
E[144] = V("mPrA1NJ42nw","What Berliners Like And Dislike About Their Partners | Easy German 403","Easy German",12,"Collect adjectives for likes and dislikes. Say what you value in a partner or friend.",[
 mc("“die Beziehung” means:","relationship","travel","education","eine Beziehung haben."),
 mc("“sich streiten” means:","to argue","to hurry","to stretch","Wir streiten uns oft."),
 fill("Ich habe mich in dich ___. (verlieben, Partizip II)",["verliebt"],"sich verlieben.")])
E[145] = V("kYEBu6dG2MM","A Day in our Office in Slow German","Easy German",9,"Note the office vocabulary and the order of the day; describe your own workplace in five sentences.",[
 mc("“der Kollege” means:","colleague","customer","boss","mein Kollege."),
 mc("“die Besprechung” means:","meeting","break","holiday","eine Besprechung haben."),
 fill("Ich arbeite im ___ von 9 bis 17 Uhr.",["Büro","Buero"],"im Büro.")])
E[146] = V("t5jTNx1dFu4","Gehaltsrechner: Brutto & Netto-Gehalt erklärt! Inkl. Lohnabrechnung-Beispiel","Finanzfluss",9,"Note where the deductions go (Steuern, Sozialversicherung).",[
 mc("Brutto is the salary …","before deductions","after deductions","per hour","Brutto minus Abzüge = Netto."),
 mc("Netto is the salary …","after deductions","before deductions","without holiday","Was bleibt übrig."),
 fill("Ich habe ___ Auto. (negation)",["kein"],"kein + Nomen.")])
E[147] = V("VKx9lzUDHiY","Deutsch lernen: NOTFALL 112 anrufen – Dialog und erste Hilfe","Hören und sprechen",8,"Note the information you must give: Wo? Was ist passiert? Wie viele Verletzte? Wer ruft an?",[
 mc("Which number do you call for fire or medical emergencies?","112","110","116","112 = Feuerwehr / Rettungsdienst."),
 mc("What belongs in an emergency call?","where the accident happened","your favourite food","your salary","Wo ist es passiert?"),
 fill("Der Unfall ___ gestern. (passieren, Präteritum)",["passierte"],"passieren – passierte.")])
E[148] = V("NNPnLBPt39g","Why Germans Love Insurance | Easy German 495","Easy German",13,"Collect the types of insurance mentioned; say which you would need.",[
 mc("“die Haftpflichtversicherung” pays for …","damage you cause to others","your own illness","your car repairs","Haftpflicht = liability."),
 mc("“der Unfall, Unfälle” means:","accident","event","insurance","einen Unfall haben."),
 fill("___ du einen Unfall hast, rufst du 112.",["Wenn"],"wenn + Nebensatz.")])
E[149] = V("2zhntE44W5U","Wie funktioniert das Schulsystem in Deutschland? Deutsches Bildungssystem einfach erklärt","easy newstime",4,"Note the school types in order: Grundschule, weiterführende Schule, Abitur.",[
 mc("“die Grundschule” is …","primary school","high school","university","Klasse 1 bis 4."),
 fill("Mein Sohn ist in der ___ Klasse. (3. → Dativ)",["dritten"],"in der dritten Klasse."),
 mc("The ordinal number for 1. is:","erste","einte","ein","der erste Tag.")])
E[150] = V("uQ7hsFGnfrY","At a German School | Easy German 152","Easy German",9,"Note school vocabulary and wishes people express about school.",[
 fill("Ich wünschte, wir ___ weniger Hausaufgaben. (haben, Konjunktiv II)",["hätten","haetten"],"wir hätten."),
 mc("“die Hausaufgaben” means:","homework","housework","homeland","Hausaufgaben machen."),
 mc("Wenn ich Schulleiter ___, würde ich später beginnen.","wäre","war","bin","wenn + Konjunktiv II.")])
E[151] = V("_CgmMnBjnz0","Lernen lernen: 13 Tipps aus der Gehirnforschung","Sprouts Deutschland",5,"Pick two tips and plan how to use them in your German study this week.",[
 mc("“wiederholen” means:","to repeat, review","to bring back","to whistle","Vokabeln wiederholen."),
 mc("“sich konzentrieren auf + Akk.” means:","to concentrate on","to celebrate","to consult","Ich konzentriere mich auf …"),
 fill("Ich lerne täglich, ___ ich Wörter nicht vergesse.",["damit"],"damit = purpose.")])
E[152] = V("miy5M7rNnVs","Er unterrichtet fast alles! Das verdient ein Grundschullehrer | Lohnt sich das?","Lohnt sich das?",10,"Listen for school vocabulary and which subjects a primary teacher teaches.",[
 mc("“unterrichten” means:","to teach","to inform","to underline","Er unterrichtet Mathe."),
 mc("“das Fach, Fächer” in school means:","subject","compartment","failure","Mein Lieblingsfach ist Sport."),
 fill("Er ___ Mathe und Deutsch. (unterrichten)",["unterrichtet"],"er unterrichtet.")])
E[153] = V("55-4Y1yZ2s0","Duale Berufsausbildung in Deutschland (German)","Bundesinstitut für Berufsbildung",8,"Note the two places of learning and how long the training lasts.",[
 mc("In a dual Ausbildung you learn …","in a company and at a vocational school","only at university","only online","Betrieb + Berufsschule."),
 mc("“der Azubi” is short for:","Auszubildender","Ausländer","Arbeitsuchender","Azubi = apprentice."),
 fill("___ interessierst du dich? (für was)",["Wofür","Wofuer"],"wo(r) + für.")])
E[154] = V("Bl8Y3EJGT2I","IHK-Weiterbildung - einfach erklärt","IHK Nord Westfalen",3,"Note which qualifications you can earn after your Ausbildung.",[
 mc("“die Weiterbildung” means:","further training","further building","farewell","sich weiterbilden."),
 mc("Which institution often offers further training in Germany?","IHK","ADAC","Bäckerei","Industrie- und Handelskammer."),
 mc("“der Abschluss” means:","qualification, degree","lock","conclusion of a speech","einen Abschluss machen.")])

json.dump({str(k):v for k,v in sorted(E.items())}, open("content/src/extras-b1-01.json","w"), ensure_ascii=False, indent=0)
print(len(E))
