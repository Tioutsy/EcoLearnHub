export interface LocalizedCourseMeta {
  title: string;
  description: string;
  fullDescription?: string;
  learningObjectives: string[];
  badgeName: string;
  badgeDescription: string;
  completionMessage?: string;
}

export interface LocalizedLessonTranslation {
  title: string;
  content?: string;
  blocks?: Array<{
    id?: string;
    type: string;
    headingText?: string;
    bodyText?: string;
    promptText?: string;
    items?: string[];
    scenarioSetup?: string;
    characterRole?: string;
    workplaceContext?: string;
    decisionOptions?: Array<{
      id: string;
      label: string;
      consequence: string;
      feedback: string;
      isRecommended?: boolean;
    }>;
  }>;
}

export interface LocalizedQuizQuestionTranslation {
  question: string;
  options: string[];
  correctExplanation?: string;
  incorrectExplanation?: string;
  optionFeedback?: string[];
  practicalTakeaway?: string;
}

export interface CourseTranslationPackage {
  meta: LocalizedCourseMeta;
  lessons: Record<number, LocalizedLessonTranslation>; // key is orderIndex
  quizQuestions: Record<number, LocalizedQuizQuestionTranslation>; // key is orderIndex
}

export const frenchCourseRegistry: Record<string, CourseTranslationPackage> = {
  "ELH-01": {
    meta: {
      title: "Fondements du développement durable",
      description: "Une introduction pratique au développement durable et aux choix quotidiens au travail qui influencent les résultats environnementaux, sociaux et économiques.",
      fullDescription: "Ce cours présente les concepts essentiels du développement durable et la responsabilité en entreprise, adaptés aux réalités mauriciennes.",
      learningObjectives: [
        "Expliquer le développement durable avec un langage simple du lieu de travail.",
        "Reconnaître les dimensions environnementales, sociales et économiques d’une décision.",
        "Identifier les actions quotidiennes qu’un employé peut influencer.",
        "Choisir un engagement de développement durable réaliste."
      ],
      badgeName: "Initié au développement durable",
      badgeDescription: "Décerné pour avoir complété le cours Fondements du développement durable et pris un engagement personnel.",
      completionMessage: "Félicitations ! Vous avez complété avec succès le cours Fondements du développement durable."
    },
    lessons: {
      0: {
        title: "Bienvenue : le développement durable au quotidien",
        content: "Le développement durable est une démarche simple : répondre à nos besoins d'aujourd'hui sans compromettre ceux des générations futures. Chaque geste compte à Maurice.",
        blocks: [
          { type: "heading", headingText: "Le développement durable commence au travail" },
          { type: "short_text", bodyText: "Au travail, le développement durable concerne la façon dont nous utilisons l'énergie du réseau CEB, l'eau et les équipements au quotidien." },
          { type: "key_message", headingText: "Un engagement collectif", bodyText: "Chaque employé peut agir à son niveau. Ensemble, ces actions préservent notre île et soutiennent l'entreprise." }
        ]
      },
      1: {
        title: "Les trois dimensions interconnectées",
        content: "Le développement durable repose sur trois piliers : l'environnement, le social et l'économie.",
        blocks: [
          { type: "heading", headingText: "Les trois piliers" },
          { type: "short_text", bodyText: "Une décision durable équilibre l'impact environnemental, le bien-être des équipes et la santé financière de l'entreprise." },
          {
            type: "decision_scenario",
            scenarioSetup: "Vous remarquez que la climatisation tourne dans une salle de réunion vide avec les fenêtres ouvertes.",
            decisionOptions: [
              { id: "opt1", label: "Fermer les fenêtres et régler la climatisation à 24°C", consequence: "Économie d'énergie immédiate", feedback: "Excellente décision pour réduire la consommation d'électricité.", isRecommended: true },
              { id: "opt2", label: "Laisser en l'état", consequence: "Gaspillage continu d'énergie", feedback: "Laisser tourner la climatisation à vide augmente inutilement la facture énergétique." }
            ]
          }
        ]
      },
      2: {
        title: "L'impact des choix professionnels",
        content: "Découvrez comment de petits choix quotidiens au bureau évitent le gaspillage et réduisent la pression sur Mare Chicose.",
        blocks: [
          { type: "heading", headingText: "Réduire à la source" },
          { type: "short_text", bodyText: "Éteindre les lumières inutiles et imprimer uniquement le nécessaire préserve les ressources mauriciennes." }
        ]
      },
      3: {
        title: "Habitudes pratiques à portée de main",
        content: "Adoptez des habitudes simples pour économiser l'eau et réduire les déchets résiduels.",
        blocks: [
          { type: "heading", headingText: "Actions concrètes" },
          { type: "short_text", bodyText: "Signalez les fuites d'eau rapidement et triez correctement vos déchets de bureau." }
        ]
      }
    },
    quizQuestions: {
      0: {
        question: "Quelle est la définition fondamentale du développement durable au travail ?",
        options: [
          "Répondre aux besoins présents sans compromettre les générations futures",
          "Interdire toute utilisation d'électricité dans l'entreprise",
          "Acheter uniquement des produits importés de haute technologie",
          "Travailler uniquement le jour pour éviter d'éclairer les locaux"
        ],
        correctExplanation: "Le développement durable équilibre les besoins actuels et futurs sur les plans environnemental, social et économique.",
        incorrectExplanation: "Le développement durable ne consiste pas à tout interdire, mais à utiliser nos ressources avec responsabilité.",
        practicalTakeaway: "Pensez à l'impact à long terme de vos décisions quotidiennes."
      },
      1: {
        question: "Quelles sont les trois dimensions d'une décision durable ?",
        options: [
          "Environnementale, sociale et économique",
          "Politique, légale et administrative",
          "Nationale, régionale et internationale",
          "Technologique, financière et commerciale"
        ],
        correctExplanation: "Ces trois dimensions doivent être équilibrées pour garantir une vraie durabilité.",
        incorrectExplanation: "Les trois piliers reconnus du développement durable sont l'environnement, l'aspect social et l'économie.",
        practicalTakeaway: "Évaluez chaque projet sous l'angle environnemental, humain et financier."
      },
      2: {
        question: "Quelle action individuelle a un impact positif direct à Maurice ?",
        options: [
          "Éteindre les équipements électriques inutilisés et signaler les fuites d'eau",
          "Laisser les climatiseurs allumés fenêtres ouvertes",
          "Jeter tous les plastiques avec les déchets ménagers résiduels",
          "Ignorer les consignes de tri de l'entreprise"
        ],
        correctExplanation: "Éteindre les appareils et stopper les fuites préserve le réseau électrique et les ressources en eau de l'île.",
        incorrectExplanation: "Chaque geste de sobriété énergétique et de conservation de l'eau compte directement à Maurice.",
        practicalTakeaway: "Faites attention aux petits gaspillages du quotidien."
      },
      3: {
        question: "Pourquoi est-il important de réduire les déchets à la source sur le lieu de travail ?",
        options: [
          "Pour réduire la pression sur le site d'enfouissement de Mare Chicose et préserver nos ressources",
          "Pour ralentir la vitesse de connexion internet des bureaux",
          "Pour empêcher les employés d'utiliser du papier recyclé",
          "Pour augmenter inutilement les coûts opérationnels de l'entreprise"
        ],
        correctExplanation: "La réduction à la source préserve la capacité du site de Mare Chicose et évite l'utilisation inutile de matières premières.",
        incorrectExplanation: "La réduction à la source est essentielle pour soulager nos infrastructures de traitement des déchets.",
        practicalTakeaway: "Évitez le gaspillage avant d'envisager le recyclage."
      }
    }
  },
  "ELH-02": {
    meta: {
      title: "Tri des déchets et système de poubelles mauricien",
      description: "Apprenez à prévenir les déchets évitables, lire les étiquettes de tri et trier correctement selon les filières disponibles dans votre entreprise.",
      fullDescription: "Ce cours guide les employés sur les bonnes pratiques de tri pour réduire l'enfouissement à Mare Chicose.",
      learningObjectives: [
        "Appliquer la hiérarchie des déchets avant le tri.",
        "Utiliser correctement les bacs et instructions de tri.",
        "Reconnaître les erreurs fréquentes de contamination.",
        "Savoir agir en cas de doute sur une matière."
      ],
      badgeName: "Expert du tri des déchets",
      badgeDescription: "Décerné pour avoir réussi le cours Tri des déchets.",
      completionMessage: "Félicitations pour l'obtention de votre badge Tri des déchets !"
    },
    lessons: {
      0: {
        title: "Introduction : l'impact du tri",
        content: "Un seul déchet mal trié peut contaminer toute une poubelle destinée au recyclage.",
        blocks: [{ type: "heading", headingText: "Trier avec précision" }]
      },
      1: {
        title: "Prévenir, réduire, réutiliser et trier",
        content: "La meilleure façon de gérer un déchet est de ne pas le produire.",
        blocks: [
          { type: "heading", headingText: "La hiérarchie des déchets" },
          {
            type: "decision_scenario",
            scenarioSetup: "Vous devez jeter un carton propre et du papier gras souillé après un repas d'équipe.",
            decisionOptions: [
              { id: "opt1", label: "Placer le carton propre dans le bac recyclage et le papier gras dans les déchets résiduels", consequence: "Tri correct sans contamination", feedback: "Parfait ! Le gras gâte le recyclage du papier.", isRecommended: true },
              { id: "opt2", label: "Mettre tout dans le bac de recyclage", consequence: "Contamination du bac complet", feedback: "Le papier gras souille le papier propre et gâche le lot recyclable." }
            ]
          }
        ]
      },
      2: {
        title: "Lire les étiquettes et consignes",
        content: "Repérez la signalétique des bacs dans votre entreprise.",
        blocks: [{ type: "heading", headingText: "Signalétique claire" }]
      },
      3: {
        title: "Erreurs fréquentes de tri au bureau",
        content: "Attention aux emballages souillés par de la nourriture.",
        blocks: [{ type: "heading", headingText: "Éviter la contamination" }]
      }
    },
    quizQuestions: {
      0: {
        question: "Quelle est la première étape recommandée dans la hiérarchie des déchets ?",
        options: [
          "Prévenir et réduire la production de déchets à la source",
          "Envoyer directement à Mare Chicose",
          "Brûler les emballages dans la cour",
          "Mélanger tous les plastiques et verres"
        ],
        correctExplanation: "La prévention à la source évite la création même du déchet.",
        incorrectExplanation: "Réduire les achats inutiles et éviter le jetable vient avant le recyclage.",
        practicalTakeaway: "Privilégiez la réduction avant le recyclage."
      },
      1: {
        question: "Que se passe-t-il si du papier souillé d'huile est placé dans le bac de recyclage papier ?",
        options: [
          "Il risque de contaminer le lot et d'empêcher son recyclage",
          "Il nettoie automatiquement le reste du bac",
          "Le papier devient immédiatement réutilisable",
          "Rien, le papier souillé se recycle parfaitement"
        ],
        correctExplanation: "Les graisses altèrent les fibres de papier et rendent le lot inexploitable pour le recyclage.",
        incorrectExplanation: "Les éléments gras doivent aller dans les déchets résiduels pour éviter de ruiner le papier propre.",
        practicalTakeaway: "Seul le papier propre et sec doit aller au recyclage."
      },
      2: {
        question: "Comment identifier le bon bac de recyclage dans votre entreprise ?",
        options: [
          "En lisant la signalétique claire et les pictogrammes affichés sur chaque bac",
          "En jetant au hasard dans le bac le plus proche",
          "En demandant uniquement à la fin du mois",
          "En déposant tous les déchets par terre"
        ],
        correctExplanation: "La signalétique couleur et les pictogrammes indiquent clairement la filière de tri.",
        incorrectExplanation: "Suivre la signalétique évite les erreurs de tri et facilite le travail des équipes de nettoyage.",
        practicalTakeaway: "Vérifiez l'étiquette du bac avant de déposer un matériau."
      },
      3: {
        question: "Que faire en cas de doute sur la recyclabilité d'un matériau complexe ?",
        options: [
          "Consulter la consigne affichée ou utiliser les déchets résiduels pour éviter de contaminer le bac de recyclage",
          "Jeter dans le bac de recyclage en espérant que quelqu'un trie plus tard",
          "Laisser le matériau sans bac au milieu du bureau",
          "Brûler l'emballage dans le parking"
        ],
        correctExplanation: "En cas de doute persistant, éviter de contaminer le bac propre protège toute la filière.",
        incorrectExplanation: "Placer un douteux dans le bac de recyclage risque d'invalider tout le lot.",
        practicalTakeaway: "En cas de doute, informez-vous et préservez la qualité du bac de recyclage."
      }
    }
  },
  "ELH-03": {
    meta: {
      title: "Efficacité énergétique au travail",
      description: "Présente des moyens pratiques pour réduire la consommation d'énergie inutile tout en préservant le confort, la sécurité et la productivité.",
      fullDescription: "Ce cours fournit des recommandations claires sur la gestion de l'éclairage, du système HVAC et des appareils de bureau.",
      learningObjectives: [
        "Reconnaître les sources d'énergie inutiles au bureau.",
        "Appliquer des habitudes écoresponsables pour le chauffage et l'éclairage.",
        "Distinguer les actions simples des interventions de maintenance.",
        "Signaler les dysfonctionnements via les bons canaux."
      ],
      badgeName: "Sobriété énergétique",
      badgeDescription: "Décerné pour avoir complété le cours Efficacité énergétique au travail.",
      completionMessage: "Félicitations pour votre engagement énergétique !"
    },
    lessons: {
      0: { title: "Introduction à la sobriété énergétique", content: "Chaque kilowattheure économisé compte." },
      1: {
        title: "Où consomme-t-on de l'énergie au bureau ?",
        content: "Éclairage, climatisation et bureautique.",
        blocks: [
          { type: "heading", headingText: "Postes de consommation" },
          {
            type: "decision_scenario",
            scenarioSetup: "En quittant le bureau le vendredi soir, vous constatez que plusieurs ordinateurs et écrans restent en veille.",
            decisionOptions: [
              { id: "opt1", label: "Éteindre complètement les écrans et ordinateurs non utilisés", consequence: "Économie d'énergie sur tout le week-end", feedback: "Bravo ! La consommation en veille représente une part importante du gaspillage.", isRecommended: true },
              { id: "opt2", label: "Laisser tout allumé", consequence: "Consommation inutile pendant 60 heures", feedback: "Les appareils en veille continuent de consommer de l'électricité inutilement." }
            ]
          }
        ]
      },
      2: { title: "Réglage optimal de la climatisation", content: "Maintenir 24°C offre un excellent compromis entre confort et efficacité." },
      3: { title: "Actions quotidiennes et signalement", content: "Signalez les thermostats défectueux à l'équipe maintenance." }
    },
    quizQuestions: {
      0: {
        question: "Quelle température est recommandée pour régler la climatisation dans les locaux professionnels ?",
        options: [
          "24°C pour concilier confort et sobriété énergétique",
          "16°C en permanence avec portes ouvertes",
          "30°C sans ventilation",
          "Désactiver complètement la climatisation en été"
        ],
        correctExplanation: "Régler la climatisation à 24°C garantit un bon confort sans surconsommer d'électricité.",
        incorrectExplanation: "Chaque degré en dessous de 24°C augmente la consommation énergétique d'environ 7%.",
        practicalTakeaway: "Adoptez le réflexe 24°C pour vos espaces climatisés."
      },
      1: {
        question: "Quel est l'effet des appareils laissés en veille pendant la nuit et les week-ends ?",
        options: [
          "Ils continuent de consommer de l'électricité inutilement",
          "Ils réduisent la facture globale de l'entreprise",
          "Ils produisent de l'énergie solaire automatiquement",
          "Ils n'ont absolument aucun impact électrique"
        ],
        correctExplanation: "La consommation fantôme des équipements en veille s'accumule sur l'année.",
        incorrectExplanation: "Éteindre complètement les multiprises et ordinateurs évite ce gaspillage invisible.",
        practicalTakeaway: "Éteignez complètement vos appareils avant de partir."
      },
      2: {
        question: "Quelle action favorise la sobriété lumineuse dans un bureau bien éclairé par la lumière naturelle ?",
        options: [
          "Éteindre les lumières artificielles inutiles près des fenêtres",
          "Allumer toutes les rampes d'éclairage au maximum",
          "Fermer les stores et garder toutes les lumières allumées",
          "Remplacer les ampoules par des projecteurs de forte puissance"
        ],
        correctExplanation: "Profiter de la lumière du jour permet d'éteindre l'éclairage électrique.",
        incorrectExplanation: "Utiliser la lumière naturelle est gratuit et plus agréable pour les yeux.",
        practicalTakeaway: "Profitez au maximum de la lumière naturelle pendant la journée."
      },
      3: {
        question: "Que faire lorsqu'un climatiseur fait un bruit anormal ou fuit de l'eau ?",
        options: [
          "Signaler immédiatement le dysfonctionnement au service maintenance",
          "Augmenter la ventilation au maximum",
          "Placer un chiffon et ne rien dire",
          "Démonter l'appareil vous-même sans formation"
        ],
        correctExplanation: "Signaler rapidement les pannes permet une réparation rapide et évite la surconsommation.",
        incorrectExplanation: "La maintenance préventive et corrective préserve le matériel et son efficacité.",
        practicalTakeaway: "Signalez les anomalies d'équipements dès leur apparition."
      }
    }
  }
};

