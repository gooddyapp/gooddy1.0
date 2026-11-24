import type { CyclePhase } from "@/types";

export interface PhaseContent {
  phase: CyclePhase;
  name: string;
  short: string;
  hormones: string;
  energy: string;
  mood: string;
  social: string;
  performance: string;
  activities: string[];
  selfCare: string[];
  physicalSymptoms: string[];
  emotional: string[];
  recommendations: string[];
  selfCareCategories: Record<string, string[]>;
  nutrition: {
    nutrients: string[];
    foods: string[];
    hydration: string;
    note: string;
  };
  movement: {
    general: string;
    types: string[];
    intensity: string;
    recovery: string;
  };
  hormonesDetail: {
    estrogen: { pattern: string; role: string; associations: string };
    progesterone: { pattern: string; effects: string };
    lh: { pattern: string; role: string };
    testosterone: { pattern: string; associations: string };
  };
  bodyNeeds: {
    nutrition: string[];
    exercise: string[];
    rest: string[];
    hydration: string[];
    wellbeing: string[];
  };
}

export const PHASE_CONTENT: Record<CyclePhase, PhaseContent> = {
  menstrual: {
    phase: "menstrual",
    name: "Menstrual",
    short: "Your period is here. Energy often dips — rest is productive.",
    hormones: "Estrogen and progesterone are at their lowest.",
    energy: "Often lower. Gentle pacing beats forcing intensity.",
    mood: "Inward, reflective, or more sensitive for some people.",
    social: "Smaller plans can feel better than big social calendars.",
    performance: "Strength may feel lower; mobility and walking still count.",
    activities: ["Gentle yoga", "Walking", "Stretching", "Light mobility"],
    selfCare: ["Warmth", "Extra sleep", "Hydration", "Softer food textures if appetite shifts"],
    physicalSymptoms: ["Cramps", "Fatigue", "Lower back ache", "Bloating"],
    emotional: ["Quiet", "Sensitive", "Need for comfort"],
    recommendations: [
      "Prioritize sleep and warmth.",
      "Keep movement optional and gentle.",
      "Eat regularly even if appetite is odd.",
    ],
    selfCareCategories: {
      Social: ["One-to-one time", "Cancel freely if you need to"],
      Physical: ["Walk", "Restore yoga", "Stretch"],
      Work: ["Protect focus blocks", "Shrink the to-do list"],
      Rest: ["Naps if you can", "Earlier bedtime"],
      Relaxation: ["Heat pack", "Bath", "Soft music"],
      Emotional: ["Journal", "Ask for help"],
      "Self-care": ["Comfort clothes", "Iron-rich meals if they suit you"],
    },
    nutrition: {
      nutrients: ["Iron", "Vitamin C", "Magnesium", "Omega-3", "Fiber", "Protein"],
      foods: ["Leafy greens", "Lentils", "Citrus", "Salmon", "Dark chocolate", "Bananas"],
      hydration: "Warm fluids and steady water intake can help with comfort.",
      note: "Food ideas are educational, not medical requirements.",
    },
    movement: {
      general: "Favor restorative movement. Skip intensity if cramps or fatigue are loud.",
      types: ["Walking", "Yoga", "Pilates", "Stretching", "Swimming (gentle)"],
      intensity: "Light",
      recovery: "Heat, rest, and hydration matter more than PRs this week.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "Typically low during menstruation.",
        role: "Supports many tissues and often rises again after your period.",
        associations: "Lower estrogen can coincide with lower energy for some people.",
      },
      progesterone: {
        pattern: "Typically low.",
        effects: "With both ovarian hormones low, sleep and mood can feel different.",
      },
      lh: {
        pattern: "Not surging.",
        role: "LH rises later in the cycle around ovulation.",
      },
      testosterone: {
        pattern: "Often relatively lower early in the cycle.",
        associations: "Libido and drive may feel quieter — patterns vary widely.",
      },
    },
    bodyNeeds: {
      nutrition: ["Iron-supporting meals", "Easy proteins", "Comforting carbs if desired"],
      exercise: ["Gentle walks", "Mobility", "Skip forced HIIT"],
      rest: ["Extra sleep", "Slower mornings"],
      hydration: ["Warm drinks", "Steady water"],
      wellbeing: ["Soft plans", "Permission to rest"],
    },
  },
  follicular: {
    phase: "follicular",
    name: "Follicular",
    short: "Rising energy for many people. A good window for new plans.",
    hormones: "Estrogen generally rises as follicles develop.",
    energy: "Often climbing — curiosity and motivation may return.",
    mood: "Brighter, more outward for many.",
    social: "Good time to reconnect or try something new.",
    performance: "Strength and skill work often feel more available.",
    activities: ["Strength training", "Skill practice", "Running", "Group classes"],
    selfCare: ["Morning light", "New recipes", "Learning something"],
    physicalSymptoms: ["Increasing energy", "Clearer skin for some"],
    emotional: ["Curious", "Optimistic", "Social"],
    recommendations: [
      "Use rising energy for projects you care about.",
      "Build habits now while motivation is friendlier.",
      "Keep protein steady as training ramps.",
    ],
    selfCareCategories: {
      Social: ["Plans with friends", "Networking that feels light"],
      Physical: ["Strength", "Running", "Dance"],
      Work: ["Creative work", "Starting projects"],
      Rest: ["Still protect sleep"],
      Relaxation: ["Outdoor time"],
      Emotional: ["Journal goals", "Gratitude"],
      "Self-care": ["Try a new class", "Fresh produce"],
    },
    nutrition: {
      nutrients: ["Protein", "Complex carbs", "B vitamins", "Fiber", "Antioxidants"],
      foods: ["Eggs", "Quinoa", "Berries", "Leafy greens", "Yogurt", "Nuts"],
      hydration: "Match fluids to rising activity.",
      note: "Suggestions support general wellness, not prescribed diets.",
    },
    movement: {
      general: "A natural window to rebuild intensity if you feel good.",
      types: ["Strength training", "Running", "HIIT (if you enjoy it)", "Group fitness"],
      intensity: "Moderate to challenging, based on how you feel",
      recovery: "Keep at least one easier day.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "Typically rising.",
        role: "Supports bone, brain, and reproductive tissues among other roles.",
        associations: "Rising estrogen often lines up with better mood and energy for many.",
      },
      progesterone: {
        pattern: "Still relatively low before ovulation.",
        effects: "Progesterone rises more after ovulation.",
      },
      lh: {
        pattern: "Building toward a mid-cycle surge.",
        role: "The LH surge helps trigger ovulation.",
      },
      testosterone: {
        pattern: "May rise toward ovulation.",
        associations: "Some people notice more drive or libido later in this phase.",
      },
    },
    bodyNeeds: {
      nutrition: ["Protein at meals", "Colorful plants", "Steady carbs around training"],
      exercise: ["Progressive strength", "Skill work"],
      rest: ["Quality sleep to support training"],
      hydration: ["Water around workouts"],
      wellbeing: ["Use energy for meaningful plans"],
    },
  },
  ovulation: {
    phase: "ovulation",
    name: "Ovulation",
    short: "Peak week for many. Energy and social battery can feel high.",
    hormones: "Estrogen peaks; LH surges; testosterone may rise briefly.",
    energy: "Often high — great for challenging sessions if you feel well.",
    mood: "Confident, talkative, or more outward for some.",
    social: "Peak social window for many people.",
    performance: "Power and coordination can feel sharp.",
    activities: ["HIIT", "Sprint intervals", "Strength", "Competitive sports", "Dance"],
    selfCare: ["Social time", "Challenging workouts you enjoy", "Celebration without overdoing it"],
    physicalSymptoms: ["Fertile mucus for some", "Mild ovulation twinge", "Higher libido"],
    emotional: ["Connected", "Expressive", "Energized"],
    recommendations: [
      "Make plans while energy is high.",
      "Stay hydrated if training hard.",
      "Predictions are estimates — not contraception.",
    ],
    selfCareCategories: {
      Social: ["Gatherings", "Dates", "Team activities"],
      Physical: ["HIIT", "Sports", "Heavy lifts if recovered"],
      Work: ["Presentations", "Collaboration"],
      Rest: ["Don't skip sleep chasing a peak"],
      Relaxation: ["Music", "Movement you love"],
      Emotional: ["Express yourself", "Share wins"],
      "Self-care": ["Glow-up routines you enjoy"],
    },
    nutrition: {
      nutrients: ["Antioxidants", "Fiber", "Protein", "Healthy fats", "Zinc", "Vitamin D"],
      foods: ["Berries", "Tomatoes", "Bell peppers", "Salmon", "Almonds", "Asparagus", "Leafy greens"],
      hydration: "Keep water high with social plans and harder training.",
      note: "Fertile-window estimates are educational only.",
    },
    movement: {
      general: "If energy is high and symptoms are quiet, challenging work can feel good.",
      types: ["HIIT", "Sprint intervals", "Strength", "Group fitness", "Sports"],
      intensity: "High if recovered; otherwise moderate",
      recovery: "Still plan a cool-down and protein-rich meal.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "Typically peaks just before ovulation.",
        role: "Supports the cascade that helps trigger the LH surge.",
        associations: "Peak estrogen often coincides with higher energy and social ease.",
      },
      progesterone: {
        pattern: "Begins to rise after ovulation.",
        effects: "Will shape the luteal phase more than this short window.",
      },
      lh: {
        pattern: "Surge around ovulation.",
        role: "LH helps release the egg. Timing varies and apps only estimate.",
      },
      testosterone: {
        pattern: "May peak near ovulation.",
        associations: "Libido and assertiveness can feel higher for some.",
      },
    },
    bodyNeeds: {
      nutrition: ["Antioxidant-rich plants", "Protein after hard sessions"],
      exercise: ["Hard sessions you enjoy", "Sports"],
      rest: ["Protect sleep even when social"],
      hydration: ["Extra fluids with alcohol or heat"],
      wellbeing: ["Lean into connection — and leave buffer time"],
    },
  },
  luteal: {
    phase: "luteal",
    name: "Luteal",
    short: "Settling phase. Energy may soften — that's the phase, not a personal failure.",
    hormones: "Progesterone rises then both hormones fall before the next period.",
    energy: "Often steady then lower in the late luteal phase.",
    mood: "Cozier, more sensitive, or irritable for some — especially late luteal.",
    social: "Smaller circles and earlier nights can feel kinder.",
    performance: "Strength can stay solid early; prefer technique and volume over max intensity late.",
    activities: ["Strength (moderate)", "Pilates", "Yoga", "Walking", "Swimming"],
    selfCare: ["Warm meals", "Boundaries", "Earlier wind-down", "Magnesium-rich foods if they suit you"],
    physicalSymptoms: ["Bloating", "Breast tenderness", "Cravings", "Sleep changes"],
    emotional: ["Nesting", "Sensitive", "Need for reassurance"],
    recommendations: [
      "Shrink the calendar late in the phase if you need to.",
      "Keep protein and fiber steady for satiety.",
      "Treat late-luteal irritability as information, not a character flaw.",
    ],
    selfCareCategories: {
      Social: ["Close friends", "Quiet plans"],
      Physical: ["Moderate lifts", "Yoga", "Walks"],
      Work: ["Finish tasks", "Avoid over-committing"],
      Rest: ["Earlier bedtime", "Screen limits"],
      Relaxation: ["Bath", "Reading", "Breathing"],
      Emotional: ["Journal", "Name needs"],
      "Self-care": ["Comfort food with nutrients", "Soft clothes"],
    },
    nutrition: {
      nutrients: ["Magnesium", "B vitamins", "Calcium", "Complex carbs", "Fiber", "Protein"],
      foods: ["Oats", "Pumpkin seeds", "Dark leafy greens", "Sweet potato", "Chickpeas", "Cocoa"],
      hydration: "Bloating can coexist with needing fluids — sip steadily.",
      note: "Cravings are common; balance beats restriction.",
    },
    movement: {
      general: "Keep moving, but let intensity follow energy — especially late luteal.",
      types: ["Strength (moderate)", "Pilates", "Yoga", "Walking", "Swimming"],
      intensity: "Moderate early; light-to-moderate late",
      recovery: "Stretching, heat, and sleep help more than grinding.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "Secondary rise then decline before menstruation.",
        role: "Works alongside progesterone in the second half of the cycle.",
        associations: "The late drop can coincide with PMS-like shifts for some.",
      },
      progesterone: {
        pattern: "Typically high after ovulation, then falls.",
        effects: "Can promote sleepiness; withdrawal may affect mood and sleep.",
      },
      lh: {
        pattern: "Low after the ovulatory surge.",
        role: "Not the driver of this phase.",
      },
      testosterone: {
        pattern: "Often lower than near ovulation.",
        associations: "Drive may feel quieter; rest is still productive.",
      },
    },
    bodyNeeds: {
      nutrition: ["Warm balanced meals", "Magnesium-rich foods", "Fiber for comfort"],
      exercise: ["Steady strength", "Mobility", "Walks"],
      rest: ["Earlier nights", "Lower stimulation"],
      hydration: ["Steady sips", "Herbal tea if you like"],
      wellbeing: ["Boundaries", "Softer expectations"],
    },
  },
};

