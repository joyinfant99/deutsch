import json, sys
sys.path.insert(0, "scripts")

def mc(q, ok, w1, w2, why): return {"t":"mc","q":q,"o":[ok,w1,w2],"a":0,"why":why}
def fill(q, ans, why): return {"t":"fill","q":q,"a":ans if isinstance(ans,list) else [ans],"why":why}
def V(vid, title, src, mins, focus, qs):
    return {"kind":"video","title":title,"source":"YouTube · "+src,"url":"https://www.youtube.com/watch?v="+vid,"minutes":mins,"focus":focus,"questions":qs}

E = {}
E[155] = V("eC4j_v8TBIU","Job Interviews in Germany /w German LifeStyle GLS | Easy German 238","Easy German",8,"Note the interview questions; prepare your own answers to three of them.",[
 mc("“das Praktikum” means:","internship","practice room","practical joke","ein Praktikum machen."),
 mc("“die Bewerbung” means:","application","reward","description","eine Bewerbung schreiben."),
 fill("Ich habe ein Praktikum bei einer Firma ___. (machen, Partizip II)",["gemacht"],"machen – gemacht.")])
E[156] = V("nCNEJoqm8Dk","Studying in Germany | Easy German 170","Easy German",12,"Collect university words (Semester, Vorlesung, Prüfung). Say what you would study.",[
 mc("“das Semester” means:","half-year term","exam","degree","Wintersemester."),
 mc("“die Vorlesung” means:","lecture","reading","preparation","in die Vorlesung gehen."),
 fill("Ich ___ Informatik. (studieren, ich)",["studiere"],"ich studiere.")])
E[157] = V("xxmyiTDi0rU","Das Wetter & Wettervorhersage | Deutsch lernen","Super Deutsch",7,"Collect weather words and predict tomorrow’s weather in three sentences.",[
 mc("“die Wettervorhersage” means:","weather forecast","weather station","weather report of yesterday","Wetter morgen."),
 fill("Heute sind es 30 Grad, es ist sehr ___.",["heiß","heiss"],"heiß = hot."),
 mc("“bewölkt” means:","cloudy","windy","foggy","der Himmel ist bewölkt.")])
E[158] = V("f7OfygAD6nI","Das Wetter | A2 B1 B2 | Learn German | Deutsch lernen","Benjamin - Der Deutschlehrer",10,"Note the extended weather vocabulary; use nicht nur … sondern auch to describe the weather.",[
 mc("“die Hitze” means:","heat","hail","height","Bei Hitze viel trinken."),
 fill("Bei Hitze soll man viel ___.",["trinken"],"Flüssigkeit."),
 mc("Which sentence is correct?","Es ist nicht nur kalt, sondern auch nass.","Es ist nur nicht kalt, sondern nass auch.","Es ist nicht kalt, aber sondern nass.","nicht nur … sondern auch.")])
E[159] = V("oskcXcv3_1w","B1 - Lesson 9 | Genitivpräpositionen | Wegen Während Trotz","Learn German",12,"Note the meaning: wegen (because of), trotz (despite), während (during), statt (instead of).",[
 fill("___ des schlechten Wetters bleiben wir zu Hause.",["Wegen"],"wegen + Genitiv."),
 mc("wegen is formally used with …","the genitive","the accusative","the dative only","In der Umgangssprache oft Dativ."),
 fill("___ des Regens gehen wir spazieren. (despite)",["Trotz"],"trotz + Genitiv.")])
E[160] = V("Ds4HxRif8dA","Klimawandel einfach erklärt (explainity® Erklärvideo)","explainity",4,"Note causes and consequences, then make three predictions with the Futur I.",[
 mc("Futur I is formed with …","werden + infinitive","haben + Partizip II","sein + Partizip II","Es wird wärmer werden."),
 fill("Es ___ in Zukunft wärmer werden. (werden, es)",["wird"],"es wird."),
 mc("“der Klimawandel” means:","climate change","weather forecast","climate zone","Klimawandel.")])
E[161] = V("8etayvawQmg","B1 - Lesson 34 | Umwelt und Umweltschutz | Environment","Learn German",10,"Collect environmental vocabulary and say three things you do for the environment.",[
 mc("“die Umwelt” means:","environment","surroundings of a house","world","Umweltschutz."),
 mc("“nachhaltig” means:","sustainable","late","lasting a night","nachhaltig leben."),
 fill("Man ___ Müll trennen. (sollen, man)",["soll"],"man soll.")])
