import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Play, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  duration: string;
  description: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Formation pour débutants (ID = 1)
  const course: Course = {
    id: 1,
    title: "Trading pour Débutants",
    description: "Apprenez les bases du trading avec cette formation complète",
    lessons: [
      {
        id: 1,
        title: "Introduction au Trading",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "15 min",
        description: "Découvrez les bases du trading et les marchés financiers",
        quiz: [
          {
            question: "Qu'est-ce que le trading ?",
            options: [
              "L'achat et la vente d'actifs financiers",
              "Seulement l'achat d'actions",
              "La conservation d'actifs à long terme",
              "L'analyse des graphiques"
            ],
            correctAnswer: 0
          },
          {
            question: "Quelle est la différence entre investissement et trading ?",
            options: [
              "Il n'y a pas de différence",
              "L'investissement est à long terme, le trading à court terme",
              "Le trading ne concerne que les crypto-monnaies",
              "L'investissement est plus risqué"
            ],
            correctAnswer: 1
          },
          {
            question: "Qu'est-ce qu'un actif financier ?",
            options: [
              "Seulement de l'argent liquide",
              "Un bien immobilier uniquement",
              "Tout instrument qui a une valeur économique",
              "Seulement les actions"
            ],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 2,
        title: "Les Marchés Financiers",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "20 min",
        description: "Comprenez les différents types de marchés financiers",
        quiz: [
          {
            question: "Quel est le marché le plus liquide au monde ?",
            options: [
              "Le marché des actions",
              "Le marché des matières premières", 
              "Le marché du Forex",
              "Le marché obligataire"
            ],
            correctAnswer: 2
          },
          {
            question: "Que signifie la liquidité d'un marché ?",
            options: [
              "La quantité d'eau dans le marché",
              "La facilité à acheter et vendre sans affecter les prix",
              "Le nombre d'investisseurs",
              "La volatilité du marché"
            ],
            correctAnswer: 1
          },
          {
            question: "Quand les marchés Forex sont-ils ouverts ?",
            options: [
              "Seulement en semaine de 9h à 17h",
              "24h/24 du dimanche soir au vendredi soir",
              "Seulement pendant les heures de bureau",
              "Jamais le weekend"
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 3,
        title: "Analyse Technique de Base",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "25 min",
        description: "Apprenez les fondamentaux de l'analyse technique",
        quiz: [
          {
            question: "Que représente une bougie verte/haussière ?",
            options: [
              "Le prix de clôture est inférieur au prix d'ouverture",
              "Le prix de clôture est supérieur au prix d'ouverture",
              "Le volume est élevé",
              "La volatilité est faible"
            ],
            correctAnswer: 1
          },
          {
            question: "Qu'est-ce qu'un support en analyse technique ?",
            options: [
              "Un niveau de prix où la tendance baissière tend à s'arrêter",
              "Un niveau de prix où la tendance haussière s'accélère",
              "Le volume de transactions",
              "La volatilité du marché"
            ],
            correctAnswer: 0
          },
          {
            question: "Que signifie RSI en analyse technique ?",
            options: [
              "Relative Strength Indicator",
              "Real Stock Index",
              "Resistance Support Indicator", 
              "Random Signal Index"
            ],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 4,
        title: "Gestion des Risques",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "18 min",
        description: "Protégez votre capital avec une bonne gestion des risques",
        quiz: [
          {
            question: "Quel pourcentage de votre capital devriez-vous risquer par trade au maximum ?",
            options: [
              "10-15%",
              "5-10%",
              "1-3%",
              "20-25%"
            ],
            correctAnswer: 2
          },
          {
            question: "Qu'est-ce qu'un stop-loss ?",
            options: [
              "Un ordre pour acheter plus d'actions",
              "Un ordre pour limiter les pertes en vendant automatiquement",
              "Un indicateur technique",
              "Une stratégie d'investissement"
            ],
            correctAnswer: 1
          },
          {
            question: "Pourquoi la diversification est-elle importante ?",
            options: [
              "Pour augmenter les profits",
              "Pour réduire les risques en répartissant les investissements",
              "Pour payer moins de taxes",
              "Pour trader plus rapidement"
            ],
            correctAnswer: 1
          }
        ]
      }
    ]
  };

  const currentLesson = course.lessons[currentLessonIndex];
  const currentQuestion = currentLesson.quiz[currentQuestionIndex];
  const progress = ((completedLessons.length) / course.lessons.length) * 100;
  const isLastLesson = currentLessonIndex === course.lessons.length - 1;

  const handleVideoEnd = () => {
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
  };

  const handleQuizSubmit = () => {
    const selectedIndex = parseInt(selectedAnswer);
    if (selectedIndex === currentQuestion.correctAnswer) {
      toast({
        title: "Bravo !",
        description: "Vous avez répondu correctement à la question.",
      });
      
      // Passer à la question suivante
      if (currentQuestionIndex < currentLesson.quiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
      } else {
        // Toutes les questions sont terminées
        if (!completedLessons.includes(currentLesson.id)) {
          setCompletedLessons([...completedLessons, currentLesson.id]);
        }
        setQuizCompleted(true);
        
        // Si c'est la dernière leçon et que toutes les leçons sont complétées, proposer l'upgrade
        if (isLastLesson && completedLessons.length + 1 === course.lessons.length) {
          setShowUpgrade(true);
        }
      }
    } else {
      toast({
        title: "Réponse incorrecte",
        description: "Veuillez regarder à nouveau la vidéo et réessayer.",
        variant: "destructive"
      });
      setShowQuiz(false);
      setSelectedAnswer("");
      setCurrentQuestionIndex(0);
    }
  };

  const nextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setShowQuiz(false);
      setQuizCompleted(false);
      setSelectedAnswer("");
      setCurrentQuestionIndex(0);
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setShowQuiz(false);
      setQuizCompleted(false);
      setSelectedAnswer("");
      setCurrentQuestionIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/formation')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux formations
            </Button>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground">{course.description}</p>
              </div>
              <Badge variant="secondary" className="px-4 py-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Leçon {currentLessonIndex + 1}/{course.lessons.length}
              </Badge>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progression du cours</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {currentLesson.title}
                    {completedLessons.includes(currentLesson.id) && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground">{currentLesson.description}</p>
                </CardHeader>
                <CardContent>
                  {!showQuiz ? (
                    <div className="space-y-4">
                      <div className="aspect-video">
                        <iframe
                          src={currentLesson.videoUrl}
                          title={currentLesson.title}
                          className="w-full h-full rounded-lg"
                          frameBorder="0"
                          allowFullScreen
                        />
                      </div>
                      <Button 
                        onClick={handleVideoEnd}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        J'ai terminé cette vidéo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <div className="text-center">
                         <h3 className="text-xl font-semibold mb-4">Quiz de compréhension</h3>
                         <p className="text-muted-foreground mb-6">
                           Question {currentQuestionIndex + 1} sur {currentLesson.quiz.length} - Répondez pour valider votre compréhension.
                         </p>
                       </div>
                      
                       <Card>
                         <CardContent className="pt-6">
                           <h4 className="font-medium mb-4">{currentQuestion.question}</h4>
                           <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                             {currentQuestion.options.map((option, index) => (
                               <div key={index} className="flex items-center space-x-2">
                                 <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                 <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                   {option}
                                 </Label>
                               </div>
                             ))}
                           </RadioGroup>
                         </CardContent>
                       </Card>
                      
                      <div className="flex gap-4">
                         <Button 
                           variant="outline" 
                           onClick={() => {
                             setShowQuiz(false);
                             setSelectedAnswer("");
                             setCurrentQuestionIndex(0);
                           }}
                           className="flex-1"
                         >
                           Revoir la vidéo
                         </Button>
                         <Button 
                           onClick={handleQuizSubmit}
                           disabled={!selectedAnswer}
                           className="flex-1"
                         >
                           {currentQuestionIndex < currentLesson.quiz.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
                         </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {quizCompleted && !showUpgrade && (
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={prevLesson}
                    disabled={currentLessonIndex === 0}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Leçon précédente
                  </Button>
                  <Button 
                    onClick={nextLesson}
                    disabled={currentLessonIndex === course.lessons.length - 1}
                    className="flex-1"
                  >
                    Leçon suivante
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {showUpgrade && (
                <Card className="border-primary bg-gradient-to-r from-primary/5 to-primary-glow/5">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-primary mb-2">🎉 Félicitations !</h3>
                        <p className="text-muted-foreground">
                          Vous avez terminé la formation gratuite pour débutants.
                        </p>
                      </div>
                      
                      <div className="bg-background rounded-lg p-6 space-y-4">
                        <h4 className="text-xl font-semibold">Passez au niveau supérieur</h4>
                        <p className="text-muted-foreground">
                          Accédez à nos formations avancées avec des stratégies de trading professionnelles, 
                          des signaux en temps réel et un accompagnement personnalisé.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                          <div className="space-y-2">
                            <h5 className="font-medium">✅ Formations avancées</h5>
                            <h5 className="font-medium">✅ Signaux de trading</h5>
                            <h5 className="font-medium">✅ Analyses quotidiennes</h5>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-medium">✅ Support prioritaire</h5>
                            <h5 className="font-medium">✅ Communauté VIP</h5>
                            <h5 className="font-medium">✅ Webinaires exclusifs</h5>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => navigate('/formation')}
                            className="flex-1"
                          >
                            Plus tard
                          </Button>
                          <Button 
                            onClick={() => navigate('/tarifs')}
                            className="flex-1"
                            variant="hero"
                          >
                            Voir les tarifs
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar avec la liste des leçons */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Plan du cours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentLessonIndex === index 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setCurrentLessonIndex(index);
                        setShowQuiz(false);
                        setQuizCompleted(false);
                        setSelectedAnswer("");
                        setCurrentQuestionIndex(0);
                        setShowUpgrade(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            completedLessons.includes(lesson.id)
                              ? 'bg-green-500 text-white'
                              : currentLessonIndex === index
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {completedLessons.includes(lesson.id) ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseContent;