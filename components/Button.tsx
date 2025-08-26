'use client';

import { cn } from '@/app/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const buttonVariants = {
  default: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded',
  outline: 'border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100',
};

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return <button className={cn(buttonVariants[variant], className)} {...props} />;
}