E[162] = V("zbup1WK3qS0","Wer ist schuld am Klimawandel? - Wer muss jetzt handeln?","Dinge Erklärt – Kurzgesagt",11,"Note the main polluters and possible actions; write two sentences with weil.",[
 mc("“die Verschmutzung” means:","pollution","cleaning","shipment","Luftverschmutzung."),
 mc("“die Abgase” are:","exhaust fumes","waste water","gases in a gas station","Auto-Abgase."),
 fill("Der Fluss ist stark ___. (verschmutzen, Partizip II)",["verschmutzt"],"verschmutzt.")])
E[163] = V("dQGvXKxuGdU","Energiewende einfach erklärt - Erneuerbare & Fossile Energien","Die Merkhilfe Wirtschaft",6,"Sort the energy sources into erneuerbar and fossil.",[
 mc("Which energy is NOT renewable?","Kohle","Sonne","Wind","Kohle = fossil."),
 mc("“die Windkraft” means:","wind power","wind force ten","wind farm","Windkraftanlage."),
 mc("“erneuerbare Energien” includes …","solar and wind energy","coal and gas","oil","Sonne, Wind, Wasser.")])
E[164] = V("2yFEeFqbVwg","Recycling in Germany | Super Easy German (128)","Easy German",9,"Learn the bin colours and what goes where; note the word Pfand.",[
 mc("Paper usually goes into the … bin.","blue","yellow","black","blaue Tonne = Papier."),
 mc("The yellow bin/bag is for:","plastic and metal packaging","glass","food waste","gelbe Tonne / gelber Sack."),
 fill("Flaschen mit ___ bringt man zurück in den Supermarkt.",["Pfand"],"Pfand = deposit.")])
E[165] = V("8el16ybgG3I","Deutsch lernen mit Nachrichten - Neues Gesetz vereinfacht Einbürgerung","Learn German",10,"Read along: note news vocabulary (Gesetz, Regierung) and then summarise in two sentences.",[
 mc("“die Nachrichten” (Pl.) means:","the news","messages","reports of birth","Nachrichten sehen."),
 mc("“die Schlagzeile” means:","headline","punchline","strike line","Die Schlagzeile der Zeitung."),
 fill("In der Zeitung ___ ein interessanter Artikel. (stehen, es)",["steht"],"es steht.")])
E[166] = V("rd-SCRlTUhU","Journalistin werden: Stress vor Redaktionsschluss - Mein Alltag in der Lokalredaktion","alpha Uni",12,"Note what an editor does in a day; write down five job-related words.",[
 mc("“der Redakteur / die Redakteurin” means:","editor","reporter of a court","reaction","In der Redaktion."),
 mc("“der Redaktionsschluss” means:","editorial deadline","end of a job","closing of a shop","Redaktionsschluss um 18 Uhr."),
 fill("Der Artikel muss bis 18 Uhr ___ sein.",["fertig"],"fertig sein.")])
E[167] = V("Yro2yNl-mCI","10 APPS that will SIMPLIFY YOUR LIFE in Germany","Simple Germany",10,"Collect app and media vocabulary; say if you prefer analog or digital.",[
 mc("The opposite of “digital” is:","analog","digitalisiert","digital-los","analog vs. digital."),
 mc("“herunterladen” means:","to download","to lower","to load a truck","eine App herunterladen."),
 mc("“die Bildschirmzeit” means:","screen time","time in front of a projector","exam time","Bildschirm = screen.")])
E[168] = V("wEB0TiDPD_c","Wortschatz Werbungen | Vocabulary | Advertisement | A1-A2-B1","Lingo Guru",6,"Collect ad vocabulary (Angebot, Rabatt, kostenlos, Anzeige).",[
 mc("“die Werbung” means:","advertising","recruiting","work","Werbung im Fernsehen."),
 mc("“die Anzeige, -n” means:","advertisement (ad)","display","announcement of a wedding only","Kleinanzeige."),
 mc("“kostenlos” means:","free of charge","costly","cost-effective","kostenlos = gratis.")])
E[169] = V("hLoatpfE7VM","7 More Things NOT to Do in Germany | Easy German 354","Easy German",10,"Note the social mistakes that are peinlich; tell one embarrassing story using Perfekt.",[
 mc("“peinlich” means:","embarrassing","painful","pleasant","Das war mir peinlich."),
 mc("“das Missgeschick” means:","mishap","misfortune shop","mistake in grammar only","Mir ist ein Missgeschick passiert."),
 fill("Das war mir sehr ___.",["peinlich"],"peinlich.")])