const TR_PHASE: Record<CyclePhase, Partial<PhaseContent>> = {
  menstrual: {
    name: "Regl",
    short: "Reglin geldi. Östrojen düşük, o yüzden enerjin düşebilir. Yavaşlamak da tamam.",
    hormones: "Östrojen ve progesteron bu günlerde en düşük seviyededir.",
    mood: "İçe dönük, hassas ya da sadece daha yavaş. Bu sen değilsin, regl.",
    activities: ["Yavaş yoga", "Yürüyüş", "Esneme", "Hafif hareket"],
    recommendations: [
      "Uykuyu ve sıcaklığı öne al.",
      "Hareketi zorunlu tutma, nazik olsun.",
      "İştahın garip gelse de öğün atlama.",
    ],
    nutrition: {
      nutrients: ["Demir", "C vitamini", "Magnezyum", "Omega-3", "Lif", "Protein"],
      foods: ["Yeşil yapraklılar", "Mercimek", "Narenciye", "Somon", "Bitter çikolata", "Muz"],
      hydration: "Ilık içecekler ve düzenli su iyi gelir.",
      note: "Bunlar fikir, tıbbi zorunluluk değil.",
    },
    movement: {
      general: "Toparlayıcı hareket yeter. Kramp ya da yorgunluk yüksekse tempoyu düşür.",
      types: ["Yürüyüş", "Yoga", "Pilates", "Esneme", "Sakin yüzme"],
      intensity: "Hafif",
      recovery: "Sıcak, dinlenme ve su bu hafta rekor denemekten daha işe yarar.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "Reglde genelde düşük.",
        role: "Reglden sonra yeniden yükselmeye başlar.",
        associations: "Düşük östrojen bazı kişilerde daha az enerjiyle birlikte gelir.",
      },
      progesterone: { pattern: "Genelde düşük.", effects: "İki hormon da düşükken uyku ve ruh hali değişebilir." },
      lh: { pattern: "Yükseliş yok.", role: "LH yumurtlamaya doğru yükselir." },
      testosterone: {
        pattern: "Döngünün başında çoğu zaman daha düşük.",
        associations: "İstek ve tempo daha sakin olabilir. Bu kişiden kişiye değişir.",
      },
    },
    bodyNeeds: {
      nutrition: ["Demiri destekleyen öğünler", "Kolay protein", "İstersen rahat karbonhidrat"],
      exercise: ["Sakin yürüyüş", "Esneme", "Zorunlu HIIT yok"],
      rest: ["Biraz daha uyku", "Yavaş sabahlar"],
      hydration: ["Ilık içecek", "Düzenli su"],
      wellbeing: ["Hafif planlar", "Dinlenmeye izin"],
    },
  },
  follicular: {
    name: "Foliküler",
    short: "Enerji yükseliyor. Östrojen tırmanıyor, o yüzden yeni bir şey denemek bu aralıkta daha kolay gelir.",
    hormones: "Foliküller gelişirken östrojen genelde yükselir.",
    mood: "Daha açık, daha meraklı, biraz daha dışa dönük.",
    activities: ["Kuvvet antrenmanı", "Yeni bir beceri", "Koşu", "Grup dersi"],
    recommendations: [
      "Yükselen enerjiyi önemsediğin işe ayır.",
      "Motivasyon varken alışkanlığı kurmak daha kolay.",
      "Antrenman artıyorsa proteini aksatma.",
    ],
    nutrition: {
      nutrients: ["Protein", "Kompleks karbonhidrat", "B vitaminleri", "Lif", "Antioksidanlar"],
      foods: ["Yumurta", "Yulaf", "Yoğurt", "Meyve", "Tavuk", "Nohut"],
      hydration: "Hareket arttıkça suyu da artır.",
      note: "Bunlar fikir, tıbbi zorunluluk değil.",
    },
    movement: {
      general: "Kuvvet ve yeni hareketler bu aralıkta çoğu zaman daha kolay gelir.",
      types: ["Kuvvet", "Koşu", "Dans", "Bisiklet"],
      intensity: "Orta",
      recovery: "Uykuyu yine koru. Yükselen enerji dinlenmeyi gereksiz yapmaz.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "Reglden sonra yükselmeye başlar.",
        role: "Enerji, odak ve ruh halini destekleyebilir.",
        associations: "Birçok kişi bu günlerde daha meraklı hisseder.",
      },
      progesterone: { pattern: "Henüz düşük.", effects: "Asıl yükseliş yumurtlamadan sonradır." },
      lh: { pattern: "Yumurtlamaya kadar sakin.", role: "Zirve yumurtlama civarındadır." },
      testosterone: {
        pattern: "Yavaşça artabilir.",
        associations: "Odak ve istek biraz daha açık hissedilebilir.",
      },
    },
    bodyNeeds: {
      nutrition: ["Düzenli protein", "Meyve ve tam tahıl", "Renkli tabaklar"],
      exercise: ["Kuvvet", "Yeni bir antrenman", "Dışarıda yürüyüş"],
      rest: ["Uykuyu koru"],
      hydration: ["Hareketle birlikte su"],
      wellbeing: ["Yeni bir plan", "Küçük bir başlangıç"],
    },
  },
  ovulation: {
    name: "Yumurtlama",
    short: "Zirve haftası. Östrojen tepede, o yüzden enerjin yüksekse plan yapmak için iyi bir gün.",
    hormones: "Östrojen zirveye yakındır, LH kısa bir yükseliş yapar.",
    mood: "Daha sosyal, daha kendinden emin. Başrol sende gibi hissedilebilir.",
    activities: ["Zor antrenman", "Arkadaş planı", "Konuşma gerektiren iş"],
    recommendations: [
      "Enerjin varsa büyük planı bu günlere koy.",
      "Yine de uykuyu pazarlık konusu yapma.",
      "Doğurgan pencere bir tahmindir, korunma yöntemi değildir.",
    ],
    nutrition: {
      nutrients: ["Antioksidanlar", "Lif", "Protein", "Sağlıklı yağlar", "Çinko", "D vitamini"],
      foods: ["Balık", "Yumurta", "Çilek", "Kabak çekirdeği", "Yeşillik"],
      hydration: "Suyu aksatma, özellikle antrenman gününde.",
      note: "Bunlar fikir, tıbbi zorunluluk değil.",
    },
    movement: {
      general: "Zor bir antrenman ya da uzun bir yürüyüş bu günlerde iyi oturabilir.",
      types: ["HIIT", "Kuvvet", "Takım sporu", "Dans"],
      intensity: "Orta-yüksek",
      recovery: "Zirve günü de toparlanma ister. Esnemeyi atlama.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "Zirveye yakındır.",
        role: "LH yükselişini tetiklemeye yardım eder.",
        associations: "Enerji ve sosyallik bu günlerde artabilir.",
      },
      progesterone: { pattern: "Yumurtlamadan hemen sonra yükselmeye başlar.", effects: "Asıl luteal yükseliş bundan sonradır." },
      lh: { pattern: "Kısa bir yükseliş.", role: "Yumurtlamayı başlatan sinyaldir." },
      testosterone: {
        pattern: "Birçok kişide bu aralıkta biraz daha yüksektir.",
        associations: "İstek ve özgüven artabilir. Herkeste aynı değildir.",
      },
    },
    bodyNeeds: {
      nutrition: ["Proteinli bir ana öğün", "Taze meyve", "Aşırı kısıtlama yok"],
      exercise: ["Zor antrenman, istersen", "Uzun yürüyüş"],
      rest: ["Gece uykusu hâlâ gerekli"],
      hydration: ["Antrenmanla birlikte su"],
      wellbeing: ["Sosyal plan", "Kendine güvenen bir gün"],
    },
  },
  luteal: {
    name: "Luteal",
    short: "Bu hafta enerjin daha düşük olabilir. Bu sen değilsin, luteal evre. Yumuşak ve yavaş da bir seçenek.",
    hormones: "Progesteron yükselir, regl yaklaşınca iner.",
    mood: "Daha içe dönük, daha hassas ya da daha çabuk sıkılan bir hafta olabilir.",
    activities: ["Sakin kuvvet", "Yürüyüş", "Esneme", "Erken akşam"],
    recommendations: [
      "Listeyi küçült. Her şeyi bu haftaya sıkıştırma.",
      "İştah artarsa öğünü yasaklama, doyurucu yap.",
      "Uykuyu öne çekmek çoğu zaman en iyi bakımdır.",
    ],
    nutrition: {
      nutrients: ["Magnezyum", "B vitaminleri", "Kalsiyum", "Kompleks karbonhidrat", "Lif", "Protein"],
      foods: ["Tatlı patates", "Yoğurt", "Badem", "Yulaf", "Mercimek", "Muz"],
      hydration: "Küçük yudumlar ve istersen bitki çayı.",
      note: "Bunlar fikir, tıbbi zorunluluk değil.",
    },
    movement: {
      general: "Tempolu ama zorlamayan hareket daha iyi oturur. Geç lutealde yavaşla.",
      types: ["Kuvvet", "Yürüyüş", "Yoga", "Pilates"],
      intensity: "Başta orta, sonda hafif",
      recovery: "Esneme, sıcak ve uyku, zorlamaktan daha çok işe yarar.",
    },
    hormonesDetail: {
      estrogen: {
        pattern: "İkinci bir yükseliş, regl yaklaşınca düşüş.",
        role: "Progesteronla birlikte döngünün ikinci yarısını taşır.",
        associations: "Geç düşüş bazı kişilerde regl öncesi değişimle birlikte gelir.",
      },
      progesterone: { pattern: "Yumurtlamadan sonra yükselir, sonra düşer.", effects: "Uyku hali yapabilir. Düşüşü ruh halini etkileyebilir." },
      lh: { pattern: "Yumurtlama yükselişinden sonra düşük.", role: "Bu evrenin asıl hormonu değildir." },
      testosterone: {
        pattern: "Yumurtlama civarından daha düşük olabilir.",
        associations: "Tempo daha sakin hissedilebilir. Dinlenmek de üretkendir.",
      },
    },
    bodyNeeds: {
      nutrition: ["Sıcak ve doyurucu öğün", "Magnezyumlu yiyecekler", "Rahatlık için lif"],
      exercise: ["Dengeli kuvvet", "Esneme", "Yürüyüş"],
      rest: ["Daha erken gece", "Daha az uyaran"],
      hydration: ["Düzenli yudum", "İstersen bitki çayı"],
      wellbeing: ["Sınır koymak", "Beklentiyi biraz düşürmek"],
    },
  },
};

