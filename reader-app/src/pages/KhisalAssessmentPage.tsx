import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useTranslation } from '../lib/i18n'
import { toArabicDigits } from '../lib/format'

interface Question {
  id: number
  dimension: string
  dimensionEn: string
  scenario: string
  scenarioEn: string
  options: {
    text: string
    textEn: string
    score: number
  }[]
  recommendationChapterId: string
  recommendationTitle: string
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 1,
    dimension: 'حفظ اللسان والمنطق',
    dimensionEn: 'Speech & Guarding the Tongue',
    scenario: 'عندما تدور في مجلس أحاديث عن عيوب شخص غائب أو كلام لا فائدة منه:',
    scenarioEn: 'When people in a gathering engage in gossip or useless talk:',
    options: [
      { text: 'أصمت تماماً أو أغير مسار الحديث بالحكمة ولا أشارك أبداً', textEn: 'Remain silent or wisely redirect the topic without participating', score: 10 },
      { text: 'أستمع دون تعليق حرصاً على مجاملة الحاضرين', textEn: 'Listen without commenting to stay polite', score: 6 },
      { text: 'أشارك أحياناً بكلمات عابرة إذا كان الحديث مشوقاً', textEn: 'Occasionally chime in if the talk is interesting', score: 3 },
    ],
    recommendationChapterId: 'chapter-004',
    recommendationTitle: 'باب الرباعيات: قواعد استقامة اللسان وآفات الكلام',
  },
  {
    id: 2,
    dimension: 'كظم الغيظ والحلم',
    dimensionEn: 'Patience & Anger Restraint',
    scenario: 'إذا تعرضت لموقف استفزازي أو إساءة غير متوقعة من شخص آخر:',
    scenarioEn: 'When provoked or mistreated unexpectedly by someone:',
    options: [
      { text: 'أستعيذ بالله وأكظم غيظي فوراً وأصفح احتساباً للأجر', textEn: 'Seek refuge in Allah, control anger immediately, and forgive', score: 10 },
      { text: 'أتحمل ظاهرياً ولكن يبقى في نفسي عتب وألم', textEn: 'Endure externally while holding some internal resentment', score: 6 },
      { text: 'أغضب سريعاً وأرد بالمثل للدفاع عن نفسي', textEn: 'Get angry quickly and respond in kind', score: 2 },
    ],
    recommendationChapterId: 'chapter-006',
    recommendationTitle: 'باب السداسيات: شواهد كمال الرأي والحلم وكظم الغيظ',
  },
  {
    id: 3,
    dimension: 'الجود والسخاء',
    dimensionEn: 'Generosity & Altruism',
    scenario: 'عندما يُطلب منك العون المالي أو البدني لمحتاج أو مشروع خير:',
    scenarioEn: 'When asked for financial or physical support for a needy cause:',
    options: [
      { text: 'أبادر بالبذل بسخاء وطيب نفس وبسرية تامة', textEn: 'Generously give with gladness and discreet sincerity', score: 10 },
      { text: 'أعطي ما يفيض عن حاجتي المباشرة بعد تردد يسير', textEn: 'Give what exceeds immediate needs after slight hesitation', score: 6 },
      { text: 'أعتذر غالباً خشية الحاجة ونقصان المال', textEn: 'Usually decline out of fear of future need', score: 3 },
    ],
    recommendationChapterId: 'chapter-007',
    recommendationTitle: 'باب السباعيات: السبعة الذين يظلهم الله وأجر الصدقة الخفية',
  },
  {
    id: 4,
    dimension: 'صلة الرحم والتغافل',
    dimensionEn: 'Kinship & Overlooking Faults',
    scenario: 'مع الأقارب والإخوان إذا حدث سوء تفاهم أو جفاء من طرفهم:',
    scenarioEn: 'With relatives and friends when misunderstandings or coldness arise:',
    options: [
      { text: 'أبادر بالوصل والتغافل التام عن الهفوات إبقاءً للمودة', textEn: 'Initiate contact and completely overlook slips to maintain affection', score: 10 },
      { text: 'أعاملهم بالمثل، فمن وصلني وصلته ومن قطعني تركته', textEn: 'Treat them reciprocally: connect with those who connect with me', score: 5 },
      { text: 'أقاطعهم تجنباً لأي إزعاج أو توتر إضافي', textEn: 'Cut them off to avoid extra stress', score: 2 },
    ],
    recommendationChapterId: 'chapter-006',
    recommendationTitle: 'باب السداسيات: واجبات ذوي الأرحام وأعظم مكارم السلوك',
  },
  {
    id: 5,
    dimension: 'علو الهمة واغتنام الوقت',
    dimensionEn: 'High Resolve & Time Mastery',
    scenario: 'كيف تقضي ساعات فراغك وأوقات راحتك اليومية؟',
    scenarioEn: 'How do you spend your daily free time and leisure hours?',
    options: [
      { text: 'أستثمرها في القراءة النافعة، والعبادة، وبناء العادات الصالحة', textEn: 'Invest in reading, worship, and building virtuous habits', score: 10 },
      { text: 'أمزج بين الترفيه والعمل النافع دون تخطيط مسبق', textEn: 'Mix leisure and useful work without prior planning', score: 6 },
      { text: 'تضيع أغلبيتها في تصفح وسائل التواصل والمشتتات', textEn: 'Mostly lost in social media scrolling and distractions', score: 3 },
    ],
    recommendationChapterId: 'chapter-005',
    recommendationTitle: 'باب الخماسيات: اغتنم خمساً قبل خمس واستثمار فرص العمر',
  },
  {
    id: 6,
    dimension: 'الأمانة والوفاء بالعهد',
    dimensionEn: 'Trustworthiness & Promise Keeping',
    scenario: 'عندما تعد شخصاً بموعد أو تُؤتمن على سر أو حاجة:',
    scenarioEn: 'When making a promise or entrusted with a secret/duty:',
    options: [
      { text: 'ألتزم بالوفاء الدقيق وأحفظ الأمانة كأغلى ما أملك', textEn: 'Strictly uphold the promise and safeguard the trust meticulously', score: 10 },
      { text: 'أحاول الالتزام غالباً، وقد أعتذر لأسباب طارئة', textEn: 'Usually try to uphold it, apologizing for unforeseen issues', score: 7 },
      { text: 'كثيراً ما أنسى أو أتأخر عن المواعيد المقررة', textEn: 'Frequently forget or run late for scheduled commitments', score: 3 },
    ],
    recommendationChapterId: 'chapter-004',
    recommendationTitle: 'باب الرباعيات: علامات النفاق وموجبات حفظ الأمانة',
  },
  {
    id: 7,
    dimension: 'التواضع وقبول الحق',
    dimensionEn: 'Humility & Accepting Truth',
    scenario: 'إذا أشار عليك شخص بخطأ ارتكبته أو قدم لك نصيحة مباشرة:',
    scenarioEn: 'When someone points out a mistake you made or offers sincere advice:',
    options: [
      { text: 'أشكر ناصحي برحابة صدر وأرجع إلى الحق فوراً بلا مكابرة', textEn: 'Warmly thank the adviser and immediately embrace truth without pride', score: 10 },
      { text: 'أتقبلها بصمت ولكن أشعر بحرج وضيق داخلي', textEn: 'Accept silently while feeling internal discomfort', score: 6 },
      { text: 'أبرر موقفي وأدافع عن نفسي لرد الانتقاد', textEn: 'Justify my stance and defend myself to deflect criticism', score: 2 },
    ],
    recommendationChapterId: 'chapter-002',
    recommendationTitle: 'باب الثنائيات: موجبات الرفعة بالتواضع والإنصاف',
  },
  {
    id: 8,
    dimension: 'القناعة وطمأنينة البال',
    dimensionEn: 'Contentment & Inner Peace',
    scenario: 'عندما ترى الآخرين يتفاخرون بنعم جديدة أو مقتنيات مادية فارهة:',
    scenarioEn: 'When witnessing others showing off new luxuries and wealth:',
    options: [
      { text: 'أفرح لهم وأحمد الله على ما قسم لي برضا تام واطمئنان', textEn: 'Rejoice for them and praise Allah for my share with deep peace', score: 10 },
      { text: 'أشعر أحياناً ببعض التطلع والرغبة في مماثلتهم', textEn: 'Sometimes feel a desire to match their acquisitions', score: 6 },
      { text: 'أشعر بالضيق والمقارنة الدائمة التي تكدر خاطري', textEn: 'Feel distress and persistent comparison that disturbs my mind', score: 2 },
    ],
    recommendationChapterId: 'chapter-008',
    recommendationTitle: 'باب الثمانيات: ثمان خصال تجلب انشراح الصدر والرضا',
  },
]