const CATALOGUE_FRENCH_BASE: Record<string, { title: string; desc: string; objectives: string[]; badge: string; badgeDesc: string }> = {
  "ELH-04": {
    title: "Minimisation des déchets et recyclage",
    desc: "Apprenez à réduire les déchets résiduels, trier efficacement et encourager le réemploi sur votre lieu de travail.",
    objectives: ["Appliquer les principes de réduction des déchets.", "Trier correctement les matériaux recyclables.", "Réduire l'utilisation de produits à usage unique."],
    badge: "Champion du Recyclage",
    badgeDesc: "Décerné pour la maîtrise de la réduction et du tri des déchets."
  },
  "ELH-05": {
    title: "Sensibilisation à l'empreinte carbone",
    desc: "Comprenez les sources d'émissions de gaz à effet de serre et les actions concrètes pour réduire votre impact professionnel.",
    objectives: ["Identifier les Scope 1, 2 et 3.", "Mesurer les impacts des déplacements et de l'énergie.", "Mettre en œuvre des éco-gestes carbone."],
    badge: "Praticien Bas Carbone",
    badgeDesc: "Décerné pour la compréhension et la réduction de l'empreinte carbone."
  },
  "ELH-06": {
    title: "Conformité environnementale et législation",
    desc: "Maîtrisez les exigences réglementaires mauriciennes et assurez la conformité de vos opérations quotidiennes.",
    objectives: ["Identifier les lois environnementales applicables.", "Gérer les risques de non-conformité.", "Appliquer les procédures d'urgence et de signalement."],
    badge: "Garant de la Conformité",
    badgeDesc: "Décerné pour la maîtrise de la conformité environnementale."
  },
  "ELH-07": {
    title: "Les bases de l'ESG pour les entreprises",
    desc: "Comprenez les piliers Environnementaux, Sociaux et de Gouvernance et leur importance pour la pérennité de l'entreprise.",
    objectives: ["Définir les critères E, S et G.", "Collecter des données ESG fiables.", "Contribuer au rapport de durabilité."],
    badge: "Ambassadeur ESG",
    badgeDesc: "Décerné pour la compréhension des principes ESG."
  },
  "ELH-08": {
    title: "Pratiques de bureau vert",
    desc: "Transformez les habitudes de bureau pour réduire le papier, l'énergie et les consommables.",
    objectives: ["Numériser les flux de travail.", "Optimiser l'utilisation des consommables.", "Créer un environnement de travail éco-responsable."],
    badge: "Acteur du Bureau Vert",
    badgeDesc: "Décerné pour l'adoption de pratiques de bureau durables."
  },
  "ELH-09": {
    title: "Les fondamentaux des achats durables",
    desc: "Intégrez des critères écologiques et sociaux dans les décisions d'achat et la sélection des fournisseurs.",
    objectives: ["Évaluer les propositions des fournisseurs.", "Privilégier les éco-labels vérifiés.", "Prendre en compte le coût du cycle de vie."],
    badge: "Acheteur Responsable",
    badgeDesc: "Décerné pour l'intégration de la durabilité dans la commande publique et privée."
  },
  "ELH-10": {
    title: "Principes de l'économie circulaire",
    desc: "Passez du modèle linéaire 'extraire-fabriquer-jeter' à une approche circulaire axée sur la réparation et la régénération.",
    objectives: ["Concevoir pour la durabilité et le réemploi.", "Éliminer les pollutions à la source.", "Prolonger la durée de vie des équipements."],
    badge: "Penseur Circulaire",
    badgeDesc: "Décerné pour l'application des concepts d'économie circulaire."
  },
  "ELH-11": {
    title: "Biodiversité à Maurice",
    desc: "Comprenez la richesse unique de la faune et de la flore mauriciennes et protégez les écosystèmes locaux.",
    objectives: ["Identifier les espèces endémiques prioritaires.", "Réduire l'impact des activités professionnelles sur la nature.", "Participer aux initiatives locales de restauration."],
    badge: "Protecteur de la Biodiversité",
    badgeDesc: "Décerné pour l'engagement envers la préservation de la biodiversité locale."
  },
  "ELH-12": {
    title: "Créer une équipe de développement durable",
    desc: "Structurez et animez un comité vert efficace pour mobiliser vos collègues et piloter les projets RSE.",
    objectives: ["Définir les rôles et missions du comité.", "Mobiliser les départements clé.", "Suivre et valoriser les réussites."],
    badge: "Bâtisseur d'Équipe Verte",
    badgeDesc: "Décerné pour la création et la gestion d'un comité vert."
  },
  "ELH-13": {
    title: "Fixer des objectifs départementaux de durabilité",
    desc: "Déclinez la stratégie RSE globale en objectifs mesurables et réalistes pour chaque service.",
    objectives: ["Formuler des objectifs SMART.", "Aligner les cibles sur la stratégie de l'entreprise.", "Impliquer les équipes dans la définition des indicateurs."],
    badge: "Planificateur Stratégique",
    badgeDesc: "Décerné pour la fixation d'objectifs de durabilité efficaces."
  },
  "ELH-14": {
    title: "Planification d'action durable",
    desc: "Transformez vos objectifs RSE en plans d'action opérationnels avec budgets, responsabilités et échéanciers.",
    objectives: ["Établir une feuille de route détaillée.", "Allouer les ressources nécessaires.", "Anticiper les risques de retard."],
    badge: "Gestionnaire de Projets RSE",
    badgeDesc: "Décerné pour la conception de plans d'action durables."
  },
  "ELH-15": {
    title: "Communiquer le développement durable au travail",
    desc: "Valorisez vos initiatives écologiques de manière transparente et évitez le greenwashing.",
    objectives: ["Rédiger des messages clairs et factuels.", "Adapter la communication interne et externe.", "Utiliser des données vérifiables."],
    badge: "Communicant Transparent",
    badgeDesc: "Décerné pour la communication responsable et authentique."
  },
  "ELH-16": {
    title: "Engagement des employés dans la durabilité",
    desc: "Inspirez et impliquez durablement l'ensemble des collaborateurs dans la démarche éco-responsable.",
    objectives: ["Organiser des ateliers de sensibilisation.", "Reconnaître et récompenser les éco-initiatives.", "Ancrer la durabilité dans la culture d'entreprise."],
    badge: "Fédérateur RSE",
    badgeDesc: "Décerné pour la réussite de la mobilisation des collaborateurs."
  },
  "ELH-17": {
    title: "Équipes vertes efficaces",
    desc: "Donnez les moyens à votre Green Team de surmonter les obstacles et d'obtenir des résultats mesurables.",
    objectives: ["Maintenir l'enthousiasme sur le long terme.", "Résoudre les conflits de priorité.", "Mesurer l'impact des projets menés."],
    badge: "Leader de Green Team",
    badgeDesc: "Décerné pour la conduite d'une Green Team performante."
  },
  "ELH-18": {
    title: "Collecte de données et preuves de durabilité",
    desc: "Assurez la traçabilité et la qualité des données environnementales pour les audits et bilans.",
    objectives: ["Mettre en place des modèles de relevé rigoureux.", "Vérifier la fiabilité des sources.", "Archiver les preuves de conformité."],
    badge: "Auditeur de Données RSE",
    badgeDesc: "Décerné pour la rigueur de la collecte de données d'impact."
  },
  "ELH-19": {
    title: "Suivi des actions durables et progrès",
    desc: "Pilotez vos indicateurs clés de performance (KPI) et ajustez les actions en temps réel.",
    objectives: ["Utiliser un tableau de bord RSE.", "Analyser les écarts par rapport aux cibles.", "Communiquer les progrès aux parties prenantes."],
    badge: "Pilote de Performance RSE",
    badgeDesc: "Décerné pour le suivi précis de l'avancement des projets."
  },
  "ELH-20": {
    title: "Examen des performances et actions correctives",
    desc: "Évaluez régulièrement les résultats obtenus et mettez en place des plans d'amélioration continue.",
    objectives: ["Mener des revues de performance périodiques.", "Identifier les causes profondes des écarts.", "Déployer des actions correctives efficaces."],
    badge: "Analyste de l'Amélioration Continue",
    badgeDesc: "Décerné pour la gestion de l'amélioration continue RSE."
  },
  "ELH-21": {
    title: "Rôles, responsabilités et responsabilité",
    desc: "Clarifiez la gouvernance environnementale et définissez les responsabilités de chacun.",
    objectives: ["Cartographier les responsabilités RSE.", "Intégrer les objectifs écologiques dans les fiches de poste.", "Assurer le suivi de la responsabilité individuelle."],
    badge: "Garant de la Gouvernance",
    badgeDesc: "Décerné pour l'établissement d'une gouvernance claire."
  },
  "ELH-22": {
    title: "Réaliser des initiatives sur le lieu de travail",
    desc: "Conduisez avec succès des projets écoresponsables du cadrage à la clôture.",
    objectives: ["Gérer les opérations sur le terrain.", "Mobiliser les ressources matérielles.", "Évaluer l'impact final de l'initiative."],
    badge: "Conducteur d'Initiatives",
    badgeDesc: "Décerné pour la mise en œuvre réussie d'initiatives terrain."
  },
  "ELH-23": {
    title: "Développement durable pour les équipes RH",
    desc: "Intégrez la RSE dans les processus de recrutement, la marque employeur et la formation.",
    objectives: ["Concevoir une politique de marque employeur verte.", "Intégrer la RSE dans l'onboarding.", "Proposer des formations éco-citoyennes."],
    badge: "RH Éco-Responsable",
    badgeDesc: "Décerné pour la conduite de la transition écologique en RH."
  },
  "ELH-24": {
    title: "Développement durable pour la vente et le marketing",
    desc: "Valorisez l'offre écoresponsable auprès des clients en garantissant une communication éthique.",
    objectives: ["Présenter l'argumentaire vert sans surenchère.", "Répondre aux exigences ESG des acheteurs.", "Concevoir des campagnes marketing responsables."],
    badge: "Marketeur Éthique",
    badgeDesc: "Décerné pour la promotion responsable des solutions durables."
  },
  "ELH-25": {
    title: "Développement durable pour les équipes financières",
    desc: "Intégrez les critères environnementaux dans les choix d'investissement, le contrôle de gestion et la fiscalité.",
    objectives: ["Évaluer les investissements selon le retour ESG.", "Suivre les coûts liés à l'énergie et aux déchets.", "Préparer les audits financiers et RSE."],
    badge: "Contrôleur Financier Vert",
    badgeDesc: "Décerné pour l'intégration de la RSE dans l'analyse financière."
  },
  "ELH-26": {
    title: "Développement durable pour les équipes achats",
    desc: "Sélectionnez et évaluez les fournisseurs selon des critères de durabilité et d'éthique.",
    objectives: ["Rédiger des cahiers des charges intégrant l'éco-conception.", "Auditer la chaîne d'approvisionnement.", "Privilégier les circuits courts et durables."],
    badge: "Responsable Achats Durables",
    badgeDesc: "Décerné pour l'excellence en approvisionnement responsable."
  },
  "ELH-27": {
    title: "Développement durable pour les services généraux et l'immobilier",
    desc: "Optimisez la gestion technique du bâtiment, l'énergie, l'eau et les déchets immobiliers.",
    objectives: ["Automatiser les réglages d'énergie.", "Réduire l'impact environnemental des locaux.", "Gérer la maintenance préventive des installations."],
    badge: "Facility Manager Vert",
    badgeDesc: "Décerné pour l'optimisation écologique des infrastructures."
  },
  "ELH-28": {
    title: "Certification finale en développement durable",
    desc: "Validez l'ensemble de vos compétences en RSE et démontrez votre capacité à piloter le changement.",
    objectives: ["Synthétiser les apprentissages des parcours.", "Résoudre des cas pratiques complexes.", "Définir une feuille de route personnelle."],
    badge: "Ambassadeur du Développement Durable",
    badgeDesc: "Décerné pour l'obtention de la certification globale Elevio Skills."
  },
  "ELH-29": {
    title: "Développement durable pour les équipes opérations et de première ligne",
    desc: "Mettre en œuvre les éco-gestes opérationnels dans la production, le stockage et les services.",
    objectives: ["Réduire les pertes de matière première.", "Optimiser la consommation d'énergie des machines.", "Maintenir un environnement de travail propre et sûr."],
    badge: "Opérateur Éco-Efficace",
    badgeDesc: "Décerné pour la réussite du cours Opérations durables."
  }
};