const ES_PHASE: Record<CyclePhase, Partial<PhaseContent>> = {
  menstrual: {
    name: "Menstrual",
    short: "Llegó el período. La energía puede bajar, y bajar el ritmo también está bien.",
    hormones: "Estrógeno y progesterona suelen estar en su punto más bajo.",
    mood: "Más hacia adentro, sensible o simplemente más lenta. Es de esta fase.",
    activities: ["Yoga suave", "Caminar", "Estirar", "Movimiento liviano"],
    recommendations: ["Priorizá el sueño y el calor.", "Que el movimiento sea suave.", "No te saltees comidas."],
    nutrition: { nutrients: ["Hierro", "Vitamina C", "Magnesio", "Omega-3", "Fibra", "Proteína"], foods: ["Hojas verdes", "Lentejas", "Cítricos", "Salmón", "Chocolate negro", "Plátanos"], hydration: "Bebidas tibias y agua a lo largo del día.", note: "Son ideas, no una indicación médica." },
    movement: { general: "Mejor un movimiento que restaure. Si hay cólicos o mucho cansancio, bajá la intensidad.", types: ["Caminata", "Yoga", "Pilates", "Estiramiento", "Nado suave"], intensity: "Baja", recovery: "El calor, el descanso y el agua importan más que un récord esta semana." },
    hormonesDetail: {
      estrogen: { pattern: "Suele estar en un punto bajo.", role: "Vuelve a subir después del período.", associations: "La energía puede sentirse más baja." },
      progesterone: { pattern: "También baja.", effects: "Se queda baja estos días." },
      lh: { pattern: "Baja.", role: "No es el momento del pico." },
      testosterone: { pattern: "Baja.", associations: "Sube un poco después." },
    },
    bodyNeeds: { nutrition: ["Comidas tibias"], exercise: ["Movimiento suave"], rest: ["Más sueño"], hydration: ["Agua y algo tibio"], wellbeing: ["Menos exigencia"] },
  },
  follicular: {
    name: "Folicular",
    short: "La energía empieza a volver. Buen momento para probar cosas nuevas.",
    hormones: "El estrógeno va subiendo.",
    mood: "Más curiosidad y un poco más de liviandad.",
    activities: ["Fuerza", "Cardio que te guste", "Planes afuera"],
    recommendations: ["Aprovechá las ganas.", "Probá un desafío chico.", "Comé para sostener la energía."],
    nutrition: { nutrients: ["Proteína", "Carbohidratos complejos", "Vitaminas B", "Fibra", "Antioxidantes"], foods: ["Huevos", "Quinoa", "Frutos rojos", "Hojas verdes", "Yogur", "Frutos secos"], hydration: "Agua constante.", note: "Son ideas, no una indicación médica." },
    movement: { general: "Es una ventana linda para subir la intensidad, si te sentís bien.", types: ["Fuerza", "Correr", "HIIT (si te gusta)", "Clases grupales"], intensity: "Media a exigente, según cómo te sientas", recovery: "Dejá al menos un día más suave." },
    hormonesDetail: {
      estrogen: { pattern: "Va subiendo.", role: "Acompaña el ánimo y la energía.", associations: "Podés sentirte más despierta." },
      progesterone: { pattern: "Sigue baja.", effects: "Todavía no es su momento." },
      lh: { pattern: "Estable, todavía sin pico.", role: "El pico llega cerca de la ovulación." },
      testosterone: { pattern: "Empieza a subir.", associations: "Puede sumar motivación." },
    },
    bodyNeeds: { nutrition: ["Comidas que den energía"], exercise: ["Algo que te desafíe"], rest: ["Sueño parejo"], hydration: ["Agua"], wellbeing: ["Espacio para lo nuevo"] },
  },
  ovulation: {
    name: "Ovulación",
    short: "Semana pico para muchas. La energía y las ganas de ver gente pueden estar altas.",
    hormones: "El estrógeno llega a un pico y la LH ayuda a soltar el óvulo. Es una estimación.",
    mood: "Más sociable, segura o con ganas de hacer planes.",
    activities: ["Entrenamiento fuerte", "Salidas", "Conversaciones"],
    recommendations: ["Si hay energía, usala.", "Hidratate.", "No es un test de ovulación."],
    nutrition: { nutrients: ["Antioxidantes", "Fibra", "Proteína", "Grasas saludables", "Zinc", "Vitamina D"], foods: ["Frutos rojos", "Tomates", "Pimientos", "Salmón", "Almendras", "Espárragos", "Hojas verdes"], hydration: "Más agua si hay calor o alcohol.", note: "Son ideas, no una indicación médica." },
    movement: { general: "Si la energía está alta y los síntomas están tranquilos, un entreno exigente puede sentirse bien.", types: ["HIIT", "Intervalos", "Fuerza", "Clases grupales", "Deportes"], intensity: "Alta si ya recuperaste; si no, media", recovery: "Igual dejá un enfriamiento y una comida con proteína." },
    hormonesDetail: {
      estrogen: { pattern: "Pico.", role: "Suele coincidir con más energía.", associations: "Las ganas sociales pueden subir." },
      progesterone: { pattern: "Empieza a subir después.", effects: "Prepara la segunda mitad." },
      lh: { pattern: "Pico breve.", role: "Ayuda a liberar el óvulo." },
      testosterone: { pattern: "Un pico corto.", associations: "Puede sumar impulso." },
    },
    bodyNeeds: { nutrition: ["Plantas con color"], exercise: ["Sesiones que disfrutes"], rest: ["Una noche buena"], hydration: ["Más líquidos"], wellbeing: ["Planes con gente"] },
  },
  luteal: {
    name: "Lútea",
    short: "La energía se acomoda. Las rutinas tranquilas ayudan.",
    hormones: "La progesterona sube y, si no hay embarazo, baja antes del período.",
    mood: "Más hacia adentro. El apetito y la sensibilidad pueden subir.",
    activities: ["Fuerza estable", "Caminatas", "Planes más chicos"],
    recommendations: ["Comé de verdad.", "Bajá la exigencia si hace falta.", "El sueño importa más."],
    nutrition: { nutrients: ["Magnesio", "Vitaminas B", "Calcio", "Carbohidratos complejos", "Fibra", "Proteína"], foods: ["Avena", "Semillas de calabaza", "Hojas verdes oscuras", "Boniato", "Garbanzos", "Cacao"], hydration: "Agua y, si te gusta, té de hierbas.", note: "Son ideas, no una indicación médica." },
    movement: { general: "Seguí moviéndote, pero que la intensidad siga a tu energía, sobre todo al final de esta fase.", types: ["Fuerza moderada", "Pilates", "Yoga", "Caminata", "Nado"], intensity: "Media al principio; más suave al final", recovery: "Estirar, calor y dormir ayudan más que forzarte." },
    hormonesDetail: {
      estrogen: { pattern: "Un segundo sube y después baja.", role: "Cambia a lo largo de la fase.", associations: "El ánimo puede moverse." },
      progesterone: { pattern: "Sube y después baja.", effects: "Es la hormona de esta mitad." },
      lh: { pattern: "Baja.", role: "El pico ya pasó." },
      testosterone: { pattern: "Baja.", associations: "Menos impulso para algunas." },
    },
    bodyNeeds: { nutrition: ["Comidas que sacien"], exercise: ["Movimiento constante"], rest: ["Noches más temprano"], hydration: ["Sorbos parejos"], wellbeing: ["Límites más claros"] },
  },
};

