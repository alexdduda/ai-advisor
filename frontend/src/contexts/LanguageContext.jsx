import { createContext, useContext, useState, useCallback } from 'react'

const LanguageContext = createContext(null)

const translations = {
  en: {
    // ── Sidebar Nav ───────────────────────────────────────
    'nav.chat': 'AI Chat',
    'nav.courses': 'Courses',
    'nav.saved': 'Saved',
    'nav.calendar': 'Calendar',
    'nav.forum': 'Forum',
    'nav.profile': 'Profile',

    // ── Sidebar Footer / Popup ────────────────────────────
    'sidebar.settings': 'Settings',
    'sidebar.changeLanguage': 'Change Language',
    'sidebar.colorTheme': 'Color Theme',
    'sidebar.logOut': 'Log Out',
    'sidebar.signOut': 'Sign Out',

    // ── Settings Section Titles ───────────────────────────
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your McGill Advisor experience',
    'settings.appearance': 'Appearance',
    'settings.notifications': 'Notifications',
    'settings.privacyData': 'Privacy & Data',
    'settings.preferences': 'Preferences',

    // ── Settings Labels ───────────────────────────────────
    'settings.theme': 'Theme',
    'settings.themeDescription': 'Choose your preferred color scheme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.auto': 'Auto',
    'settings.emailNotifications': 'Email Notifications',
    'settings.emailNotificationsDesc': 'Receive updates via email',
    'settings.deadlineReminders': 'Deadline Reminders',
    'settings.deadlineRemindersDesc': 'Get notified about upcoming deadlines',
    'settings.courseUpdates': 'Course Updates',
    'settings.courseUpdatesDesc': 'Notifications about course changes',
    'settings.profileVisibility': 'Profile Visibility',
    'settings.profileVisibilityDesc': 'Who can see your profile',
    'settings.private': 'Private',
    'settings.friendsOnly': 'Friends Only',
    'settings.public': 'Public',
    'settings.shareProgress': 'Share Academic Progress',
    'settings.shareProgressDesc': 'Allow others to view your progress',
    'settings.language': 'Language',
    'settings.languageDesc': 'Interface language',
    'settings.timezone': 'Timezone',
    'settings.timezoneDesc': 'Your local timezone',
    'settings.exportData': 'Export Data',
    'settings.exportYourData': 'Export Your Data',
    'settings.exportDataDesc': 'Download all your data as JSON',
    'settings.exportModalText': 'This will download all your profile data, courses, and settings as a JSON file. You can use this for backup or to transfer your data.',
    'settings.downloadJson': 'Download JSON',
    'settings.dataExported': 'Data exported successfully!',

    // ── Profile Labels ────────────────────────────────────
    'profile.personalInfo': 'Personal Information',
    'profile.manageDetails': 'Manage your profile details',
    'profile.username': 'Username',
    'profile.email': 'Email Address',
    'profile.faculty': 'Faculty',
    'profile.major': 'Primary Major',
    'profile.additionalMajors': 'Additional Majors',
    'profile.minor': 'Minor',
    'profile.primaryMinor': 'Primary Minor',
    'profile.additionalMinors': 'Additional Minors',
    'profile.concentration': 'Concentration',
    'profile.year': 'Academic Year',
    'profile.gpa': 'GPA',
    'profile.currentGpa': 'Current GPA',
    'profile.editProfile': 'Edit Profile',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.changePhoto': 'Change Photo',
    'profile.notSpecified': 'Not specified',
    'profile.notSet': 'Not set',
    'profile.completeness': 'Profile Completeness',
    'profile.academicInfo': 'Academic Information',
    'profile.contactInfo': 'Contact Information',
    'profile.additionalInfo': 'Additional Information',
    'profile.academicInterests': 'Academic Interests',
    'profile.noInterests': 'No interests added yet. Add your academic interests to get personalized recommendations!',

    // ── Profile Tab Sections ──────────────────────────────
    'profile.academicPerformance': 'Academic Performance',
    'profile.gpaTip': 'Keep your GPA updated for better course recommendations',
    'profile.degreeProgress': 'Degree Progress',
    'profile.interestsPreferences': 'Interests & Preferences',
    'profile.achievements': 'Achievements',
    'profile.personalizedInsights': 'Personalized Insights',
    'profile.signOutTitle': 'Sign Out',
    'profile.signOutDescription': 'Sign out of your McGill AI Advisor account',

    // ── Profile Form ──────────────────────────────────────
    'profileForm.basicInfo': 'Basic Information',
    'profileForm.enterUsername': 'Enter Username',
    'profileForm.optional': 'Optional',
    'profileForm.displayName': 'Your display name',
    'profileForm.academicInfo': 'Academic Information',
    'profileForm.academicInfoDesc': 'Your faculty, program, and year of study',
    'profileForm.selectFaculty': 'Select your faculty',
    'profileForm.selectYear': 'Select year',
    'profileForm.selectMajor': 'Select your major',
    'profileForm.selectMinor': 'Select a minor (optional)',

    // ── Common ────────────────────────────────────────────
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.saveChanges': 'Save Changes',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.areYouSure': 'Are you sure?',
    'common.cancel': 'Cancel',
    'common.english': 'English',
    'common.french': 'Français',
    'common.user': 'User',
    'common.na': 'N/A',
    'common.reloadPage': 'Reload Page',

    // ── Chat ──────────────────────────────────────────────
    'chat.placeholder': 'Ask me anything about courses, planning, or McGill academics...',
    'chat.send': 'Send',
    'chat.sending': 'Sending...',
    'chat.newChat': 'New Chat',
    'chat.chatSession': 'Chat Session',
    'chat.chatHistory': 'Chat History',
    'chat.noPreviousChats': 'No previous chats',
    'chat.loadingHistory': 'Loading chat history...',
    'chat.failedToSend': 'Failed to send message. Please try again.',
    'chat.failedToLoad': 'Failed to load chat history',
    'chat.dropFiles': 'Drop files here to attach',
    'chat.dropFilesSubtext': 'PDF, Images, Text files (max 32MB)',

    // ── Courses ───────────────────────────────────────────
    'courses.searchPlaceholder': 'Search for courses (e.g., COMP 202, Introduction to Programming)...',
    'courses.searching': 'Searching...',
    'courses.filters': 'Filters',
    'courses.sortBy': 'Sort by:',
    'courses.relevance': 'Relevance',
    'courses.addToSaved': 'Add to favorites',
    'courses.removeFromSaved': 'Remove from favorites',
    'courses.markCompleted': 'Mark as completed',
    'courses.markNotCompleted': 'Mark as not completed',
    'courses.courseDetails': 'Course Details',
    'courses.prerequisites': 'Prerequisites',
    'courses.credits': 'Credits',
    'courses.sections': 'Sections',
    'courses.instructor': 'Instructor',
    'courses.rating': 'Rating',
    'courses.difficulty': 'Difficulty',
    'courses.reviews': 'Reviews',
    'courses.wouldRetake': 'Would Retake',
    'courses.loadingDetails': 'Loading course details...',
    'courses.noResults': 'No courses found matching your search.',
    'courses.failedSearch': 'Failed to search courses. Please try again.',
    'courses.failedDetails': 'Failed to load course details.',
    'courses.explorerTitle': 'Course Explorer with Professor Ratings',
    'courses.explorerDesc': 'Search through McGill courses with historical grade data and live RateMyProfessor ratings.',
    'courses.failedUpdate': 'Failed to update favorites',
    'courses.failedCompleted': 'Failed to update completed courses',
    'courses.failedMarkCompleted': 'Failed to mark course as completed',

    // ── Calendar ──────────────────────────────────────────
    'calendar.today': 'Today',
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.addEvent': 'Add Event',

    // ── Saved Courses ─────────────────────────────────────
    'saved.savedCourses': 'Saved Courses',
    'saved.completed': 'Completed',
    'saved.noSavedCourses': 'No Saved Courses Yet',
    'saved.noSavedCoursesDesc': 'Save courses from the Course Explorer to see them here',
    'saved.noCompletedCourses': 'No Completed Courses Yet',
    'saved.noCompletedCoursesDesc': 'Mark courses as completed to track your progress',

    // ── Degree Progress ───────────────────────────────────
    'degree.completion': 'Degree Completion',
    'degree.completedCourses': 'Completed Courses',
    'degree.advancedStanding': 'Advanced Standing',
    'degree.totalEarned': 'Total Earned',
    'degree.remaining': 'Remaining',
    'degree.creditsHeadStart': 'Your {count} AP/IB/transfer credits give you a head start!',

    // ── GPA & Calculator ──────────────────────────────────
    'gpa.trendTitle': 'Cumulative GPA Trend',
    'gpa.semester': 'Sem',
    'gpa.calculatorSubtitle': 'Calculate what you need to achieve your goal',
    'gpa.currentGpa': 'Current GPA',
    'gpa.creditsCompleted': 'Credits Completed',
    'gpa.creditsRemaining': 'Credits Remaining',
    'gpa.targetGpa': 'Target GPA',
    'gpa.requiredGpa': 'Required GPA for Remaining Courses',
    'gpa.equivalentGrade': 'Equivalent to maintaining approximately:',
    'gpa.notAchievable': 'Target Not Achievable',

    // ── Mark Complete Modal ───────────────────────────────
    'modal.markComplete': 'Mark Course as Completed',
    'modal.term': 'Term',
    'modal.year': 'Year',
    'modal.grade': 'Grade (optional)',
    'modal.notSpecified': 'Not specified',
    'modal.fall': 'Fall',
    'modal.winter': 'Winter',
    'modal.summer': 'Summer',

    // ── Achievements & Insights ───────────────────────────
    'achievements.title': 'Achievements',
    'insights.title': 'Personalized Insights',
    'insights.subtitle': 'Recommendations based on your profile and activity',
    'insights.completeProfile': 'Complete your profile and interact with the AI advisor to get personalized recommendations!',

    // ── Course Timeline ───────────────────────────────────
    'timeline.noCourses': 'No completed courses yet. Mark courses as taken in the Saved tab!',

    // ── Forum ─────────────────────────────────────────────
    'forum.comingSoon': 'Coming Soon',
    'forum.title': 'McGill Community Forum',
    'forum.launchDate': 'Launching Spring 2026',
    'forum.whatsComingTitle': "What's Coming",
    'forum.sneakPeek': 'Sneak Peek',
    'forum.sneakPeekSubtitle': "Here's what the forum will look like",
    'forum.recentDiscussions': 'Recent Discussions',
    'forum.beAmongFirst': 'Be Among the First',
    'forum.joinWaitlist': 'Join the waitlist to get early access and help shape the community',

    // ── Auth / Login ──────────────────────────────────────
    'auth.aiAdvisor': 'AI Academic Advisor',
    'auth.aiRecommendations': 'AI-Powered Recommendations',
    'auth.historicalData': 'Historical Grade Data',
    'auth.coursePlanning': 'Personalized Course Planning',
    'auth.username': 'Username',
    'auth.email': 'Email Address',
    'auth.password': 'Password',

    // ── Errors ────────────────────────────────────────────
    'error.authInitFailed': 'Unable to initialize authentication',
    'error.refreshPage': 'Please refresh the page or check your internet connection.',
    'error.profileSetupIssue': 'Profile Setup Issue',
    'error.profileSetupDesc': 'There was an issue setting up your profile. Please sign out and try again.',
    'error.sessionSetup': 'Setting up your session...',
    'error.loadingProfile': 'Loading your profile...',

    // ── Sign Out Confirmation ─────────────────────────────
    'signOut.confirm': 'Are you sure you want to sign out?',
    'signOut.button': 'Sign Out',
  },

  fr: {
    // ── Sidebar Nav ───────────────────────────────────────
    'nav.chat': 'Chat IA',
    'nav.courses': 'Cours',
    'nav.saved': 'Sauvegardés',
    'nav.calendar': 'Calendrier',
    'nav.forum': 'Forum',
    'nav.profile': 'Profil',

    // ── Sidebar Footer / Popup ────────────────────────────
    'sidebar.settings': 'Paramètres',
    'sidebar.changeLanguage': 'Changer la langue',
    'sidebar.colorTheme': 'Thème de couleur',
    'sidebar.logOut': 'Déconnexion',
    'sidebar.signOut': 'Déconnexion',

    // ── Settings Section Titles ───────────────────────────
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Personnalisez votre expérience McGill Advisor',
    'settings.appearance': 'Apparence',
    'settings.notifications': 'Notifications',
    'settings.privacyData': 'Confidentialité et données',
    'settings.preferences': 'Préférences',

    // ── Settings Labels ───────────────────────────────────
    'settings.theme': 'Thème',
    'settings.themeDescription': 'Choisissez votre palette de couleurs préférée',
    'settings.light': 'Clair',
    'settings.dark': 'Sombre',
    'settings.auto': 'Auto',
    'settings.emailNotifications': 'Notifications par courriel',
    'settings.emailNotificationsDesc': 'Recevoir des mises à jour par courriel',
    'settings.deadlineReminders': 'Rappels d\'échéance',
    'settings.deadlineRemindersDesc': 'Être notifié des échéances à venir',
    'settings.courseUpdates': 'Mises à jour des cours',
    'settings.courseUpdatesDesc': 'Notifications sur les changements de cours',
    'settings.profileVisibility': 'Visibilité du profil',
    'settings.profileVisibilityDesc': 'Qui peut voir votre profil',
    'settings.private': 'Privé',
    'settings.friendsOnly': 'Amis seulement',
    'settings.public': 'Public',
    'settings.shareProgress': 'Partager le progrès académique',
    'settings.shareProgressDesc': 'Permettre aux autres de voir votre progrès',
    'settings.language': 'Langue',
    'settings.languageDesc': 'Langue de l\'interface',
    'settings.timezone': 'Fuseau horaire',
    'settings.timezoneDesc': 'Votre fuseau horaire local',
    'settings.exportData': 'Exporter les données',
    'settings.exportYourData': 'Exporter vos données',
    'settings.exportDataDesc': 'Télécharger toutes vos données en JSON',
    'settings.exportModalText': 'Cela téléchargera toutes vos données de profil, cours et paramètres sous forme de fichier JSON. Vous pouvez l\'utiliser pour la sauvegarde ou le transfert de données.',
    'settings.downloadJson': 'Télécharger JSON',
    'settings.dataExported': 'Données exportées avec succès !',

    // ── Profile Labels ────────────────────────────────────
    'profile.personalInfo': 'Informations personnelles',
    'profile.manageDetails': 'Gérer les détails de votre profil',
    'profile.username': 'Nom d\'utilisateur',
    'profile.email': 'Adresse courriel',
    'profile.faculty': 'Faculté',
    'profile.major': 'Majeure principale',
    'profile.additionalMajors': 'Majeures supplémentaires',
    'profile.minor': 'Mineure',
    'profile.primaryMinor': 'Mineure principale',
    'profile.additionalMinors': 'Mineures supplémentaires',
    'profile.concentration': 'Concentration',
    'profile.year': 'Année académique',
    'profile.gpa': 'MPC',
    'profile.currentGpa': 'MPC actuelle',
    'profile.editProfile': 'Modifier le profil',
    'profile.save': 'Enregistrer',
    'profile.cancel': 'Annuler',
    'profile.changePhoto': 'Changer la photo',
    'profile.notSpecified': 'Non spécifié',
    'profile.notSet': 'Non défini',
    'profile.completeness': 'Complétude du profil',
    'profile.academicInfo': 'Informations académiques',
    'profile.contactInfo': 'Coordonnées',
    'profile.additionalInfo': 'Informations supplémentaires',
    'profile.academicInterests': 'Intérêts académiques',
    'profile.noInterests': 'Aucun intérêt ajouté. Ajoutez vos intérêts académiques pour obtenir des recommandations personnalisées !',

    // ── Profile Tab Sections ──────────────────────────────
    'profile.academicPerformance': 'Performance académique',
    'profile.gpaTip': 'Gardez votre MPC à jour pour de meilleures recommandations de cours',
    'profile.degreeProgress': 'Progrès du diplôme',
    'profile.interestsPreferences': 'Intérêts et préférences',
    'profile.achievements': 'Réalisations',
    'profile.personalizedInsights': 'Recommandations personnalisées',
    'profile.signOutTitle': 'Déconnexion',
    'profile.signOutDescription': 'Se déconnecter de votre compte McGill AI Advisor',

    // ── Profile Form ──────────────────────────────────────
    'profileForm.basicInfo': 'Informations de base',
    'profileForm.enterUsername': 'Entrer le nom d\'utilisateur',
    'profileForm.optional': 'Facultatif',
    'profileForm.displayName': 'Votre nom d\'affichage',
    'profileForm.academicInfo': 'Informations académiques',
    'profileForm.academicInfoDesc': 'Votre faculté, programme et année d\'études',
    'profileForm.selectFaculty': 'Sélectionnez votre faculté',
    'profileForm.selectYear': 'Sélectionnez l\'année',
    'profileForm.selectMajor': 'Sélectionnez votre majeure',
    'profileForm.selectMinor': 'Sélectionnez une mineure (facultatif)',

    // ── Common ────────────────────────────────────────────
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.saveChanges': 'Sauvegarder les modifications',
    'common.delete': 'Supprimer',
    'common.confirm': 'Confirmer',
    'common.areYouSure': 'Êtes-vous sûr ?',
    'common.cancel': 'Annuler',
    'common.english': 'English',
    'common.french': 'Français',
    'common.user': 'Utilisateur',
    'common.na': 'N/D',
    'common.reloadPage': 'Recharger la page',

    // ── Chat ──────────────────────────────────────────────
    'chat.placeholder': 'Posez-moi n\'importe quelle question sur les cours, la planification ou les études à McGill...',
    'chat.send': 'Envoyer',
    'chat.sending': 'Envoi...',
    'chat.newChat': 'Nouveau chat',
    'chat.chatSession': 'Session de chat',
    'chat.chatHistory': 'Historique des chats',
    'chat.noPreviousChats': 'Aucun chat précédent',
    'chat.loadingHistory': 'Chargement de l\'historique...',
    'chat.failedToSend': 'Échec de l\'envoi du message. Veuillez réessayer.',
    'chat.failedToLoad': 'Échec du chargement de l\'historique',
    'chat.dropFiles': 'Déposez les fichiers ici pour les joindre',
    'chat.dropFilesSubtext': 'PDF, Images, Fichiers texte (max 32 Mo)',

    // ── Courses ───────────────────────────────────────────
    'courses.searchPlaceholder': 'Rechercher des cours (ex. COMP 202, Introduction à la programmation)...',
    'courses.searching': 'Recherche...',
    'courses.filters': 'Filtres',
    'courses.sortBy': 'Trier par :',
    'courses.relevance': 'Pertinence',
    'courses.addToSaved': 'Ajouter aux favoris',
    'courses.removeFromSaved': 'Retirer des favoris',
    'courses.markCompleted': 'Marquer comme complété',
    'courses.markNotCompleted': 'Marquer comme non complété',
    'courses.courseDetails': 'Détails du cours',
    'courses.prerequisites': 'Prérequis',
    'courses.credits': 'Crédits',
    'courses.sections': 'Sections',
    'courses.instructor': 'Professeur',
    'courses.rating': 'Évaluation',
    'courses.difficulty': 'Difficulté',
    'courses.reviews': 'Avis',
    'courses.wouldRetake': 'Reprendrait',
    'courses.loadingDetails': 'Chargement des détails du cours...',
    'courses.noResults': 'Aucun cours trouvé correspondant à votre recherche.',
    'courses.failedSearch': 'Échec de la recherche de cours. Veuillez réessayer.',
    'courses.failedDetails': 'Échec du chargement des détails du cours.',
    'courses.explorerTitle': 'Explorateur de cours avec évaluations des professeurs',
    'courses.explorerDesc': 'Recherchez parmi les cours de McGill avec des données historiques de notes et des évaluations RateMyProfessor en direct.',
    'courses.failedUpdate': 'Échec de la mise à jour des favoris',
    'courses.failedCompleted': 'Échec de la mise à jour des cours complétés',
    'courses.failedMarkCompleted': 'Échec du marquage du cours comme complété',

    // ── Calendar ──────────────────────────────────────────
    'calendar.today': 'Aujourd\'hui',
    'calendar.month': 'Mois',
    'calendar.week': 'Semaine',
    'calendar.day': 'Jour',
    'calendar.addEvent': 'Ajouter un événement',

    // ── Saved Courses ─────────────────────────────────────
    'saved.savedCourses': 'Cours sauvegardés',
    'saved.completed': 'Complétés',
    'saved.noSavedCourses': 'Aucun cours sauvegardé',
    'saved.noSavedCoursesDesc': 'Sauvegardez des cours depuis l\'explorateur pour les voir ici',
    'saved.noCompletedCourses': 'Aucun cours complété',
    'saved.noCompletedCoursesDesc': 'Marquez des cours comme complétés pour suivre votre progrès',

    // ── Degree Progress ───────────────────────────────────
    'degree.completion': 'Avancement du diplôme',
    'degree.completedCourses': 'Cours complétés',
    'degree.advancedStanding': 'Équivalences',
    'degree.totalEarned': 'Total obtenu',
    'degree.remaining': 'Restant',
    'degree.creditsHeadStart': 'Vos {count} crédits AP/IB/transfert vous donnent une longueur d\'avance !',

    // ── GPA & Calculator ──────────────────────────────────
    'gpa.trendTitle': 'Tendance de la MPC cumulative',
    'gpa.semester': 'Sem',
    'gpa.calculatorSubtitle': 'Calculez ce dont vous avez besoin pour atteindre votre objectif',
    'gpa.currentGpa': 'MPC actuelle',
    'gpa.creditsCompleted': 'Crédits complétés',
    'gpa.creditsRemaining': 'Crédits restants',
    'gpa.targetGpa': 'MPC cible',
    'gpa.requiredGpa': 'MPC requise pour les cours restants',
    'gpa.equivalentGrade': 'Équivalent à maintenir environ :',
    'gpa.notAchievable': 'Objectif non atteignable',

    // ── Mark Complete Modal ───────────────────────────────
    'modal.markComplete': 'Marquer le cours comme complété',
    'modal.term': 'Trimestre',
    'modal.year': 'Année',
    'modal.grade': 'Note (facultatif)',
    'modal.notSpecified': 'Non spécifié',
    'modal.fall': 'Automne',
    'modal.winter': 'Hiver',
    'modal.summer': 'Été',

    // ── Achievements & Insights ───────────────────────────
    'achievements.title': 'Réalisations',
    'insights.title': 'Recommandations personnalisées',
    'insights.subtitle': 'Recommandations basées sur votre profil et activité',
    'insights.completeProfile': 'Complétez votre profil et interagissez avec le conseiller IA pour obtenir des recommandations personnalisées !',

    // ── Course Timeline ───────────────────────────────────
    'timeline.noCourses': 'Aucun cours complété. Marquez des cours comme suivis dans l\'onglet Sauvegardés !',

    // ── Forum ─────────────────────────────────────────────
    'forum.comingSoon': 'Bientôt disponible',
    'forum.title': 'Forum communautaire McGill',
    'forum.launchDate': 'Lancement printemps 2026',
    'forum.whatsComingTitle': 'Ce qui s\'en vient',
    'forum.sneakPeek': 'Aperçu',
    'forum.sneakPeekSubtitle': 'Voici à quoi ressemblera le forum',
    'forum.recentDiscussions': 'Discussions récentes',
    'forum.beAmongFirst': 'Soyez parmi les premiers',
    'forum.joinWaitlist': 'Inscrivez-vous à la liste d\'attente pour un accès anticipé et aidez à façonner la communauté',

    // ── Auth / Login ──────────────────────────────────────
    'auth.aiAdvisor': 'Conseiller académique IA',
    'auth.aiRecommendations': 'Recommandations alimentées par l\'IA',
    'auth.historicalData': 'Données historiques de notes',
    'auth.coursePlanning': 'Planification de cours personnalisée',
    'auth.username': 'Nom d\'utilisateur',
    'auth.email': 'Adresse courriel',
    'auth.password': 'Mot de passe',

    // ── Errors ────────────────────────────────────────────
    'error.authInitFailed': 'Impossible d\'initialiser l\'authentification',
    'error.refreshPage': 'Veuillez rafraîchir la page ou vérifier votre connexion Internet.',
    'error.profileSetupIssue': 'Problème de configuration du profil',
    'error.profileSetupDesc': 'Un problème est survenu lors de la configuration de votre profil. Veuillez vous déconnecter et réessayer.',
    'error.sessionSetup': 'Configuration de votre session...',
    'error.loadingProfile': 'Chargement de votre profil...',

    // ── Sign Out Confirmation ─────────────────────────────
    'signOut.confirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
    'signOut.button': 'Déconnexion',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem('language')
    return stored === 'fr' ? 'fr' : 'en'
  })

  const setLanguage = useCallback((lang) => {
    const valid = lang === 'fr' ? 'fr' : 'en'
    setLanguageState(valid)
    localStorage.setItem('language', valid)
  }, [])

  const t = useCallback((key) => {
    return translations[language]?.[key] ?? translations.en?.[key] ?? key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
