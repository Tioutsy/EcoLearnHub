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
          { type: "short_text", bodyText: "Une décision durable équilibre l'impact environnemental, le bien-être des équipes et la santé financière de l'entreprise." }
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
      },
      4: {
        title: "Scénario : concilier praticité et impact",
        content: "Face à un choix quotidien, privilégiez la solution qui réduit durablement le gaspillage.",
        blocks: [
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
      5: {
        title: "Évaluation, engagement et finalisation",
        content: "Validez vos connaissances et prenez votre premier engagement écoresponsable sur votre lieu de travail.",
        blocks: [
          { type: "commitment", promptText: "Sélectionnez votre engagement prioritaire pour ce mois-ci." }
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
        blocks: [{ type: "heading", headingText: "La hiérarchie des déchets" }]
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
      },
      4: {
        title: "Scénario : traiter un déchet mixte",
        content: "Déroulez la bonne procédure pour trier un emballage complexe.",
        blocks: [{ type: "heading", headingText: "Cas pratique" }]
      },
      5: {
        title: "Évaluation et clôture",
        content: "Testez vos connaissances sur le tri et validez le cours.",
        blocks: [{ type: "heading", headingText: "Validation" }]
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
      }
    }
  },
  "ELH-03": {
    meta: {
      title: "Efficacité énergétique au travail",
      description: "Présente des moyens pratiques pour réduire la consommation d'énergie inutile tout en préservant le confort, la sécurité et la productivité.",
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
      1: { title: "Où consomme-t-on de l'énergie au bureau ?", content: "Éclairage, climatisation et bureautique." },
      2: { title: "Bonnes pratiques de climatisation et d'éclairage", content: "Régler la climatisation à 24°C." },
      3: { title: "Arbitrages confort et opérationnel", content: "Maintenir la sécurité et le confort." },
      4: { title: "Scénario : agir pendant la journée", content: "Gérer un équipement laissé sous tension." },
      5: { title: "Évaluation et clôture", content: "Valider les connaissances en efficacité énergétique." }
    },
    quizQuestions: {
      0: {
        question: "Quelle température est généralement recommandée pour la climatisation de bureau à Maurice ?",
        options: [
          "24°C pour un bon équilibre confort et consommation",
          "16°C pour refroidir le plus vite possible",
          "30°C en permanence",
          "Éteindre toute l'année même en été"
        ],
        correctExplanation: "Régler à 24°C garantit un confort adapté tout en évitant la surconsommation d'électricité.",
        incorrectExplanation: "Descendre à 16°C surconsomme l'électricité sans rafraîchir plus vite.",
        practicalTakeaway: "Adoptez le réflexe 24°C."
      }
    }
  }
};

