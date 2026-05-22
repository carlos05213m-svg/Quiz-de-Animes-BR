import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Medal, User, Award, Calendar } from 'lucide-react';
import { QuizResult } from '../types';
import { getRankings } from '../lib/storage';
import StarDisplay from './StarDisplay';

export default function Ranking() {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    setResults(getRankings().slice(0, 10));
  }, []);

  if (results.length === 0) {
    return (
      <div className="text-center py-20 px-4" id="ranking-empty">
        <Award className="w-16 h-16 text-brand-black/10 mx-auto mb-4" />
        <h3 className="font-display font-bold text-2xl uppercase">Nenhum recorde ainda</h3>
        <p className="text-brand-black/60">Seja o primeiro a conquistar o topo!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id="ranking-list">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-5xl uppercase tracking-tighter mb-2 italic">
          Top 10 Heróis
        </h2>
        <div className="h-1 w-24 bg-brand-red mx-auto"></div>
      </div>

      <div className="space-y-4">
        {results.map((res, index) => (
          <motion.div
            key={`${res.timestamp}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`jp-card p-4 flex items-center gap-4 bg-white/80 backdrop-blur-sm ${
              index === 0 ? 'bg-brand-yellow/10 border-brand-yellow bg-stripes' : ''
            }`}
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-display font-black text-2xl italic">
              {index === 0 ? (
                <Medal className="w-8 h-8 text-brand-yellow" />
              ) : (
                index + 1
              )}
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg uppercase">{res.animeTitle}</span>
                <span className="text-[10px] bg-brand-black text-white px-2 py-0.5 font-bold uppercase tracking-widest hidden sm:inline">
                  {res.userName}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-brand-black/60 font-bold uppercase">
                <StarDisplay count={res.stars} size={14} />
                <span>{res.percentage.toFixed(0)}% de Acerto</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="font-display font-black text-2xl tracking-tighter">
                {res.score} PTS
              </div>
              <div className="text-[10px] text-brand-black/40 font-bold uppercase flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(res.timestamp).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="mt-8 text-center text-xs text-brand-black/40 font-bold uppercase tracking-widest">
        Apenas os 10 melhores resultados são mostrados aqui
      </p>
    </div>
  );
}
