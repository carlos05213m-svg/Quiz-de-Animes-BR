/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Settings2, Info, Loader2, Sparkles, LogOut, User as UserIcon, X, Wand2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { QUIZZES } from './data/quizzes';
import { Quiz, Tab, Question } from './types';
import QuizSession from './components/QuizSession';
import Ranking from './components/Ranking';
import AIRecommendations from './components/AIRecommendations';
import { GoogleGenAI } from "@google/genai";
import { getAIGeneratedImage } from './services/geminiService';

interface UserData {
  name: string;
  photo?: string | null;
  age?: string;
  email: string;
  password?: string;
  joinDate: string;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('anime_quiz_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>(() => {
    const saved = localStorage.getItem('anime_quiz_all_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [showIntro, setShowIntro] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab | 'profile'>('quizzes');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questionLimit, setQuestionLimit] = useState(10);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAILoadingImage, setIsAILoadingImage] = useState<string | null>(null); // 'profile' | 'cover' | 'background'
  const [customBackgrounds, setCustomBackgrounds] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('anime_quiz_custom_bg');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned: Record<string, string> = {};
        let updated = false;
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string' && (
            value.includes('/assets/') || 
            value.includes('_quiz_') || 
            value.includes('.png') || 
            value.includes('.jpg') || 
            value.includes('naruto') || 
            value.includes('onepiece') || 
            value.includes('dragonball') || 
            value.includes('pokemon') || 
            value.includes('demonslayer') || 
            value.includes('deathnote')
          )) {
            updated = true;
          } else {
            cleaned[key] = value as string;
          }
        }
        if (updated) {
          localStorage.setItem('anime_quiz_custom_bg', JSON.stringify(cleaned));
        }
        return cleaned;
      } catch (e) {
        return {};
      }
    }
    return {};
  });
  const [customCovers, setCustomCovers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('anime_quiz_custom_cover');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned: Record<string, string> = {};
        let updated = false;
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string' && (
            value.includes('/assets/') || 
            value.includes('_quiz_') || 
            value.includes('.png') || 
            value.includes('.jpg') || 
            value.includes('naruto') || 
            value.includes('onepiece') || 
            value.includes('dragonball') || 
            value.includes('pokemon') || 
            value.includes('demonslayer') || 
            value.includes('deathnote')
          )) {
            updated = true;
          } else {
            cleaned[key] = value as string;
          }
        }
        if (updated) {
          localStorage.setItem('anime_quiz_custom_cover', JSON.stringify(cleaned));
        }
        return cleaned;
      } catch (e) {
        return {};
      }
    }
    return {};
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (name: string, email: string, password?: string, photo?: string | null, age?: string) => {
    if (authMode === 'login') {
      const existingUser = registeredUsers.find(u => 
        (u.name.toLowerCase() === name.toLowerCase() || 
         u.email.toLowerCase() === name.toLowerCase()) && 
        u.password === password
      );

      if (existingUser) {
        localStorage.setItem('anime_quiz_user_data', JSON.stringify(existingUser));
        localStorage.setItem('anime_quiz_user', existingUser.name); 
        setUser(existingUser);
        setShowIntro(false);
      } else {
        alert('Usuário ou senha incorretos!');
      }
      return;
    }

    // Register mode
    const userExists = registeredUsers.some(u => u.name.toLowerCase() === name.toLowerCase());
    if (userExists) {
      alert('Este nome de usuário já está sendo usado!');
      return;
    }

    const userData: UserData = { 
      name, 
      photo, 
      age, 
      email,
      password,
      joinDate: new Date().toLocaleDateString('pt-BR') 
    };
    
    const newRegistered = [...registeredUsers, userData];
    setRegisteredUsers(newRegistered);
    localStorage.setItem('anime_quiz_all_users', JSON.stringify(newRegistered));
    
    localStorage.setItem('anime_quiz_user_data', JSON.stringify(userData));
    localStorage.setItem('anime_quiz_user', name); 
    setUser(userData);
    setShowIntro(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('anime_quiz_user_data');
    localStorage.removeItem('anime_quiz_user');
    setUser(null);
    setActiveTab('quizzes');
  };

  const handleUpdateBackground = (quizId: string, url: string) => {
    const newBgs = { ...customBackgrounds, [quizId]: url };
    setCustomBackgrounds(newBgs);
    localStorage.setItem('anime_quiz_custom_bg', JSON.stringify(newBgs));
  };

  const handleResetBackground = (quizId: string) => {
    const newBgs = { ...customBackgrounds };
    delete newBgs[quizId];
    setCustomBackgrounds(newBgs);
    localStorage.setItem('anime_quiz_custom_bg', JSON.stringify(newBgs));
  };

  const handleUpdateCover = (quizId: string, url: string) => {
    const newCovers = { ...customCovers, [quizId]: url };
    setCustomCovers(newCovers);
    localStorage.setItem('anime_quiz_custom_cover', JSON.stringify(newCovers));
  };

  const handleResetCover = (quizId: string) => {
    const newCovers = { ...customCovers };
    delete newCovers[quizId];
    setCustomCovers(newCovers);
    localStorage.setItem('anime_quiz_custom_cover', JSON.stringify(newCovers));
  };

  const handleMagicImage = async (context: string, type: 'profile' | 'cover' | 'background', targetId?: string) => {
    setIsAILoadingImage(type);
    try {
      const url = await getAIGeneratedImage(context, type);
      if (type === 'profile') {
        if (user) {
          const newData = { ...user, photo: url };
          setUser(newData);
          localStorage.setItem('anime_quiz_user_data', JSON.stringify(newData));
        }
      } else if (type === 'cover' && targetId) {
        handleUpdateCover(targetId, url);
      } else if (type === 'background' && targetId) {
        handleUpdateBackground(targetId, url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAILoadingImage(null);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsConfiguring(false);
  };

  const handleOpenConfig = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsConfiguring(true);
  };

  const handleGenerateAIQuiz = async (animeName: string) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Gere um quiz sobre o anime "${animeName}" com exatamente 10 perguntas. 
      Retorne apenas um array JSON puro, sem markdown, seguindo esta estrutura:
      [
        {
          "id": "q1",
          "text": "Pergunta aqui?",
          "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
          "correctAnswer": 0
        }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "[]";
      const jsonContent = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const dynamicQuestions: Question[] = JSON.parse(jsonContent);

      const aiQuiz: Quiz = {
        id: `ai-${Date.now()}`,
        title: animeName,
        description: `Quiz gerado instantaneamente por IA sobre ${animeName}.`,
        category: 'IA Gerado',
        questions: dynamicQuestions,
      };

      setQuestionLimit(dynamicQuestions.length);
      setSelectedQuiz(aiQuiz);
      setIsConfiguring(false);
    } catch (error) {
      console.error("Erro ao gerar quiz por IA:", error);
      alert("Oops! A IA falhou em manifestar este quiz. Tente novamente ou escolha outro anime.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auth Guard
  if (!user) {
    return (
      <main className="min-h-screen jp-grid-bg flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="jp-card p-8 bg-white/90 backdrop-blur-sm max-w-sm w-full"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-brand-red p-3 border-2 border-brand-black rotate-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="font-display font-black text-4xl uppercase tracking-tighter text-center italic leading-none">
            Quiz de <span className="text-brand-red">Animes</span>
          </h2>
          
          {authMode !== 'recovery' && (
            <div className="flex border-2 border-brand-black mt-6 mb-6 overflow-hidden">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-grow py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${authMode === 'login' ? 'bg-brand-black text-white' : 'bg-white text-brand-black hover:bg-brand-red/5'}`}
              >
                Entrar
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={`flex-grow py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${authMode === 'register' ? 'bg-brand-black text-white' : 'bg-white text-brand-black hover:bg-brand-red/5'}`}
              >
                Cadastrar
              </button>
            </div>
          )}

          {authMode === 'recovery' ? (
            <div className="space-y-4">
              <button 
                onClick={() => setAuthMode('login')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-brand-black transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Voltar ao Login
              </button>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 text-center py-2">
                Recuperação de Conta
              </p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const identifier = (form.recovery_id as any).value;
                  const recoveredUser = registeredUsers.find(u => 
                    u.email.toLowerCase() === identifier.toLowerCase()
                  );
                  if (recoveredUser) {
                    alert(`Conta encontrada!\nUsuário: ${recoveredUser.name}\nSenha: ${recoveredUser.password}`);
                    setAuthMode('login');
                  } else {
                    alert('Nenhuma conta encontrada com este e-mail!');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/60 mb-2 block">
                    E-mail de Recuperação
                  </label>
                  <input 
                    name="recovery_id"
                    required
                    type="email" 
                    placeholder="Ex: seu@email.com"
                    className="w-full border-2 border-brand-black px-4 py-3 font-bold focus:outline-none focus:border-brand-red bg-brand-white"
                  />
                </div>
                <button type="submit" className="jp-button w-full">
                  Recuperar Conta
                </button>
              </form>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.username as any).value;
                const password = (form.password as any).value;
                
                if (authMode === 'register') {
                  const age = (form.age as any).value;
                  const email = (form.email as any).value;
                  handleLogin(name, email, password, null, age);
                } else {
                  handleLogin(name, '', password);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div className={authMode === 'register' ? "grid grid-cols-3 gap-4" : ""}>
                  <div className={authMode === 'register' ? "col-span-2" : ""}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/60 mb-2 block">
                      {authMode === 'register' ? 'Nome do Jogador' : 'Nome ou E-mail'}
                    </label>
                    <input 
                      name="username"
                      required
                      type="text" 
                      placeholder={authMode === 'register' ? "Ex: Uzumaki Naruto" : "Nome ou E-mail"}
                      className="w-full border-2 border-brand-black px-4 py-3 font-bold focus:outline-none focus:border-brand-red bg-brand-white"
                    />
                  </div>
                  {authMode === 'register' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/60 mb-2 block">
                        Idade
                      </label>
                      <input 
                        name="age"
                        required
                        type="number" 
                        placeholder="18"
                        className="w-full border-2 border-brand-black px-4 py-3 font-bold focus:outline-none focus:border-brand-red bg-brand-white"
                      />
                    </div>
                  )}
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/60 mb-2 block">
                      E-mail de Login
                    </label>
                    <input 
                      name="email"
                      required
                      type="email" 
                      placeholder="email@exemplo.com"
                      className="w-full border-2 border-brand-black px-4 py-3 font-bold focus:outline-none focus:border-brand-red bg-brand-white"
                    />
                  </div>
                )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/60 mb-2 block">
                  Senha
                </label>
                <div className="relative">
                  <input 
                    name="password"
                    required
                    type={showPassword ? "text" : "password"} 
                    placeholder="********"
                    className="w-full border-2 border-brand-black px-4 py-3 font-bold focus:outline-none focus:border-brand-red bg-brand-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/40 hover:text-brand-red transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="jp-button w-full">
              {authMode === 'login' ? 'Entrar na Jornada' : 'Criar Conta'}
            </button>
            {authMode === 'login' && (
              <button 
                type="button"
                onClick={() => setAuthMode('recovery')}
                className="w-full text-[10px] font-bold uppercase tracking-widest text-brand-black/40 hover:text-brand-red transition-colors text-center mt-2"
              >
                Esqueceu a senha?
              </button>
            )}
          </form>
          )}
        </motion.div>
      </main>
    );
  }

  // Introduction Screen (only once after login/register)
  if (showIntro) {
    return (
      <main className="min-h-screen jp-grid-bg flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-[2px] z-0"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center z-10"
        >
          <div className="w-1 bg-brand-red h-12 mx-auto mb-6"></div>
          <h2 className="text-white font-display font-black text-4xl uppercase mb-6 italic">
            Bem-vindo, <span className="text-brand-red">{user.name}</span>!
          </h2>
          <div className="space-y-4 text-white/80 font-medium text-lg leading-relaxed mb-10">
            <p>Sua missão é testar seus conhecimentos em diversos universos de anime e alcançar o posto de mestre.</p>
            <p>Ganhe estrelas, suba no ranking Top 10 e use nossa IA para descobrir novos desafios personalizados.</p>
          </div>
          <button 
            onClick={() => setShowIntro(false)}
            className="jp-button bg-white text-brand-black border-white hover:bg-brand-red hover:text-white"
          >
            Começar Agora
          </button>
        </motion.div>
      </main>
    );
  }

  // Quiz Session
  if (selectedQuiz && !isConfiguring) {
    return (
      <main className="min-h-screen jp-grid-bg">
        <QuizSession 
          quiz={{...selectedQuiz, backgroundImage: customBackgrounds[selectedQuiz.id] || selectedQuiz.backgroundImage || ""}} 
          questionCount={questionLimit} 
          onClose={() => setSelectedQuiz(null)} 
        />
      </main>
    );
  }

  // Main App
  return (
    <div className="min-h-screen jp-grid-bg flex flex-col font-sans text-brand-black">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-brand-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-6"
          >
            <Sparkles className="w-16 h-16 text-brand-yellow" />
          </motion.div>
          <h2 className="font-display font-black text-3xl md:text-5xl uppercase italic tracking-tighter text-center px-4">
            Invocando a Sabedoria <br /> <span className="text-brand-red">da Inteligência Artificial...</span>
          </h2>
          <p className="mt-4 font-bold uppercase tracking-widest text-brand-yellow animate-pulse">
            Criando perguntas épicas agora mesmo
          </p>
          <div className="mt-8 flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                className="w-3 h-3 bg-brand-red border-2 border-white rounded-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-brand-black text-white p-6 md:p-8 flex items-center justify-between border-b-4 border-brand-red shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-brand-red p-2 border-2 border-white rotate-3">
             <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl md:text-5xl uppercase italic tracking-tighter leading-none">
              Quiz de <span className="text-brand-red">Animes</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1 opacity-60">
              Desafie o seu espírito otaku
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-4">
            <button 
              onClick={() => setActiveTab('quizzes')}
              className={`font-display font-bold uppercase transition-all pb-1 border-b-2 ${activeTab === 'quizzes' ? 'border-brand-red text-brand-red' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              Quizzes
            </button>
            <button 
              onClick={() => setActiveTab('ranking')}
              className={`font-display font-bold uppercase transition-all pb-1 border-b-2 ${activeTab === 'ranking' ? 'border-brand-red text-brand-red' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              Top 10
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`font-display font-bold uppercase transition-all pb-1 border-b-2 ${activeTab === 'profile' ? 'border-brand-red text-brand-red' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              Perfil
            </button>
          </nav>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red leading-none mb-1">Jogador</span>
              <span className="text-sm font-black uppercase tracking-tight leading-none">{user.name}</span>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 bg-brand-white text-brand-black flex items-center justify-center border-2 border-brand-red shadow-[2px_2px_0px_0px_rgba(230,57,70,1)] overflow-hidden"
            >
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-6 h-6" />
              )}
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-brand-red transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'quizzes' && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
              id="quizzes-grid"
            >
              <div className="text-center md:text-left">
                <h2 className="font-display font-black text-4xl uppercase tracking-tight mb-2">
                   Escolha seu Anime
                </h2>
                <p className="text-brand-black/60 max-w-2xl font-medium">
                  Selecione um título abaixo e teste seus conhecimentos. Você pode escolher quantas questões deseja responder antes de começar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {QUIZZES.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="jp-card group flex flex-col h-full bg-brand-black overflow-hidden relative border-brand-black"
                  >
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={customCovers[quiz.id] || quiz.coverImage || customBackgrounds[quiz.id] || quiz.backgroundImage} 
                        alt="" 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent"></div>
                    </div>
                    <div className="h-1 bg-brand-red w-full relative z-10"></div>
                    <div className="p-6 flex flex-col flex-grow relative z-10 text-white">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 font-bold uppercase tracking-widest">
                          {quiz.category}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleOpenConfig(quiz)}
                            className="w-6 h-6 border-2 border-white/20 flex items-center justify-center bg-black/40 hover:bg-brand-red hover:text-white transition-colors text-white backdrop-blur-sm"
                            title="Configurar Quiz"
                          >
                            <Settings2 className="w-3 h-3" />
                          </button>
                          <div className="w-6 h-6 border-2 border-white/20 flex items-center justify-center font-bold text-[10px] bg-black/40 text-white backdrop-blur-sm">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-display font-black text-2xl uppercase italic mb-2 tracking-tight group-hover:text-brand-red transition-colors drop-shadow-md">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-white/70 mb-6 flex-grow leading-relaxed line-clamp-2">
                        {quiz.description}
                      </p>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleOpenConfig(quiz)}
                          className="jp-button flex-grow flex items-center justify-center gap-2 bg-white text-brand-black border-white hover:bg-brand-red hover:text-white"
                        >
                          <Play className="w-4 h-4" /> Começar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <AIRecommendations onSelectAnime={handleGenerateAIQuiz} />
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Ranking />
            </motion.div>
          )}

          {activeTab === 'profile' && user && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="jp-card bg-white/90 backdrop-blur-md p-8 overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(29,29,27,1)]">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                   <Trophy className="w-full h-full text-brand-black rotate-12" />
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                  <div className="flex-shrink-0 relative group">
                    <label className="cursor-pointer block w-32 h-32 rounded-full border-4 border-brand-red p-1 bg-white shadow-xl relative overflow-hidden group">
                      <div className="w-full h-full rounded-full bg-brand-white overflow-hidden flex items-center justify-center group-hover:bg-brand-red/5 transition-colors">
                        {user.photo ? (
                          <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon className="w-16 h-16 text-brand-black/20" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Settings2 className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const newData = { ...user, photo: reader.result as string };
                              setUser(newData);
                              localStorage.setItem('anime_quiz_user_data', JSON.stringify(newData));
                              
                              // Also update in registeredUsers
                              const updatedRegistered = registeredUsers.map(u => 
                                u.name === user.name ? newData : u
                              );
                              setRegisteredUsers(updatedRegistered);
                              localStorage.setItem('anime_quiz_all_users', JSON.stringify(updatedRegistered));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button 
                      onClick={() => handleMagicImage(user.name, 'profile')}
                      disabled={isAILoadingImage === 'profile'}
                      className="absolute bottom-0 right-0 z-20 bg-brand-black text-white p-2 rounded-full border-2 border-white hover:bg-brand-red transition-all shadow-lg"
                      title="Trocar avatar com IA"
                    >
                       {isAILoadingImage === 'profile' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex-grow text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                      Perfil do Jogador
                    </div>
                    <h2 className="font-display font-black text-4xl uppercase italic leading-none mb-2">{user.name}</h2>
                    <p className="text-brand-red font-bold uppercase text-xs tracking-widest mb-6">Mestre Ninja em Ascensão</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">E-mail</span>
                        <p className="font-bold text-brand-black">{user.email || 'Não informado'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Idade</span>
                        <p className="font-bold text-brand-black">{user.age || '--'} anos</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Membro desde</span>
                        <p className="font-bold text-brand-black">{user.joinDate}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Nível Otaku</span>
                        <p className="font-bold text-brand-red">Rank S</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 pt-8 border-t-2 border-brand-black/10 grid grid-cols-3 gap-4 text-center">
                   <div className="p-4 bg-brand-white border-2 border-brand-black/5">
                      <span className="block text-2xl font-black text-brand-black">0</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Quizzes</span>
                   </div>
                   <div className="p-4 bg-brand-white border-2 border-brand-black/5">
                      <span className="block text-2xl font-black text-brand-black">0</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Vitórias</span>
                   </div>
                   <div className="p-4 bg-brand-white border-2 border-brand-black/5">
                      <span className="block text-2xl font-black text-brand-black">0</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Estrelas</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Mobile Nav */}
      <footer className="md:hidden sticky bottom-0 bg-brand-black border-t-4 border-brand-red p-4 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('quizzes')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'quizzes' ? 'text-brand-red' : 'text-white/60'}`}
        >
          <Play className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Quizzes</span>
        </button>
        <button 
          onClick={() => setActiveTab('ranking')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'ranking' ? 'text-brand-red' : 'text-white/60'}`}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Top 10</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-brand-red' : 'text-white/60'}`}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Perfil</span>
        </button>
      </footer>

      {/* Config Modal */}
      <AnimatePresence>
        {isConfiguring && selectedQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsConfiguring(false)}
              className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              className="relative w-full max-w-lg bg-brand-white border-4 border-brand-black jp-card shadow-[12px_12px_0px_0px_rgba(230,57,70,1)] p-8 overflow-y-auto max-h-[90vh]"
              id="quiz-config-modal"
            >
              <div className="flex justify-between items-center mb-6 border-b-2 border-brand-black pb-4">
                <h3 className="font-display font-black text-2xl uppercase italic">
                  Configurar Quiz: {selectedQuiz.title}
                </h3>
                <button onClick={() => setIsConfiguring(false)} className="text-brand-black hover:text-brand-red">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Number of Questions */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-black/60 mb-3 block">
                    Número de Questões
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[5, 10, 15].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuestionLimit(num)}
                        className={`py-3 font-bold border-2 border-brand-black transition-all ${
                          questionLimit === num 
                            ? 'bg-brand-red text-white shadow-none translate-x-[1px] translate-y-[1px]' 
                            : 'bg-white hover:bg-brand-red/5'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="Custom"
                        className={`w-full py-3 px-2 font-bold border-2 border-brand-black focus:outline-none focus:border-brand-red text-center ${[5,10,15].includes(questionLimit) ? 'bg-white' : 'bg-brand-red text-white'}`}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) setQuestionLimit(val);
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-black/40 italic">
                    Escolha um dos padrões ou digite um valor personalizado.
                  </p>
                </div>

                {/* Appearance Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-black/60 block mb-0">
                        Foto de Capa
                      </label>
                      {customCovers[selectedQuiz.id] && (
                        <button 
                          onClick={() => handleResetCover(selectedQuiz.id)}
                          className="text-[9px] font-black uppercase text-brand-red hover:underline hover:text-brand-black transition-colors"
                        >
                          Restaurar Padrão
                        </button>
                      )}
                    </div>
                    <div className="relative aspect-video border-2 border-dashed border-brand-black/20 hover:border-brand-red transition-colors bg-brand-white overflow-hidden group">
                      <img 
                        src={customCovers[selectedQuiz.id] || selectedQuiz.coverImage || customBackgrounds[selectedQuiz.id] || selectedQuiz.backgroundImage} 
                        alt="" 
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 hover:bg-black/10 transition-colors">
                        <div className="flex gap-2 mb-2">
                          <label className="cursor-pointer bg-white p-2 rounded-md shadow-sm border border-brand-black/10 hover:bg-brand-red hover:text-white transition-all">
                            <Settings2 className="w-5 h-5" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => handleUpdateCover(selectedQuiz.id, reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <button 
                            onClick={() => handleMagicImage(selectedQuiz.title, 'cover', selectedQuiz.id)}
                            disabled={isAILoadingImage === 'cover'}
                            className="bg-brand-red text-white p-2 rounded-md shadow-sm border border-brand-black/10 hover:bg-brand-black transition-all"
                          >
                            {isAILoadingImage === 'cover' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 text-white" />}
                          </button>
                        </div>
                        <span className="text-[9px] font-bold uppercase">Alterar Capa</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-black/60 block mb-0">
                        Foto de Fundo (Quiz)
                      </label>
                      {customBackgrounds[selectedQuiz.id] && (
                        <button 
                          onClick={() => handleResetBackground(selectedQuiz.id)}
                          className="text-[9px] font-black uppercase text-brand-red hover:underline hover:text-brand-black transition-colors"
                        >
                          Restaurar Padrão
                        </button>
                      )}
                    </div>
                    <div className="relative aspect-video border-2 border-dashed border-brand-black/20 hover:border-brand-red transition-colors bg-brand-white overflow-hidden group">
                      <img 
                        src={customBackgrounds[selectedQuiz.id] || selectedQuiz.backgroundImage} 
                        alt="" 
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 hover:bg-black/10 transition-colors">
                        <div className="flex gap-2 mb-2">
                          <label className="cursor-pointer bg-white p-2 rounded-md shadow-sm border border-brand-black/10 hover:bg-brand-red hover:text-white transition-all">
                            <Sparkles className="w-5 h-5" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => handleUpdateBackground(selectedQuiz.id, reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <button 
                            onClick={() => handleMagicImage(selectedQuiz.title, 'background', selectedQuiz.id)}
                            disabled={isAILoadingImage === 'background'}
                            className="bg-brand-red text-white p-2 rounded-md shadow-sm border border-brand-black/10 hover:bg-brand-black transition-all"
                          >
                           {isAILoadingImage === 'background' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 text-white" />}
                          </button>
                        </div>
                        <span className="text-[9px] font-bold uppercase">Alterar Fundo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-black text-white p-4 text-[10px] flex gap-3 items-start">
                  <Info className="w-4 h-4 flex-shrink-0 text-brand-yellow" />
                  <p className="font-bold leading-normal uppercase">
                    Personalize sua experiência! Você pode mudar a capa do card e o fundo que aparece enquanto responde.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsConfiguring(false)}
                    className="jp-button-secondary flex-grow py-4"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={() => startQuiz(selectedQuiz)}
                    className="jp-button flex-grow flex items-center justify-center gap-2 py-4"
                  >
                    INICIAR QUIZ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-4 text-center text-brand-black/20 text-[10px] font-bold uppercase tracking-widest mb-16 md:mb-0">
        Desenvolvido com inspiração no Japão &copy; 2024
      </div>
    </div>
  );
}