E[170] = V("eJEbC-8c3l4","Dialog auf Deutsch im Restaurant (A2, B1, B2) | Essen + Getränke bestellen","Learn German with Leo",12,"Note polite phrases for ordering and paying; practise the dialogue aloud.",[
 mc("In Germany you usually give a tip …","of about 5–10 %, often by rounding up","never","of 30 %","Trinkgeld geben."),
 fill("Man ___ nicht mit vollem Mund sprechen. (sollen, man)",["soll"],"man soll."),
 mc("“Guten Appetit!” is said …","before eating","after eating","when paying","vor dem Essen.")])
E[171] = V("3oiWy0RuIdY","Partizip I oder II? Grammatik einfach lernen! Deutsch B1-C1","Lingster Academy",8,"Note how Partizip I is formed (Infinitiv + d) and used as an adjective.",[
 mc("Partizip I is formed with infinitive + …","-d","-t","-en","lachen → lachend."),
 fill("lachen → das ___ Kind",["lachende"],"lachend + e."),
 mc("“der wartende Mann” means:","the man who is waiting","the man who was waited for","the man who waits for nothing","Partizip I = aktiv.")])
E[172] = V("cvS_YPCyLnA","B1 - Lesson 31 | etwas reklamieren | to complain","Learn German",10,"Note phrases for complaints; write a short complaint about a broken product.",[
 mc("“reklamieren” means:","to complain about a defect","to advertise","to reclaim land","Ich möchte reklamieren."),
 fill("Nachdem ich das Handy gekauft ___, funktionierte es nicht. (haben, Plusquamperfekt)",["hatte"],"hatte gekauft."),
 mc("“der Kassenbon” means:","receipt","cash box","cash bond","Ohne Kassenbon kein Umtausch.")])
E[173] = V("JDNBix-ZvLc","Finally 18! What changes for you when you come of age","Mädchenkram",4,"Note which rights and duties come with 18 and compare with your country.",[
 mc("At what age are you volljährig in Germany?","18","16","21","Volljährigkeit mit 18."),
 mc("“minderjährig” means:","underage","of minor importance","min-year old","unter 18."),
 mc("“der Führerschein” means:","driving licence","leader’s ticket","fire certificate","den Führerschein machen.")])
E[174] = V("gaoO8iwI5KY","Konnektor seit/seitdem | Nebensatz mit seit/seitdem und Präposition seit","Deutschprüfungen",3,"Note the difference between the preposition seit + Dativ and the conjunction seit(dem) + Nebensatz.",[
 fill("Ich lerne ___ einem Jahr Deutsch.",["seit"],"seit + Dativ."),
 mc("Seit ich in Deutschland ___, lerne ich Deutsch.","wohne","wohnen","wohnst","Verb am Ende."),
 mc("“Seit wann wohnst du hier?” Which answer fits?","Seit 2020.","Vor 2020 bis morgen.","Nach dem Essen.","seit + Zeitpunkt.")])
E[175] = V("0h7tQQYrg6U","Das Plusquamperfekt - Vorvergangenheit einfach erklärt","Nachhilfe vom Lehrer",5,"Note the formation: hatte/war + Partizip II; use it with nachdem.",[
 fill("Nachdem er gegessen ___, ging er spazieren. (haben, Plusquamperfekt)",["hatte"],"hatte gegessen."),
 fill("___ ich ins Bett gehe, putze ich die Zähne. (before)",["Bevor"],"bevor."),
 mc("Plusquamperfekt = …","hatte/war + Partizip II","habe/bin + Partizip II","werde + Infinitiv","Vorvergangenheit.")])
E[176] = V("-isJcGa4gLE","Neues Leben beginnen: 5 Schritte für deinen Neuanfang","Glücksdetektiv",11,"Note the five steps; pick one and write how you could start it.",[
 mc("“der Neuanfang” means:","fresh start","new beginning of a film","new anchor","einen Neuanfang wagen."),
 mc("“sich verändern” means:","to change","to reject","to delay","Ich habe mich verändert."),
 fill("Es ist nie zu spät, ___ Neuanfang zu wagen. (einen)",["einen"],"Akkusativ maskulin.")])
