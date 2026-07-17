// src/components/ui/AnimatedCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Card } from './Card'; // Import the base Card we built earlier

interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedCard({ children, index = 0, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // Multiply the index by 0.1 to stagger the delay (e.g., item 3 delays by 0.3s)
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.25, 0, 1] // Custom bezier curve for a smooth deceleration
      }}
      className={className}
    >
      {/* We wrap our existing Card component so we don't have to rewrite the styling logic */}
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
}