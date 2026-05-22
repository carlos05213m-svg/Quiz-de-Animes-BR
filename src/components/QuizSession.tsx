import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Home } from 'lucide-react';
import { Quiz, QuizResult } from '../types';
import StarDisplay from './StarDisplay';
import { saveRanking } from '../lib/storage';

interface QuizSessionProps {
  quiz: Quiz;
  questionCount: number;
  onClose: () => void;
}

export default function QuizSession({ quiz, questionCount, onClose }: QuizSessionProps) {
  const [questions, setQuestions] = useState(quiz.questions.slice(0, Math.min(questionCount, quiz.questions.length)));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (selectedOption !== null || isFinished) return;

    if (timeLeft === 0) {
      handleSelect(-1); // -1 means time ran out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, selectedOption, isFinished]);

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === currentQuestion.correctAnswer;
    setIsCorrect(index === -1 ? false : correct);
    if (index !== -1 && correct) setScore(s => s + 1);

    if (index !== -1 && correct) {
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(i => i + 1);
          setSelectedOption(null);
          setIsCorrect(null);
          setTimeLeft(10);
        } else {
          finishQuiz();
        }
      }, 1500);
    }
    // If wrong or time out, we don't advance automatically to give the option to exit
  };

  const calculateStars = (pct: number) => {
    if (pct >= 90) return 5;
    if (pct >= 75) return 4;
    if (pct >= 50) return 3;
    if (pct >= 25) return 2;
    if (pct > 0) return 1;
    return 0;
  };

  const finishQuiz = () => {
    const percentage = (score / questions.length) * 100;
    const finalStars = calculateStars(percentage);
    
    const result: QuizResult = {
      userId: 'local-user',
      userName: localStorage.getItem('anime_quiz_user') || 'Mestre Ninja',
      animeId: quiz.id,
      animeTitle: quiz.title,
      score: score,
      totalQuestions: questions.length,
      percentage: percentage,
      stars: finalStars,
      timestamp: Date.now(),
    };

    saveRanking(result);
    setIsFinished(true);
  };

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    const stars = calculateStars(percentage);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto py-12 px-6 text-center"
        id="quiz-results"
      >
        <div className="mb-8 flex justify-center">
          <motion.div 
            initial={{ rotate: -10, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className="relative"
          >
            <div className="gold-glow p-4 rounded-full bg-brand-yellow/10">
              <Trophy className="w-24 h-24 text-brand-yellow drop-shadow-xl" strokeWidth={1.5} />
            </div>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-2 -right-2 bg-brand-red text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-4 border-brand-black shadow-lg"
            >
              {score}
            </motion.div>
          </motion.div>
        </div>

        <h2 className="font-display font-black text-4xl mb-4 uppercase italic">Finalizado!</h2>
        
        <div className="jp-card p-6 mb-8">
          <div className="flex justify-center mb-4">
            <StarDisplay count={stars} size={32} />
          </div>
          <p className="text-2xl font-bold mb-2">{percentage.toFixed(0)}% de Acerto</p>
          <p className="text-brand-black/60 uppercase text-xs tracking-widest font-bold">
            {score} de {questions.length} Questões
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={onClose} className="jp-button w-full flex items-center justify-center gap-2">
            <Home className="w-5 h-5" /> Início
          </button>
          <button onClick={() => window.location.reload()} className="jp-button-secondary w-full flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Tentar Novamente
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {quiz.backgroundImage && (
        <div className="fixed inset-0 z-0">
          <img src={quiz.backgroundImage} alt="" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-[2px]"></div>
        </div>
      )}
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4" id="quiz-session">
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-white/20 text-white">
          <div>
            <h2 className="font-display font-black text-2xl uppercase italic drop-shadow-md">{quiz.title}</h2>
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">
              Questão {currentIndex + 1} de {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="text-white/60 hover:text-white flex items-center gap-2 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-brand-red group-hover:bg-brand-red transition-all">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Sair do Quiz</span>
            </button>
            <div className="flex items-center gap-4">
              <div className={`font-mono text-xl font-bold px-3 py-1 border-2 border-white/40 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] bg-black/20 backdrop-blur-md ${timeLeft <= 3 ? 'text-brand-red animate-pulse' : 'text-white'}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </div>
              <div className="bg-brand-red text-white px-4 py-1 font-mono text-sm border-2 border-brand-red shadow-[2px_2px_0px_0px_rgba(230,57,70,0.4)]">
                SCORE: {score.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="jp-card p-8 bg-white/90 backdrop-blur-md relative overflow-hidden"
        >
          {selectedOption === -1 && (
            <div className="absolute top-0 left-0 w-full bg-brand-red text-white text-[10px] font-bold uppercase tracking-widest py-1 text-center animate-bounce">
              Tempo Esgotado!
            </div>
          )}
          <h3 className="text-xl md:text-2xl font-bold mb-8 mt-2">{currentQuestion.text}</h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = "w-full text-left p-4 border-2 border-brand-black font-bold transition-all relative overflow-hidden group ";
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctAnswer;
              
              if (selectedOption !== null) {
                if (isSelected) {
                  btnClass += isCorrect ? "bg-green-100 border-green-600 " : "bg-red-100 border-red-600 ";
                } else if (isCorrectOption) {
                  btnClass += "bg-green-50 border-green-400 ";
                } else {
                  btnClass += "opacity-40 ";
                }
              } else {
                btnClass += "hover:bg-brand-red/5 ";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selectedOption !== null}
                  className={btnClass}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <span>{option}</span>
                    {selectedOption !== null && isSelected && (
                      isCorrect ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />
                    )}
                    {selectedOption !== null && !isSelected && isCorrectOption && (
                      <CheckCircle2 className="text-green-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedOption !== null && !isCorrect && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 border-4 border-brand-red bg-brand-red/5 shadow-[4px_4px_0px_0px_rgba(230,57,70,1)]"
            >
              <div className="flex items-center gap-3 text-brand-red mb-4">
                <XCircle className="w-8 h-8" />
                <div>
                  <h4 className="font-display font-black text-xl uppercase italic leading-none">Ops! Você Errou.</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Sua jornada termina aqui ou você deseja continuar?</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={onClose}
                  className="jp-button flex-grow flex items-center justify-center gap-2 py-4"
                >
                  Sair do Quiz
                </button>
                <button 
                  onClick={() => {
                    if (currentIndex < questions.length - 1) {
                      setCurrentIndex(i => i + 1);
                      setSelectedOption(null);
                      setIsCorrect(null);
                      setTimeLeft(10);
                    } else {
                      finishQuiz();
                    }
                  }}
                  className="jp-button-secondary flex-grow py-4"
                >
                  Continuar Mesmo Assim
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 bg-brand-black/5 h-2 w-full rounded-full overflow-hidden">
        <motion.div 
          className="bg-brand-red h-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      </div>
    </div>
  );
}