E[177] = V("K0SGXxkB5ZM","DER GENITIV - Einfach erklärt für Deutschlerner A2-C1","Lingster Academy",13,"Note the endings: des/der + -(e)s and how von + Dativ replaces the genitive in speech.",[
 fill("das Auto ___ Nachbarn (der Nachbar)",["des"],"Maskulin Genitiv: des."),
 mc("der Name ___ Stadt (die Stadt)","der","des","dem","Feminin Genitiv: der."),
 mc("die Bücher ___ Kinder (Plural)","der","des","den","Plural Genitiv: der.")])
E[178] = V("pQHUOTCRv3E","Die Europäische Union einfach erklärt (explainity® Erklärvideo)","explainity",4,"Note the EU goals and institutions; write three facts.",[
 mc("What is the common currency of many EU countries?","the euro","the mark","the franc","Euro."),
 mc("Where is the European Commission based?","Brussels","Berlin","Vienna","Brüssel."),
 mc("“der Mitgliedstaat” means:","member state","state of mind","membership fee","Mitgliedstaaten.")])
E[179] = V("ghJhy40yCfM","Steuern in Deutschland einfach erklärt (explainity® Erklärvideo)","explainity",3,"Note the types of tax and what they finance.",[
 mc("“die Steuer, -n” means:","tax","steering wheel","tax refund","Steuern zahlen."),
 mc("“die Einkommensteuer” means:","income tax","incoming mail","income insurance","Einkommen = income."),
 fill("Man gibt beim Finanzamt die ___ ab. (tax return)",["Steuererklärung"],"Steuererklärung.")])
E[180] = V("7RMKwP_854M","Erst- und Zweitstimme","Bundeszentrale für politische Bildung",3,"Note what each vote is for and how they combine.",[
 mc("With the Erststimme you vote for …","a candidate","a party","the chancellor","Wahlkreiskandidat."),
 mc("With the Zweitstimme you vote for …","a party","a candidate","the president","Parteistimme."),
 fill("Der Bundestag ___ gewählt. (werden, Passiv Präsens)",["wird"],"wird gewählt.")])
E[181] = V("9N_1Hdf8SCI","Ruhr area - Germany's largest metropolitan area","Die Welt in Karten",6,"Note the cities and the history; name three Ruhr cities.",[
 mc("Which city belongs to the Ruhrgebiet?","Essen","München","Hamburg","Essen, Dortmund, Duisburg."),
 fill("das Haus → das ___ (small)",["Häuschen","Haeuschen"],"-chen + Umlaut."),
 mc("The Ruhrgebiet is known for …","coal mining and industry","wine","skiing","Bergbau und Stahl.")])
E[182] = V("RAikJlwcdw0","Strukturwandel - Wirtschaftssektoren 1","Geographie - simpleclub",4,"Sort jobs into the three sectors.",[
 mc("Industry belongs to the … sector.","secondary","primary","tertiary","sekundärer Sektor."),
 mc("Services belong to the … sector.","tertiary","primary","secondary","tertiärer Sektor."),
 fill("___ der Arbeitszeit darf man nicht privat telefonieren. (during + Genitiv)",["Während","Waehrend"],"während + Genitiv.")])
E[183] = V("8kNzlAwT-xI","Strukturwandel im Ruhrgebiet einfach erklärt","selbstorientiert",11,"Note the phases: Kohle, Krise, neue Branchen. Use wie/als to compare then and now.",[
 mc("“der Strukturwandel” means:","structural change","building work","change of clothes","Wandel = change."),
 fill("Heute gibt es weniger Bergwerke ___ früher.",["als"],"Komparativ + als."),
 mc("Which sentence is correct?","Er ist so alt wie ich.","Er ist so alt als ich.","Er ist so älter wie ich.","so … wie.")])
E[184] = V("Wj03L7Js55w","Deutsch lernen (A2) | Das Deutschlandlabor | Folge 18: Kunst","Deutsch lernen mit der DW",5,"Note art vocabulary; describe a picture you like.",[
 mc("“die Ausstellung” means:","exhibition","position","statement","eine Ausstellung besuchen."),
 mc("“das Gemälde” means:","painting","gem","stamp","Gemälde im Museum."),
 mc("“der Künstler” means:","artist","craftsman of trade","cunning man","Künstler und Künstlerin.")])