const FI_PHASE: Record<CyclePhase, Partial<PhaseContent>> = {
  menstrual: {
    name: "Kuukautiset",
    short: "Kuukautiset alkoivat. Energia voi laskea, ja hidastaminen on ihan ok.",
    hormones: "Estrogeeni ja progesteroni ovat usein matalimmillaan.",
    mood: "Sisäänpäin, herkkä tai vain hitaampi. Se kuuluu tähän vaiheeseen.",
    activities: ["Lempeä jooga", "Kävely", "Venyttely"],
    recommendations: ["Suojaa uni ja lämpö.", "Pidä liike lempeänä.", "Älä jätä aterioita väliin."],
    nutrition: { nutrients: ["Rauta", "C-vitamiini", "Magnesium", "Omega-3", "Kuitu", "Proteiini"], foods: ["Lehtivihannekset", "Linssit", "Sitrukset", "Lohi", "Tumma suklaa", "Banaanit"], hydration: "Lämpimät juomat ja vettä pitkin päivää.", note: "Nämä ovat ideoita, eivät hoito-ohje." },
    movement: { general: "Lempeä liike riittää. Jos kramppeja tai väsymystä on paljon, laske tehoa.", types: ["Kävely", "Jooga", "Pilates", "Venyttely", "Rauhallinen uinti"], intensity: "Matala", recovery: "Lämpö, lepo ja vesi auttavat tällä viikolla enemmän kuin ennätykset." },
    hormonesDetail: {
      estrogen: { pattern: "Usein matala.", role: "Nousee taas kuukautisten jälkeen.", associations: "Energia voi tuntua matalammalta." },
      progesterone: { pattern: "Myös matala.", effects: "Pysyy matalana näinä päivinä." },
      lh: { pattern: "Matala.", role: "Ei ole huipun aika." },
      testosterone: { pattern: "Matala.", associations: "Nousee hieman myöhemmin." },
    },
    bodyNeeds: { nutrition: ["Lämpimiä aterioita"], exercise: ["Lempeää liikettä"], rest: ["Enemmän unta"], hydration: ["Vettä"], wellbeing: ["Vähemmän vaatimista"] },
  },
  follicular: {
    name: "Follikulaarinen",
    short: "Energia alkaa palata. Hyvä hetki kokeilla jotain uutta.",
    hormones: "Estrogeeni nousee.",
    mood: "Enemmän uteliaisuutta ja keveyttä.",
    activities: ["Voima", "Kiva cardio", "Menemistä ulos"],
    recommendations: ["Käytä energia, jos sitä on.", "Kokeile pientä haastetta.", "Syö niin, että jaksat."],
    nutrition: { nutrients: ["Proteiini", "Hitaat hiilihydraatit", "B-vitamiinit", "Kuitu", "Antioksidantit"], foods: ["Kananmunat", "Kvinoa", "Marjat", "Lehtivihannekset", "Jogurtti", "Pähkinät"], hydration: "Vettä tasaisesti.", note: "Nämä ovat ideoita, eivät hoito-ohje." },
    movement: { general: "Hyvä hetki nostaa tehoa, jos olo on hyvä.", types: ["Voima", "Juoksu", "HIIT (jos tykkäät)", "Ryhmätreeni"], intensity: "Keskitaso tai reipas, olon mukaan", recovery: "Jätä ainakin yksi kevyempi päivä." },
    hormonesDetail: {
      estrogen: { pattern: "Nousee.", role: "Tukee mielialaa ja energiaa.", associations: "Olo voi olla virkeämpi." },
      progesterone: { pattern: "Vielä matala.", effects: "Sen vuoro tulee myöhemmin." },
      lh: { pattern: "Tasainen, ei vielä huippua.", role: "Huippu on lähempänä ovulaatiota." },
      testosterone: { pattern: "Alkaa nousta.", associations: "Voi lisätä motivaatiota." },
    },
    bodyNeeds: { nutrition: ["Aterioita, joista saa virtaa"], exercise: ["Pieni haaste"], rest: ["Tasainen uni"], hydration: ["Vesi"], wellbeing: ["Tilaa uudelle"] },
  },
  ovulation: {
    name: "Ovulaatio",
    short: "Monelle huippuviikko. Energia ja sosiaalisuus voivat olla korkealla.",
    hormones: "Estrogeeni huipussaan ja LH auttaa munasolun irtoamista. Tämä on arvio.",
    mood: "Sosiaalisempi, varmempi tai suunnitelmia tekevä.",
    activities: ["Kova treeni", "Ihmiset", "Jutut"],
    recommendations: ["Jos energiaa on, käytä sitä.", "Muista juoda.", "Tämä ei ole ovulaatiotesti."],
    nutrition: { nutrients: ["Antioksidantit", "Kuitu", "Proteiini", "Hyvät rasvat", "Sinkki", "D-vitamiini"], foods: ["Marjat", "Tomaatit", "Paprika", "Lohi", "Mantelit", "Parsa", "Lehtivihannekset"], hydration: "Enemmän vettä kuumalla.", note: "Nämä ovat ideoita, eivät hoito-ohje." },
    movement: { general: "Jos energia on korkealla ja oireet ovat hiljaa, kovempi treeni voi tuntua hyvältä.", types: ["HIIT", "Intervallit", "Voima", "Ryhmätreeni", "Urheilu"], intensity: "Korkea, jos olet palautunut; muuten keskitaso", recovery: "Jätä silti jäähdyttely ja proteiinipitoinen ateria." },
    hormonesDetail: {
      estrogen: { pattern: "Huippu.", role: "Osui usein korkeampaan energiaan.", associations: "Sosiaalinen into voi nousta." },
      progesterone: { pattern: "Alkaa nousta jälkeen.", effects: "Valmistaa jälkimmäistä puoliskoa." },
      lh: { pattern: "Lyhyt huippu.", role: "Auttaa munasolun irtoamista." },
      testosterone: { pattern: "Lyhyt huippu.", associations: "Voi lisätä draivia." },
    },
    bodyNeeds: { nutrition: ["Värikkäitä kasveja"], exercise: ["Treeni, josta tykkäät"], rest: ["Hyvä yö"], hydration: ["Enemmän nestettä"], wellbeing: ["Suunnitelmia ihmisten kanssa"] },
  },
  luteal: {
    name: "Luteaalinen",
    short: "Energia tasaantuu. Rauhalliset rutiinit auttavat.",
    hormones: "Progesteroni nousee ja laskee ennen kuukautisia, jos raskautta ei ole.",
    mood: "Sisäänpäin. Ruokahalu ja herkkyys voivat nousta.",
    activities: ["Tasainen voima", "Kävelyt", "Pienemmät suunnitelmat"],
    recommendations: ["Syö kunnolla.", "Laske vaatimustasoa, jos tarvitsee.", "Uni merkitsee enemmän."],
    nutrition: { nutrients: ["Magnesium", "B-vitamiinit", "Kalsium", "Hitaat hiilihydraatit", "Kuitu", "Proteiini"], foods: ["Kaura", "Kurpitsansiemenet", "Tummat lehtivihannekset", "Bataatti", "Kikherneet", "Kaakao"], hydration: "Vettä ja halutessa yrttiteetä.", note: "Nämä ovat ideoita, eivät hoito-ohje." },
    movement: { general: "Liiku, mutta anna tehon seurata energiaa, etenkin vaiheen loppupuolella.", types: ["Kohtuullinen voima", "Pilates", "Jooga", "Kävely", "Uinti"], intensity: "Alussa keskitaso, lopussa kevyempi", recovery: "Venyttely, lämpö ja uni auttavat enemmän kuin puskeminen." },
    hormonesDetail: {
      estrogen: { pattern: "Toinen nousu ja sitten lasku.", role: "Vaihtelee vaiheen aikana.", associations: "Mieliala voi liikkua." },
      progesterone: { pattern: "Nousee ja sitten laskee.", effects: "Tämän puoliskon hormoni." },
      lh: { pattern: "Matala.", role: "Huippu on jo mennyt." },
      testosterone: { pattern: "Matala.", associations: "Vähemmän draivia joillekin." },
    },
    bodyNeeds: { nutrition: ["Aterioita, jotka pitävät kylläisenä"], exercise: ["Tasaista liikettä"], rest: ["Aiempia iltoja"], hydration: ["Tasaisia kulauksia"], wellbeing: ["Selkeämmät rajat"] },
  },
};

const PHASE_BY_LANGUAGE: Record<string, Record<CyclePhase, Partial<PhaseContent>>> = {
  tr: TR_PHASE,
  es: ES_PHASE,
  fi: FI_PHASE,
};

export function getPhaseContent(phase: CyclePhase | null, language?: string): PhaseContent | null {
  if (!phase) return null;
  const base = PHASE_CONTENT[phase];
  const extra = language ? PHASE_BY_LANGUAGE[language]?.[phase] : undefined;
  if (!extra) return base;
  return {
    ...base,
    ...extra,
    nutrition: { ...base.nutrition, ...extra.nutrition },
    movement: { ...base.movement, ...extra.movement },
    hormonesDetail: {
      estrogen: { ...base.hormonesDetail.estrogen, ...extra.hormonesDetail?.estrogen },
      progesterone: { ...base.hormonesDetail.progesterone, ...extra.hormonesDetail?.progesterone },
      lh: { ...base.hormonesDetail.lh, ...extra.hormonesDetail?.lh },
      testosterone: { ...base.hormonesDetail.testosterone, ...extra.hormonesDetail?.testosterone },
    },
    bodyNeeds: { ...base.bodyNeeds, ...extra.bodyNeeds },
  };
}
