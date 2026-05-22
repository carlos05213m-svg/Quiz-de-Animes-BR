import { Star } from 'lucide-react';

interface StarDisplayProps {
  count: number;
  max?: number;
  size?: number;
}

export default function StarDisplay({ count, max = 5, size = 20 }: StarDisplayProps) {
  return (
    <div className="flex gap-1" id="star-display">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${
            i < count ? 'fill-brand-yellow text-brand-yellow' : 'text-brand-black/20'
          }`}
        />
      ))}
    </div>
  );
}
