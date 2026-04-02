/**
 * Game of Meditation — Day One translations
 * Languages: en, hi, es, ar, fr, pt, zh, ja, sw
 *
 * Keys cover the most user-visible strings across all screens.
 * Onboarding is intentionally left in English (it's a one-time flow
 * where the user is still choosing their language).
 */

export interface Strings {
  // App identity
  appTitle: string
  tagline: string

  // Home
  ctaFirst: string       // first-time CTA
  ctaMeditate: string    // returning user CTA
  yourJourney: string
  dayStreak: string
  sessions: string
  minutes: string

  // Timer
  timerIdle: string
  timerRunning: string
  timerPaused: string
  begin: string
  pause: string
  resume: string
  complete: string
  end: string
  back: string
  goalReached: string
  remaining: string      // e.g. "5 min remaining" — append the time yourself

  // Session complete
  meditateAgain: string
  returnHome: string
  mindStability: string

  // History
  today: string
  yesterday: string
  totalMss: string

  // Common
  daysAgo: string        // "{n} days ago" — replace {n} with the number
}

const translations: Record<string, Strings> = {
  en: {
    appTitle:      'Game of\nMeditation',
    tagline:       'Conquer Yourself.\nOne Breath At A Time.',
    ctaFirst:      "Let's Play",
    ctaMeditate:   'Meditate',
    yourJourney:   'Your Journey',
    dayStreak:     'Day streak',
    sessions:      'Sessions',
    minutes:       'Minutes',
    timerIdle:     "Whenever you're ready",
    timerRunning:  'Breathe',
    timerPaused:   'Resting',
    begin:         'Begin',
    pause:         'Pause',
    resume:        'Resume',
    complete:      'Complete',
    end:           'End',
    back:          'Back',
    goalReached:   '✦ Goal reached — keep going or complete',
    remaining:     'remaining',
    meditateAgain: 'Meditate again',
    returnHome:    'Return home',
    mindStability: 'Mind Stability',
    today:         'Today',
    yesterday:     'Yesterday',
    totalMss:      'Total MSS',
    daysAgo:       '{n} days ago',
  },

  hi: {
    appTitle:      'ध्यान का\nखेल',
    tagline:       'खुद को जीतो।\nएक सांस में।',
    ctaFirst:      'खेलते हैं',
    ctaMeditate:   'ध्यान करें',
    yourJourney:   'आपकी यात्रा',
    dayStreak:     'दिन की लय',
    sessions:      'सत्र',
    minutes:       'मिनट',
    timerIdle:     'जब आप तैयार हों',
    timerRunning:  'सांस लें',
    timerPaused:   'विराम',
    begin:         'शुरू करें',
    pause:         'रुकें',
    resume:        'जारी रखें',
    complete:      'पूर्ण करें',
    end:           'समाप्त',
    back:          'वापस',
    goalReached:   '✦ लक्ष्य पूरा — जारी रखें या समाप्त करें',
    remaining:     'शेष',
    meditateAgain: 'फिर ध्यान करें',
    returnHome:    'घर जाएं',
    mindStability: 'मन की स्थिरता',
    today:         'आज',
    yesterday:     'कल',
    totalMss:      'कुल MSS',
    daysAgo:       '{n} दिन पहले',
  },

  es: {
    appTitle:      'Juego de\nMeditación',
    tagline:       'Conquístate.\nUna respiración a la vez.',
    ctaFirst:      'Juguemos',
    ctaMeditate:   'Meditar',
    yourJourney:   'Tu viaje',
    dayStreak:     'Racha de días',
    sessions:      'Sesiones',
    minutes:       'Minutos',
    timerIdle:     'Cuando estés listo',
    timerRunning:  'Respira',
    timerPaused:   'Descansando',
    begin:         'Comenzar',
    pause:         'Pausar',
    resume:        'Continuar',
    complete:      'Completar',
    end:           'Terminar',
    back:          'Atrás',
    goalReached:   '✦ Meta alcanzada — sigue o termina',
    remaining:     'restante',
    meditateAgain: 'Meditar de nuevo',
    returnHome:    'Volver al inicio',
    mindStability: 'Estabilidad mental',
    today:         'Hoy',
    yesterday:     'Ayer',
    totalMss:      'MSS total',
    daysAgo:       'Hace {n} días',
  },

  ar: {
    appTitle:      'لعبة\nالتأمل',
    tagline:       'انتصر على نفسك.\nنفسًا واحدًا في كل مرة.',
    ctaFirst:      'هيا نلعب',
    ctaMeditate:   'تأمّل',
    yourJourney:   'رحلتك',
    dayStreak:     'أيام متتالية',
    sessions:      'جلسات',
    minutes:       'دقائق',
    timerIdle:     'حين تكون مستعدًا',
    timerRunning:  'تنفّس',
    timerPaused:   'راحة',
    begin:         'ابدأ',
    pause:         'توقف',
    resume:        'استمر',
    complete:      'أكمل',
    end:           'انهِ',
    back:          'رجوع',
    goalReached:   '✦ تحقّق الهدف — واصل أو أنهِ',
    remaining:     'متبقٍّ',
    meditateAgain: 'تأمّل مجددًا',
    returnHome:    'العودة للرئيسية',
    mindStability: 'استقرار الذهن',
    today:         'اليوم',
    yesterday:     'أمس',
    totalMss:      'إجمالي MSS',
    daysAgo:       'منذ {n} أيام',
  },

  fr: {
    appTitle:      'Jeu de\nMéditation',
    tagline:       'Conquiers-toi.\nUne respiration à la fois.',
    ctaFirst:      'Jouons',
    ctaMeditate:   'Méditer',
    yourJourney:   'Ton chemin',
    dayStreak:     'Jours consécutifs',
    sessions:      'Séances',
    minutes:       'Minutes',
    timerIdle:     'Quand tu es prêt',
    timerRunning:  'Respire',
    timerPaused:   'Repos',
    begin:         'Commencer',
    pause:         'Pause',
    resume:        'Reprendre',
    complete:      'Terminer',
    end:           'Fin',
    back:          'Retour',
    goalReached:   '✦ Objectif atteint — continue ou termine',
    remaining:     'restant',
    meditateAgain: 'Méditer à nouveau',
    returnHome:    "Retour à l'accueil",
    mindStability: 'Stabilité mentale',
    today:         "Aujourd'hui",
    yesterday:     'Hier',
    totalMss:      'MSS total',
    daysAgo:       'Il y a {n} jours',
  },

  pt: {
    appTitle:      'Jogo de\nMeditação',
    tagline:       'Conquiste-se.\nUma respiração de cada vez.',
    ctaFirst:      'Vamos jogar',
    ctaMeditate:   'Meditar',
    yourJourney:   'Sua jornada',
    dayStreak:     'Dias seguidos',
    sessions:      'Sessões',
    minutes:       'Minutos',
    timerIdle:     'Quando estiver pronto',
    timerRunning:  'Respire',
    timerPaused:   'Descansando',
    begin:         'Começar',
    pause:         'Pausar',
    resume:        'Continuar',
    complete:      'Concluir',
    end:           'Encerrar',
    back:          'Voltar',
    goalReached:   '✦ Meta atingida — continue ou conclua',
    remaining:     'restante',
    meditateAgain: 'Meditar novamente',
    returnHome:    'Voltar ao início',
    mindStability: 'Estabilidade mental',
    today:         'Hoje',
    yesterday:     'Ontem',
    totalMss:      'MSS total',
    daysAgo:       'Há {n} dias',
  },

  zh: {
    appTitle:      '冥想\n游戏',
    tagline:       '征服自己。\n一次一个呼吸。',
    ctaFirst:      '开始游戏',
    ctaMeditate:   '冥想',
    yourJourney:   '你的旅程',
    dayStreak:     '连续天数',
    sessions:      '次',
    minutes:       '分钟',
    timerIdle:     '准备好了就开始',
    timerRunning:  '呼吸',
    timerPaused:   '休息中',
    begin:         '开始',
    pause:         '暂停',
    resume:        '继续',
    complete:      '完成',
    end:           '结束',
    back:          '返回',
    goalReached:   '✦ 目标达成 — 继续或完成',
    remaining:     '剩余',
    meditateAgain: '再次冥想',
    returnHome:    '返回首页',
    mindStability: '心理稳定度',
    today:         '今天',
    yesterday:     '昨天',
    totalMss:      '总 MSS',
    daysAgo:       '{n} 天前',
  },

  ja: {
    appTitle:      '瞑想の\nゲーム',
    tagline:       '自分に勝て。\n一呼吸ずつ。',
    ctaFirst:      '始めよう',
    ctaMeditate:   '瞑想する',
    yourJourney:   'あなたの旅',
    dayStreak:     '連続日数',
    sessions:      'セッション',
    minutes:       '分',
    timerIdle:     '準備ができたら',
    timerRunning:  '呼吸して',
    timerPaused:   '休憩中',
    begin:         '開始',
    pause:         '一時停止',
    resume:        '再開',
    complete:      '完了',
    end:           '終了',
    back:          '戻る',
    goalReached:   '✦ 目標達成 — 続けるか完了してください',
    remaining:     '残り',
    meditateAgain: 'もう一度瞑想',
    returnHome:    'ホームへ戻る',
    mindStability: '心の安定度',
    today:         '今日',
    yesterday:     '昨日',
    totalMss:      '合計 MSS',
    daysAgo:       '{n} 日前',
  },

  sw: {
    appTitle:      'Mchezo wa\nKutafakari',
    tagline:       'Jishinde mwenyewe.\nPumzi moja kwa wakati mmoja.',
    ctaFirst:      'Tucheze',
    ctaMeditate:   'Tafakari',
    yourJourney:   'Safari yako',
    dayStreak:     'Siku mfululizo',
    sessions:      'Vikao',
    minutes:       'Dakika',
    timerIdle:     'Unapokuwa tayari',
    timerRunning:  'Pumua',
    timerPaused:   'Kupumzika',
    begin:         'Anza',
    pause:         'Simama',
    resume:        'Endelea',
    complete:      'Maliza',
    end:           'Komesha',
    back:          'Rudi',
    goalReached:   '✦ Lengo limefikiwa — endelea au maliza',
    remaining:     'iliyobaki',
    meditateAgain: 'Tafakari tena',
    returnHome:    'Rudi nyumbani',
    mindStability: 'Utulivu wa Akili',
    today:         'Leo',
    yesterday:     'Jana',
    totalMss:      'MSS jumla',
    daysAgo:       'Siku {n} zilizopita',
  },
}

export function getStrings(languageCode: string): Strings {
  return translations[languageCode] ?? translations['en']
}