export default function KhisalAssessmentPage() {
  const navigate = useNavigate()
  const { isRtl } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSelectOption = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }))
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setCurrentStep(0)
    setIsCompleted(false)
  }

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const maxPossible = ASSESSMENT_QUESTIONS.length * 10
  const percentage = Math.round((totalScore / maxPossible) * 100)

  const getRank = (pct: number) => {
    if (pct >= 85) return { title: isRtl ? 'صاحب مروءة رفيعة وخلق سامٍ 🌟' : 'High Virtue & Nobility 🌟', desc: isRtl ? 'تتمتع بحصانة خلقية عالية واتباع راسخ للآداب والخصال النبيلة.' : 'Exemplary moral character with deep adherence to noble virtues.' }
    if (pct >= 65) return { title: isRtl ? 'سالك سبيل الفضائل والمجاهدة 🌿' : 'Path of Virtue & Striving 🌿', desc: isRtl ? 'لديك أرضية قيمية طيبة وتحتاج فقط إلى تعزيز بعض الخصال الدقيقة كالتغافل وحفظ اللسان.' : 'Solid values foundation; continue refining subtle habits like speech discipline.' }
    return { title: isRtl ? 'مستفتح لباب التهذيب والمراجعة 📖' : 'Beginning Moral Refinement 📖', desc: isRtl ? 'فرصة سانحة للنهوض واستثمار موسوعة الخصال لتجديد السلوك والارتقاء بالمروءة.' : 'A prime opportunity to study the 200 Khisals and cultivate moral habits.' }
  }

  const rankInfo = getRank(percentage)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-16">
      <PageHeader
        title={isRtl ? 'مقياس واختبار الخصال السلوكية' : 'Khisal Virtue Assessment'}
        subtitle={isRtl ? 'أداة تفاعلية لاكتشاف مكامن القوة الخلقية وتهذيب السلوك' : 'Interactive tool to discover character strengths & refine moral habits'}
        backTo="/more"
      />

      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Progress Bar */}
            <div className="bg-app-surface p-4 rounded-2xl border border-app-border space-y-2 shadow-xs">
              <div className="flex justify-between text-xs font-bold text-app-text-secondary">
                <span>{isRtl ? `السؤال ${toArabicDigits(currentStep + 1)} من ${toArabicDigits(ASSESSMENT_QUESTIONS.length)}` : `Question ${currentStep + 1} of ${ASSESSMENT_QUESTIONS.length}`}</span>
                <span className="text-app-accent">{toArabicDigits(Math.round(((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100))}%</span>
              </div>
              <div className="h-2 w-full bg-app-border/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-app-accent transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            {ASSESSMENT_QUESTIONS[currentStep] && (
              <div className="p-6 sm:p-8 rounded-3xl bg-app-surface border border-app-border shadow-xs space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-accent/10 border border-app-accent/20 text-app-accent text-xs font-bold">
                  <Sparkles size={13} />
                  <span>{isRtl ? ASSESSMENT_QUESTIONS[currentStep].dimension : ASSESSMENT_QUESTIONS[currentStep].dimensionEn}</span>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-app-text leading-relaxed">
                  {isRtl ? ASSESSMENT_QUESTIONS[currentStep].scenario : ASSESSMENT_QUESTIONS[currentStep].scenarioEn}
                </h3>

                <div className="space-y-3 pt-2">
                  {ASSESSMENT_QUESTIONS[currentStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(ASSESSMENT_QUESTIONS[currentStep].id, opt.score)}
                      className="w-full p-4 rounded-2xl border border-app-border bg-app-bg hover:border-app-accent/80 hover:bg-app-accent/5 transition-all text-right group flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer"
                    >
                      <span className="text-sm font-medium text-app-text group-hover:text-app-accent leading-relaxed">
                        {isRtl ? opt.text : opt.textEn}
                      </span>
                      <div className="w-6 h-6 rounded-full border border-app-border group-hover:border-app-accent flex items-center justify-center shrink-0 text-transparent group-hover:text-app-accent group-hover:bg-app-accent/10 transition-colors">
                        <CheckCircle2 size={15} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation footer */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="gap-2"
              >
                {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                <span>{isRtl ? 'السابق' : 'Previous'}</span>
              </Button>

              <span className="text-xs text-app-muted font-serif">
                {isRtl ? 'الإجابة بمصداقية تعكس نتيجتك الحقيقية' : 'Answer honestly for true reflection'}
              </span>
            </div>
          </motion.div>
        ) : (
          /* Assessment Results Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <div className="p-8 rounded-3xl bg-linear-to-b from-app-accent/15 via-app-surface to-app-surface border border-app-accent/30 text-center shadow-md space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-app-accent/20 text-app-accent flex items-center justify-center mx-auto shadow-inner">
                <Award size={32} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-app-accent">
                  {isRtl ? 'نتيجة تقييم الخصال والمروءة' : 'Virtue Assessment Result'}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-app-text mt-1">
                  {toArabicDigits(percentage)}%
                </h2>
                <h3 className="font-display text-lg font-bold text-app-accent mt-2">
                  {rankInfo.title}
                </h3>
                <p className="text-xs sm:text-sm text-app-text-secondary max-w-md mx-auto mt-1 leading-relaxed">
                  {rankInfo.desc}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button size="sm" variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw size={14} />
                  <span>{isRtl ? 'إعادة الاختبار' : 'Retake Quiz'}</span>
                </Button>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="p-6 rounded-3xl bg-app-surface border border-app-border space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-app-accent" />
                <h3 className="font-display font-bold text-base text-app-text">
                  {isRtl ? 'أبواب مقترحة للمطالعة والتطبيق في موسوعة الخصال:' : 'Recommended Chapters to Study in Khisal Book:'}
                </h3>
              </div>

              <div className="space-y-2.5">
                {ASSESSMENT_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => navigate(`/book/alkhisal-al-miatan/read?c=${q.recommendationChapterId}`)}
                    className="w-full p-4 rounded-2xl border border-app-border bg-app-bg hover:border-app-accent/60 hover:bg-app-accent/5 transition-all text-right flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-app-text group-hover:text-app-accent transition-colors">
                          {q.recommendationTitle}
                        </p>
                        <p className="text-[11px] text-app-muted">
                          {isRtl ? `تعزيز بُعد: ${q.dimension}` : `Strengthen: ${q.dimensionEn}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-app-muted group-hover:text-app-accent transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
