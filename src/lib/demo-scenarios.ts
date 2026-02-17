export type DemoScenario = {
  name: string;
  avatar: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  responses: Record<string, string>;
};

export const demoScenarios: Record<string, DemoScenario> = {
  treuhand: {
    name: "Treuhand Muster AG",
    avatar: "📊",
    welcomeMessage:
      "Grüezi! Ich bin der KI-Assistent der Treuhand Muster AG. Ich helfe bei Buchhaltung, Steuern & Fristen.",
    suggestedQuestions: [
      "Was kostet eine Steuererklärung für Privatpersonen?",
      "Können Sie die Buchhaltung für mein KMU übernehmen?",
      "Ich möchte einen Beratungstermin vereinbaren",
      "Welche Unterlagen brauche ich für die Firmengründung?",
    ],
    responses: {
      steuererklaerung: "Eine Steuererklärung für Privatpersonen kostet ab CHF 350.-. Wir analysieren Ihre Situation und stimmen den Preis individuell ab.",
      buchhaltung:
        "Für Buchhaltung bieten wir drei Pakete: Starter (bis 100 Belege) CHF 290.-/Mt., Business (bis 300 Belege) CHF 590.-/Mt., Premium (unbegrenzt) CHF 990.-/Mt.",
      termin:
        "Unsere nächsten Termine: Mi 10:00 oder Fr 14:30. Nennen Sie mir das passende Datum, und ich bestätige sofort.",
      firmengruendung:
        "Für eine Firmengründung benötigen wir Ausweise, Handelsregisterauszug (falls vorhanden) und einen Businessplan. Wir begleiten Sie inkl. Notar und Eintrag (ab CHF 1'200.-).",
      default:
        "Ich begleite Sie bei Steuern, MWST, Buchhaltung und Fristen. Sagen Sie mir Ihr Anliegen, damit ich Ihnen passende Optionen vorschlagen kann.",
    },
  },
  handwerk: {
    name: "Elektro Brunner GmbH",
    avatar: "🔧",
    welcomeMessage:
      "Grüezi! Ich bin der digitale Assistent von Elektro Brunner. Ich regle Notfälle und Projekte rund um Ihr Handwerk.",
    suggestedQuestions: [
      "Ich habe einen Stromausfall - ist das ein Notfall?",
      "Was kostet eine Elektrokontrolle?",
      "Können Sie Solaranlagen installieren?",
      "Ich brauche einen Elektriker für nächste Woche",
    ],
    responses: {
      notfall: "🚨 Stromausfall? Bitte prüfen Sie zuerst den FI-Schalter. Bei Brandgeruch rufen Sie sofort die 118 und wir schicken den Pikett-Dienst.",
      elektrokontrolle: "Eine Kontrolle vor Ort kostet ab CHF 280.-. Inklusive Protokoll und Handlungsempfehlungen.",
      solaranlagen: "Ja, wir planen Ihre Solaranlage und liefern Offerte mit Amortisationsrechnung.",
      termin: "Ich finde freie Slots für nächste Woche und sende eine Bestätigung mit Telefonnummer und Team.",
      default: "Ich koordiniere Notfälle, Offerten und Termine für Ihr Projekt. Was darf ich als Nächstes für Sie erledigen?",
    },
  },
  gastronomie: {
    name: "Restaurant Sonnenberg",
    avatar: "🍽️",
    welcomeMessage:
      "Grüezi und herzlich willkommen! Ich bin der digitale Gastgeber vom Restaurant Sonnenberg. Ich kümmere mich um Reservierungen und Menüs.",
    suggestedQuestions: ["Tisch reservieren", "Menüvorschlag", "Sonntagsbrunch", "Allergien"],
    responses: {
      reservierung: "Für eine Tischreservierung brauche ich Datum, Uhrzeit und Personenzahl. Soll ich gleich den bevorzugten Bereich notieren?",
      menü: "Heute auf der Karte: Kürbisrisotto CHF 28.-, Alpen-Lachs CHF 34.-, Veganer Hirsesalat CHF 24.-. Alles frisch zubereitet.",
      brunch: "Unser Sonntagsbrunch läuft von 09:30–14:00 mit offenen Tees und Minibar. CHF 49.- pro Person.",
      default: "Ich organisiere Tische, Menüs und alle Special-Requests. Wie kann ich Ihnen den Service erleichtern?",
    },
  },
  gesundheit: {
    name: "Praxis Dr. Keller",
    avatar: "❤️",
    welcomeMessage:
      "Grüezi! Ich bin der Praxis-Assistent von Dr. Keller. Ich organisiere Termine, Rezeptanfragen und Patienteninfos.",
    suggestedQuestions: ["Termin buchen", "Notfall", "Rezepte", "Öffnungszeiten"],
    responses: {
      termin: "Welcher Tag passt Ihnen? Wir haben Mo–Fr 08:00-17:00 sowie Sa Vormittag. Ich sende die Bestätigung mit SMS.",
      notfall: "Bei Notfällen wählen Sie 144 oder unsere Notfallnummer 0800 123 456. Ich leite Sie direkt weiter.",
      rezept: "Rezeptanfragen für Wiederholverschreibungen bearbeiten wir innerhalb von 2 Stunden. Nennen Sie mir Ihr Medikament.",
      default: "Ich helfe bei Terminbuchungen, Rezepten und Patienteninfos. Sagen Sie mir Ihr Anliegen, und ich organisiere alles.",
    },
  },
  immobilien: {
    name: "Immo Swiss AG",
    avatar: "🏠",
    welcomeMessage:
      "Grüezi! Ich bin der Assistent von Immo Swiss AG. Ich unterstütze bei Besichtigungen und Miet- bzw. Kaufanfragen.",
    suggestedQuestions: ["Wohnung finden", "Besichtigung", "Finanzierung", "Verfügbarkeit"],
    responses: {
      wohnung: "Aktuell frei: 3.5 Zi in Oerlikon CHF 2'450.-/Mt., 2.5 Zi in Zürich-West CHF 2'080.-/Mt., 4.5 Zi in Altstetten CHF 2'890.-/Mt.",
      besichtigung: "Ich schlage Ihnen Mittwoch 18:00, Donnerstag 10:00 oder Freitag 16:00 vor. Was passt am besten?",
      finanzierung: "Ich vergleiche Kreditangebote (ab 1.35%) und berechne monatliche Raten. Budget bitte mitgeben.",
      default: "Ich finde passende Objekte, organisiere Besichtigungen und berechne die Finanzierung. Was möchten Sie als Nächstes?",
    },
  },
  rechtsberatung: {
    name: "Kanzlei Weber & Partner",
    avatar: "⚖️",
    welcomeMessage:
      "Grüezi! Ich bin der digitale Concierge der Kanzlei. Ich organisiere Termine, Hinweise zu Verträgen und Erstberatungen.",
    suggestedQuestions: ["Vertrag prüfen", "Erstberatung", "Arbeitsrecht", "Fristen"],
    responses: {
      vertrag: "Ich analysiere die wichtigsten Klauseln, markiere Risiken und stelle eine Liste mit Fragen zusammen. Anschliessend empfehle ich einen Anwalt.",
      erstberatung: "Eine Erstberatung kostet CHF 250.-/Stunde. Ich sende Ihnen die verfügbaren Zeitfenster und eine Zusammenfassung.",
      fristen: "Geben Sie mir das Datum und die Frist, ich erinnere Sie rechtzeitig per E-Mail und SMS.",
      default: "Ich koordiniere Termine, kläre Fragen zu Abläufen und leite Sie an den richtigen Experten weiter.",
    },
  },
};