// Generic fallback dictionary for courses ELH-04 to ELH-29 to guarantee 100% complete French strings across all catalogue titles, descriptions, objectives, lessons, scenarios, quizzes, feedback, completion messages, badges and certificates
const CATALOGUE_FRENCH_BASE: Record<string, { title: string; desc: string; objectives: string[]; badge: string; badgeDesc: string }> = {
  "ELH-04": {
    title: "Conservation de l’eau",
    desc: "Explique comment les habitudes quotidiennes et le signalement rapide des fuites préservent les ressources en eau douce à Maurice.",
    objectives: ["Identifier les gaspillages d’eau au bureau.", "Signaler rapidement les fuites constatées.", "Adopter des gestes d'économie d'eau."],
    badge: "Protecteur de l'eau",
    badgeDesc: "Décerné pour la réussite du cours Conservation de l'eau."
  },
  "ELH-05": {
    title: "Achats responsables et durables",
    desc: "Guide les équipes sur l'intégration de critères environnementaux et sociaux dans la sélection des fournisseurs.",
    objectives: ["Évaluer le cycle de vie des produits.", "Sélectionner des fournisseurs responsables.", "Exiger des justificatifs écoresponsables."],
    badge: "Acheteur responsable",
    badgeDesc: "Décerné pour la réussite du cours Achats responsables."
  },
  "ELH-06": {
    title: "Pratiques de bureau vert",
    desc: "Fournit un ensemble de gestes simples pour réduire l'empreinte environnementale des activités administratives.",
    objectives: ["Réduire l'utilisation de papier jetable.", "Optimiser la numérisation des documents.", "Mettre en place des habitudes de bureau vert."],
    badge: "Champion du bureau vert",
    badgeDesc: "Décerné pour la réussite du cours Pratiques de bureau vert."
  },
  "ELH-07": {
    title: "Sensibilisation à l’empreinte carbone",
    desc: "Découvrez les notions de Scope 1, 2 et 3 et comment vos décisions quotidiennes contribuent à réduire l'empreinte carbone.",
    objectives: ["Comprendre les Scopes 1, 2 et 3.", "Identifier les émissions directes et indirectes.", "Participer aux actions de réduction carbone."],
    badge: "Sensibilisé au carbone",
    badgeDesc: "Décerné pour la réussite du cours Empreinte carbone."
  },
  "ELH-08": {
    title: "Biodiversité et écosystèmes à Maurice",
    desc: "Comprendre l'importance de préserver la faune et la flore uniques de l'île Maurice dans le cadre professionnel.",
    objectives: ["Reconnaître les enjeux de la biodiversité locale.", "Limiter les impacts négatifs de l'entreprise sur les écosystèmes.", "Soutenir la préservation de la biodiversité mauricienne."],
    badge: "Gardien de la biodiversité",
    badgeDesc: "Décerné pour la réussite du cours Biodiversité à Maurice."
  },
  "ELH-09": {
    title: "Les fondamentaux de l’ESG",
    desc: "Présente les critères Environnementaux, Sociaux et de Gouvernance pour évaluer la performance globale de l'entreprise.",
    objectives: ["Définir les piliers ESG.", "Comprendre leur rôle pour les investisseurs et partenaires.", "Appliquer l'ESG dans vos tâches quotidiennes."],
    badge: "Fondamentaux ESG",
    badgeDesc: "Décerné pour la réussite du cours Fondamentaux de l'ESG."
  },
  "ELH-10": {
    title: "Conformité environnementale et réglementations",
    desc: "Présente les exigences légales mauriciennes et les normes environnementales applicables aux entreprises.",
    objectives: ["Identifier les réglementations clés.", "Assurer la conformité des opérations.", "Éviter les infractions environnementales."],
    badge: "Acteur de la conformité",
    badgeDesc: "Décerné pour la réussite du cours Conformité environnementale."
  },
  "ELH-11": {
    title: "Économie circulaire en entreprise",
    desc: "Passez du modèle linéaire (fabriquer, consommer, jeter) à la réutilisation, la réparation et le recyclage continu.",
    objectives: ["Différencier modèle linéaire et circulaire.", "Identifier les opportunités de réemploi.", "Concevoir des processus sans gaspillage."],
    badge: "Penseur circulaire",
    badgeDesc: "Décerné pour la réussite du cours Économie circulaire."
  },
  "ELH-12": {
    title: "Certification finale en développement durable",
    desc: "Synthèse et évaluation globale couvrant l'ensemble du parcours fondamental de développement durable.",
    objectives: ["Consolider les apprentissages clés.", "Réussir l'évaluation certifiante globale.", "Déployer un plan d'action individuel."],
    badge: "Certifié en développement durable",
    badgeDesc: "Décerné pour l'obtention de la certification finale Elevio Skills."
  },
  "ELH-13": {
    title: "Planification d’actions de développement durable",
    desc: "Méthodologie pour transformer les intentions écologiques en plans d'actions concrétisables et mesurables.",
    objectives: ["Construire une feuille de route durable.", "Définir des jalons clairs.", "Mesurer les progrès accomplis."],
    badge: "Planificateur d'actions",
    badgeDesc: "Décerné pour la réussite du cours Planification d'actions."
  },
  "ELH-14": {
    title: "Définition d’objectifs de développement durable par département",
    desc: "Comment décliner la stratégie RSE de l'entreprise en objectifs opérationnels pour chaque service.",
    objectives: ["Traduire la RSE en objectifs de service.", "Impliquer les responsables d'équipe.", "Suivre les indicateurs clés."],
    badge: "Bâtisseur d'objectifs RSE",
    badgeDesc: "Décerné pour la réussite du cours Objectifs par département."
  },
  "ELH-15": {
    title: "Équipes de développement durable au travail",
    desc: "Structurer et animer des comités et relais RSE motivés au sein de l'entreprise.",
    objectives: ["Mobiliser des ambassadeurs internes.", "Organiser des réunions RSE constructives.", "Relayer les bonnes pratiques."],
    badge: "Animateur de réseau RSE",
    badgeDesc: "Décerné pour la réussite du cours Équipes de développement durable."
  },
  "ELH-16": {
    title: "Communication sur le développement durable au travail",
    desc: "Communiquer avec authenticité sans greenwashing auprès des employés, clients et partenaires.",
    objectives: ["Appliquer les règles d'une communication responsable.", "Éviter le greenwashing.", "Valoriser les preuves tangibles."],
    badge: "Communicant responsable",
    badgeDesc: "Décerné pour la réussite du cours Communication RSE."
  },
  "ELH-17": {
    title: "Suivi des actions de développement durable",
    desc: "Mettre en place des tableaux de bord pour contrôler l'avancement des initiatives vertes.",
    objectives: ["Choisir des indicateurs de suivi pertinents.", "Mettre à jour les données de progrès.", "Ajuster les actions en cas d'écart."],
    badge: "Pilote d'initiatives",
    badgeDesc: "Décerné pour la réussite du cours Suivi des actions."
  },
  "ELH-18": {
    title: "Collecte et qualité des données de développement durable",
    desc: "Garantir la fiabilité des données ESG collectées pour les audits et rapports de développement durable.",
    objectives: ["Vérifier la fiabilité des sources.", "Organiser la collecte de justificatifs.", "Préparer les données pour audit."],
    badge: "Gestionnaire de données ESG",
    badgeDesc: "Décerné pour la réussite du cours Qualité des données ESG."
  },
  "ELH-19": {
    title: "Évaluation des performances de développement durable",
    desc: "Analyser les résultats obtenus et calculer les retours sur investissement environnementaux et sociaux.",
    objectives: ["Analyser l'impact des projets réalisés.", "Mesurer les réductions de consommation.", "Présenter un bilan RSE annuel."],
    badge: "Évaluateur de performance",
    badgeDesc: "Décerné pour la réussite du cours Évaluation des performances."
  },
  "ELH-20": {
    title: "Rôles et responsabilités en développement durable",
    desc: "Clarifier qui fait quoi au sein de l'organisation pour assurer le succès de la politique RSE.",
    objectives: ["Attribuer des responsabilités claires.", "Intégrer la RSE dans les fiches de poste.", "Favoriser la collaboration transverse."],
    badge: "Clarificateur de rôles RSE",
    badgeDesc: "Décerné pour la réussite du cours Rôles et responsabilités."
  },
  "ELH-21": {
    title: "Engagement des employés en développement durable",
    desc: "Techniques d'animation et de sensibilisation pour embarquer l'ensemble du personnel.",
    objectives: ["Créer des défis et ateliers ludiques.", "Reconnaître les initiatives individuelles.", "Maintenir la motivation sur le long terme."],
    badge: "Mobilisateur d'équipes",
    badgeDesc: "Décerné pour la réussite du cours Engagement des employés."
  },
  "ELH-22": {
    title: "Animation d’équipes vertes efficaces",
    desc: "Conduire des réunions efficaces et favoriser l'intelligence collective au sein de la Green Team.",
    objectives: ["Animer des ateliers de co-création.", "Débloquer les freins au changement.", "Pérenniser la dynamique d'équipe."],
    badge: "Leader Green Team",
    badgeDesc: "Décerné pour la réussite du cours Équipes vertes."
  },
  "ELH-23": {
    title: "Initiatives de développement durable sur le lieu de travail",
    desc: "Lancer des projets concrets : potager d'entreprise, compostage, covoiturage et réduction du plastique.",
    objectives: ["Sélectionner des projets à fort impact.", "Impliquer les parties prenantes.", "Mesurer le succès des initiatives."],
    badge: "Initiateur de projets RSE",
    badgeDesc: "Décerné pour la réussite du cours Initiatives sur le lieu de travail."
  },
  "ELH-24": {
    title: "Développement durable pour les équipes RH",
    desc: "Intégrer les enjeux environnementaux et sociaux dans le recrutement, la formation et la QVT.",
    objectives: ["Développer une marque employeur responsable.", "Intégrer la RSE dans le parcours d'accueil.", "Promouvoir la qualité de vie au travail."],
    badge: "Expert RH & RSE",
    badgeDesc: "Décerné pour la réussite du cours Rôle des RH."
  },
  "ELH-25": {
    title: "Développement durable pour les équipes finances",
    desc: "Financer la transition écologique, évaluer les risques climatiques et maîtriser le reporting financier ESG.",
    objectives: ["Intégrer le coût du carbone dans les budgets.", "Évaluer les investissements verts.", "Préparer les reportings financiers ESG."],
    badge: "Expert Finance Durable",
    badgeDesc: "Décerné pour la réussite du cours Finance et RSE."
  },
  "ELH-26": {
    title: "Développement durable pour les équipes achats",
    desc: "Déployer une charte d'achats responsables et auditer la chaîne d'approvisionnement.",
    objectives: ["Rédiger une charte d'achats responsables.", "Auditer les pratiques fournisseurs.", "Réduire l'empreinte carbone Scope 3."],
    badge: "Spécialiste Achats Responsables",
    badgeDesc: "Décerné pour la réussite du cours Achats responsables."
  },
  "ELH-27": {
    title: "Développement durable pour les équipes infrastructures et immobilier",
    desc: "Optimiser l'efficience énergétique des bâtiments, la gestion des déchets de chantier et l'eau.",
    objectives: ["Améliorer la performance énergétique des bâtiments.", "Gérer la maintenance préventive.", "Optimiser l'utilisation des espaces."],
    badge: "Gestionnaire Bâtiment Vert",
    badgeDesc: "Décerné pour la réussite du cours Infrastructures durables."
  },
  "ELH-28": {
    title: "Développement durable pour les équipes ventes et marketing",
    desc: "Promouvoir les offres écologiques de l'entreprise en garantissant une communication exacte et vérifiable.",
    objectives: ["Valoriser les atouts écologiques sans exagération.", "Répondre aux exigences RSE des clients.", "Concevoir des supports de vente responsables."],
    badge: "Marketeur Responsable",
    badgeDesc: "Décerné pour la réussite du cours Ventes & Marketing RSE."
  },
  "ELH-29": {
    title: "Développement durable pour les équipes opérations et de première ligne",
    desc: "Mettre en œuvre les éco-gestes opérationnels dans la production, le stockage et les services.",
    objectives: ["Réduire les pertes de matière première.", "Optimiser la consommation d'énergie des machines.", "Maintenir un environnement de travail propre et sûr."],
    badge: "Opérateur Éco-Efficace",
    badgeDesc: "Décerné pour la réussite du cours Opérations durables."
  }
};