E[185] = V("OyuXSJ9pG6M","Is Germany an Attractive Country For Immigration? | Easy German 612","Easy German",14,"Listen for reasons for and against; note migration vocabulary.",[
 mc("“einwandern” means:","to immigrate","to walk in","to move a wall","Er ist eingewandert."),
 mc("“die Aufenthaltserlaubnis” means:","residence permit","permission to leave","stay-at-home order","Aufenthalt = stay."),
 fill("Ich bin ___ zwei Jahren nach Deutschland gekommen. (ago)",["vor"],"vor + Dativ.")])
E[186] = V("yanc4sZuaPE","Integration in Germany (with Abdul and Allaa from German LifeStyle) | Easy German","Easy German",11,"Note experiences with language, work and neighbours; say what helps you feel at home.",[
 mc("“die Integration” means:","integration","integrity","interaction","Integration in Deutschland."),
 mc("“sich einleben” means:","to settle in","to enter life","to live alone","Ich habe mich eingelebt."),
 mc("“der Integrationskurs” is …","a language and orientation course","a math course","a sports club","Sprachkurs + Orientierung.")])
E[187] = V("9zTMQXR13uU","German Lesson (124) - Relativpronomen im Genitiv - dessen - deren - B1/B2","lingoni GERMAN",8,"Note that dessen/deren replaces the article of the following noun.",[
 fill("Das ist der Mann, ___ Tochter Ärztin ist.",["dessen"],"dessen bei maskulin."),
 fill("Das ist die Frau, ___ Sohn in Berlin lebt.",["deren"],"deren bei feminin."),
 mc("After dessen/deren the noun has …","no article","der article","a definite article in dative","dessen Tochter.")])
E[188] = V("5LznsgvEaTs","Selbstständig machen in 13 Schritten | Selbstständigkeit Grundlagen ganz einfach","STEUERFIT",13,"Note the steps to start a business; name the first three.",[
 mc("“selbstständig” means:","self-employed, independent","selfish","self-service","selbstständig arbeiten."),
 mc("“die Gründung” means:","founding","ground","reason of anger","Firmengründung."),
 mc("Complete: Die Firma ist klein, ___ sehr erfolgreich.","dennoch","deshalb","außerdem","dennoch = contrast.")])
E[189] = V("z--oZ4_Cyfo","Relativsätze mit \"wo\" und \"was\" | How to make relative clauses more simple","Deutsch1",6,"Note when to use wo (places) and was (after alles, nichts, das Beste).",[
 fill("Die Stadt, ___ ich wohne, ist klein.",["wo","in der"],"wo = in der."),
 mc("After “alles” the relative pronoun is …","was","das","wo","alles, was …"),
 mc("Das Beste, ___ ich kenne.","was","das","wo","nach Superlativ: was.")])
E[190] = V("Jv5mIw0Etc4","Das Verb \"lassen\" klar erklärt (modale Bedeutung)","DeutschLera",10,"Note the meanings: allow, cause to be done, leave.",[
 fill("Ich ___ mein Auto reparieren. (lassen, ich)",["lasse"],"ich lasse."),
 mc("“Er lässt sich die Haare schneiden” means …","someone else cuts his hair","he cuts his hair himself","he refuses to cut hair","Veranlassung."),
 mc("Perfekt: Ich habe ihn kommen ___.","lassen","gelassen","lässt","Ersatzinfinitiv.")])
E[191] = V("z_GAd4Qml7M","Die N-DEKLINATION einfach erklärt (Deutsch lernen | Grammatik)","Dein Sprachcoach",11,"Learn the group typical n-nouns (Student, Kollege, Herr, Mensch).",[
 fill("Ich kenne den Student___.",["en","Studenten"],"den Studenten."),
 mc("Which noun follows the n-declension?","der Junge","der Tisch","der Apfel","den Jungen."),
 fill("Ich helfe dem Kollege___.",["n","Kollegen"],"dem Kollegen.")])
E[192] = V("fvALt7eKK14","B1 - Lesson 25 | Konjunktiv II | Irreale Wünsche und Träume","Learn German",5,"Note wenn + Konjunktiv II and hätte/wäre; write three wishes of your own.",[
 fill("Ich wünschte, ich ___ mehr Zeit. (haben, Konjunktiv II)",["hätte","haette"],"ich hätte."),
 mc("Wenn ich doch nur fliegen ___!","könnte","kann","konnte","Konjunktiv II."),
 mc("“Es wäre schön, wenn …” expresses …","a wish","a fact","an order","Wunsch.")])
json.dump({str(k):v for k,v in sorted(E.items())}, open("content/src/extras-b1-02.json","w"), ensure_ascii=False, indent=0)
print(len(E))
