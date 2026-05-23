import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AIRecommendationsProps {
  onSelectAnime: (anime: string) => void;
}

export default function AIRecommendations({ onSelectAnime }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  async function fetchRecommendations(searchQuery?: string) {
    setLoading(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Erro ao buscar recomendações:", error);
      if (!searchQuery) {
        setRecommendations(['Hunter x Hunter', 'Jujutsu Kaisen', 'Attack on Titan', 'Death Note']);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations(query);
  };

  return (
    <div className="mt-12 p-6 jp-card bg-brand-red/5 border-dashed backdrop-blur-sm" id="ai-recommendations">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-red w-5 h-5 drop-shadow-[0_0_8px_rgba(230,57,70,0.5)]" />
          <h3 className="font-display font-bold uppercase tracking-tight">IA Sugere Próximos Quizzes</h3>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um anime que você gosta..."
            className="bg-white/80 backdrop-blur-sm border-2 border-brand-black px-3 py-1 text-xs font-bold focus:outline-none focus:border-brand-red w-full md:w-64"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-brand-black text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-red transition-colors disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(29,29,27,1)]"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </form>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4 gap-2 text-sm text-brand-black/60">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-bold uppercase tracking-tighter">Consultando a sabedoria dos animes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((anime, index) => (
            <motion.button
              key={`${anime}-${index}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectAnime(anime)}
              className="p-3 bg-white/70 backdrop-blur-sm border-2 border-brand-black text-center text-xs font-black uppercase italic tracking-tight shadow-[2px_2px_0px_0px_rgba(29,29,27,1)] hover:bg-brand-red hover:text-white transition-colors"
            >
              {anime}
            </motion.button>
          ))}
        </div>
      )}
      
      <p className="mt-4 text-[10px] text-brand-black/40 italic font-bold uppercase tracking-widest">
        Clique em um anime acima para gerar um quiz instantâneo com IA!
      </p>
    </div>
  );
}
