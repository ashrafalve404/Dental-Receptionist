import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SuggestionChipsProps {
  suggestions: { id: string; label: string; icon: LucideIcon }[];
  onSelect: (id: string) => void;
}

export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-2 px-4 py-3"
    >
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <motion.button
            key={suggestion.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(suggestion.id)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium
                     text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700
                     transition-all duration-200 shadow-sm flex items-center gap-1.5"
          >
            <Icon className="w-4 h-4" />
            {suggestion.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
}