// Populate packages for ELH-04 to ELH-29 with 4 quiz questions and decision scenarios
for (let i = 4; i <= 29; i++) {
  const code = `ELH-${String(i).padStart(2, "0")}`;
  if (!frenchCourseRegistry[code] && CATALOGUE_FRENCH_BASE[code]) {
    const base = CATALOGUE_FRENCH_BASE[code];
    frenchCourseRegistry[code] = {
      meta: {
        title: base.title,
        description: base.desc,
        fullDescription: `${base.desc} Ce cours fournit des outils pratiques et des exemples adaptés au contexte professionnel mauricien.`,
        learningObjectives: base.objectives,
        badgeName: base.badge,
        badgeDescription: base.badgeDesc,
        completionMessage: `Félicitations ! Vous avez complété avec succès le cours ${base.title}.`
      },
      lessons: {
        0: {
          title: `Introduction à ${base.title}`,
          content: `Bienvenue dans le cours ${base.title}. Découvrez les enjeux essentiels pour votre poste.`,
          blocks: [
            { type: "heading", headingText: `Comprendre ${base.title}` },
            { type: "short_text", bodyText: `Ce premier module présente les notions fondamentales et leur application directe sur le lieu de travail.` },
            { type: "key_message", headingText: "Priorité à l'action", bodyText: "Chaque geste compte pour réduire le gaspillage et améliorer la conformité environnementale." }
          ]
        },
        1: {
          title: "Principes clés et bonnes pratiques",
          content: "Découvrez les méthodes éprouvées pour appliquer ces principes au quotidien.",
          blocks: [
            { type: "heading", headingText: "Méthodes opérationnelles" },
            { type: "short_text", bodyText: "Appliquez les consignes établies dans votre organisation pour garantir des résultats mesurables." },
            {
              type: "decision_scenario",
              scenarioSetup: `Dans le cadre de ${base.title}, vous observez une pratique non conforme lors de vos opérations quotidiennes.`,
              decisionOptions: [
                { id: "opt1", label: "Appliquer immédiatement la procédure écoresponsable validée", consequence: "Impact positif et conformité assurée", feedback: "Excellente décision qui préserve les ressources et respecte la démarche RSE.", isRecommended: true },
                { id: "opt2", label: "Ignorer le dysfonctionnement pour aller plus vite", consequence: "Risque de gaspillage et de non-conformité", feedback: "Ignorer les consignes augmente l'empreinte environnementale et le risque d'incident." }
              ]
            }
          ]
        },
        2: {
          title: "Mise en pratique et scénario professionnel",
          content: "Analysez une situation réelle et choisissez l'action la plus écoresponsable.",
          blocks: [
            { type: "heading", headingText: "Cas pratique de terrain" },
            { type: "short_text", bodyText: "Suivez les recommandations du guide d'action locale à Maurice." }
          ]
        },
        3: {
          title: "Évaluation des connaissances et engagement",
          content: "Validez vos compétences et enregistrez votre engagement écoresponsable.",
          blocks: [
            { type: "commitment", promptText: "Sélectionnez votre action prioritaire à mettre en œuvre cette semaine." }
          ]
        }
      },
      quizQuestions: {
        0: {
          question: `Quel est l'objectif principal du cours ${base.title} ?`,
          options: [
            base.objectives[0],
            "Augmenter l'utilisation de produits jetables",
            "Ignorer les consignes de sécurité environnementale",
            "Remplacer les processus locaux par des méthodes obsolètes"
          ],
          correctExplanation: `L'objectif central est de ${base.objectives[0].toLowerCase()}.`,
          incorrectExplanation: "Le cours vise à améliorer les pratiques professionnelles et à réduire le gaspillage.",
          practicalTakeaway: "Appliquez ces compétences dès aujourd'hui sur votre lieu de travail."
        },
        1: {
          question: "Quelle attitude adopter face à une opportunité de réduction du gaspillage ?",
          options: [
            "Prendre l'initiative de suivre la procédure établie et signaler les améliorations",
            "Attendre que d'autres personnes agissent à votre place",
            "Considérer que le développement durable n'est pas votre responsabilité",
            "Casser les équipements existants"
          ],
          correctExplanation: "Chaque employé joue un rôle actif dans la réussite de la démarche RSE.",
          incorrectExplanation: "L'engagement individuel est indispensable pour obtenir des résultats durables.",
          practicalTakeaway: "Soyez moteur dans l'application des éco-gestes."
        },
        2: {
          question: `Quelle action concrète soutient directement ${base.title} à Maurice ?`,
          options: [
            "Appliquer les consignes locales de sobriété et de tri dans votre service",
            "Consommer davantage de plastique à usage unique",
            "Ne jamais remonter d'anomalie à votre responsables",
            "Gaspiller l'eau pendant les heures d'ouverture"
          ],
          correctExplanation: "Le respect des consignes locales améliore la performance globale de l'entreprise.",
          incorrectExplanation: "Les actions individuelles quotidiennes conditionnent les résultats de la collectivité.",
          practicalTakeaway: "Intégrez les éco-réflexes dans votre routine professionnelle."
        },
        3: {
          question: "Comment mesurer le succès d'une démarche RSE dans votre département ?",
          options: [
            "Par le suivi régulier des indicateurs et le respect des objectifs fixés",
            "En arrêtant toute activité commerciale",
            "En évitant de publier les résultats RSE",
            "En jetant les données de mesure"
          ],
          correctExplanation: "Le suivi des indicateurs de performance permet d'évaluer les progrès et d'ajuster les actions.",
          incorrectExplanation: "Mesurer et analyser les résultats est indispensable pour piloter la durabilité.",
          practicalTakeaway: "Consultez régulièrement le tableau de bord de votre département."
        }
      }
    };
  }
}

/**
 * Gets localized French course content package if present, or undefined.
 */
export function getFrenchCoursePackage(courseCode: string): CourseTranslationPackage | undefined {
  if (!courseCode) return undefined;
  const normalizedCode = courseCode.toUpperCase().trim();
  return frenchCourseRegistry[normalizedCode];
}
