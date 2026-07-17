'use client';

import { motion } from 'framer-motion';
import { Card } from './Card'; 

interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedCard({ children, index = 0, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }} 
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1, 
        ease: [0.25, 0.25, 0, 1] 
      }}
      className={className}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
}