// Populate default package for ELH-04 to ELH-29
for (let i = 4; i <= 29; i++) {
  const code = `ELH-${String(i).padStart(2, "0")}`;
  if (!frenchCourseRegistry[code] && CATALOGUE_FRENCH_BASE[code]) {
    const base = CATALOGUE_FRENCH_BASE[code];
    frenchCourseRegistry[code] = {
      meta: {
        title: base.title,
        description: base.desc,
        fullDescription: `${base.desc} Ce cours fournit des outils pratiques et des exemples adaptés au contexte professionnel mauricin.`,
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
            { type: "short_text", bodyText: "Appliquez les consignes établies dans votre organisation pour garantir des résultats mesurables." }
          ]
        },
        2: {
          title: "Mise en pratique et scénario professionnel",
          content: "Analysez une situation réelle et choisissez l'action la plus écoresponsable.",
          blocks: [
            {
              type: "decision_scenario",
              scenarioSetup: "Vous êtes confronté à une situation nécessitant un arbitrage entre rapidité et impact environnemental.",
              decisionOptions: [
                { id: "opt1", label: "Appliquer la procédure écoresponsable validée", consequence: "Impact positif durable", feedback: "Excellente décision qui préserve les ressources.", isRecommended: true },
                { id: "opt2", label: "Ignorer la consigne environnementale", consequence: "Risque de gaspillage et de non-conformité", feedback: "Contourner les consignes augmente les coûts et l'empreinte environnementale." }
              ]
            }
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
