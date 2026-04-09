import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isLatest?: boolean;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'max-w-[80%] px-4 py-2.5 text-sm',
          isUser && 'bg-teal-500 text-white rounded-md rounded-br-sm',
          isSystem && 'bg-teal-50 text-teal-700 rounded-md border border-teal-200',
          !isUser && !isSystem && 'bg-slate-100 text-slate-800 rounded-md rounded-bl-sm'
        )}
      >
        <p>{message.content}</p>
      </div>
    </motion.div>
  );
}