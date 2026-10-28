const fs = require('fs');
const path = './KOSUN2026/components/action-portal/cognitive-portal/KosCognitivePortal.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. imports
if (!code.includes('QuestionExplorationView')) {
  code = code.replace(
    "import { OwnerCategorySubView, OwnerCategoryView } from './OwnerCategorySubView';",
    "import { OwnerCategorySubView, OwnerCategoryView } from './OwnerCategorySubView';\nimport { QuestionExplorationView } from './QuestionExplorationView';\nimport { trackQuestionAffinityClick } from '../../../factory/questionAffinityEngine';"
  );
}

// 2. state
if (!code.includes('activeExplorationQuestion')) {
  code = code.replace(
    'const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);',
    'const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);\n  const [activeExplorationQuestion, setActiveExplorationQuestion] = useState<{\n    mainQuestion: string;\n    mainAnswer?: string;\n    category?: string;\n    affinityScore?: number;\n    relatedQuestions?: any[];\n  } | null>(null);'
  );
}

// 3. helper function to open exploration
if (!code.includes('const openQuestionExploration =')) {
  const helperCode = `
  const openQuestionExploration = (qText: string) => {
    setActiveAiAnswer(null);
    let answerText = "שיטת The Big 3 מבוססת על עקרון הפחתת העומס הקוגניטיבי: בחירה מודעת של עד 3 משימות קריטיות בכל יום, ופירוקן לשלבים קצרים של 15 דקות. כל שאר המשימות מופקדות בבנק ה-Inbox כדי לא להעמיס על הזיכרון הפעיל.";
    let cat = "פרודוקטיביות ו-The Big 3";
    let affScore = 98;
    let rels = [
      { id: "rel_1", question: "איך מתמודדים כשמגיעה משימה דחופה באמצע היום?", affinityScore: 94, category: "ניהול עומס" },
      { id: "rel_2", question: "האם המערכת מבצעת תמלול קולי אוטומטי בעברית?", affinityScore: 89, category: "טכנולוגיה וקול" },
      { id: "rel_3", question: "איך מסכמים יום בצורה נכונה בטקס הנעילה?", affinityScore: 85, category: "שקט מנטלי" }
    ];

    if (tenantProfile?.category === "automotive") {
      cat = "רכבי יוקרה וספורט";
      affScore = 96;
      answerText = "אנו מציעים מלאי זמין של רכבי ספורט וסופרקארס עם בדיקת 150 נקודות, אפשרויות טרייד-אין מיידי וחבילות מימון מותאמות אישית.";
      rels = [
        { id: "rel_car_1", question: "מה אפשרויות המימון והטרייד-אין?", affinityScore: 95, category: "מימון ורכישה" },
        { id: "rel_car_2", question: "איך מתאמים נסיעת מבחן של 45 דקות?", affinityScore: 91, category: "נסיעת מבחן" },
        { id: "rel_car_3", question: "האם הרכבים מגיעים עם אחריות יבואן מלאה?", affinityScore: 88, category: "אחריות ושירות" }
      ];
    }

    setActiveExplorationQuestion({
      mainQuestion: qText,
      mainAnswer: answerText,
      category: cat,
      affinityScore: affScore,
      relatedQuestions: rels
    });
    trackQuestionAffinityClick(tenantId, "q_" + Date.now(), targetProject);
  };
`;
  code = code.replace(
    'const handleNodeClick = (node: CognitiveNodeModel) => {',
    helperCode + '\n  const handleNodeClick = (node: CognitiveNodeModel) => {'
  );
}

// 4. replace onQuestionClick on InteractiveCapsule
code = code.replace(
  /onQuestionClick=\{[\s\S]*?\}\s*onMicClick=/,
  `onQuestionClick={() => {
            const qText = activeQuestionNode ? activeQuestionNode.questionText : 'איך עובדת שיטת חוק ה-3 (The Big 3)?';
            openQuestionExploration(qText);
          }}
          onMicClick=`
);

// 5. render QuestionExplorationView when activeExplorationQuestion is set
if (!code.includes('<QuestionExplorationView')) {
  code = code.replace(
    "currentParentId === 'node_root_location' ? (",
    `activeExplorationQuestion ? (
              <QuestionExplorationView
                mainQuestion={activeExplorationQuestion.mainQuestion}
                mainAnswer={activeExplorationQuestion.mainAnswer}
                category={activeExplorationQuestion.category}
                affinityScore={activeExplorationQuestion.affinityScore}
                relatedQuestions={activeExplorationQuestion.relatedQuestions || []}
                tenantProfile={tenantProfile}
                onSelectRelatedQuestion={(nextQ) => openQuestionExploration(nextQ)}
                onBack={() => setActiveExplorationQuestion(null)}
                onAskAiDirectly={(q) => dispatchSubmittedQuery(q)}
              />
            ) : currentParentId === 'node_root_location' ? (`
  );
}

// 6. reset activeExplorationQuestion on going home
code = code.replaceAll(
  'setCurrentParentId(null);',
  'setCurrentParentId(null);\n                  setActiveExplorationQuestion(null);'
);

fs.writeFileSync(path, code, 'utf8');
console.log('Successfully updated KosCognitivePortal.tsx!');
