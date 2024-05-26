import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export const Loader = () => {
  const controls = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      await controls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } });
      await controls2.start({ opacity: 1, y: 0, transition: { duration: 0.5 } });
      await controls3.start({ opacity: 0, y: -100, transition: { delay: 0.5, duration: 1 }, zIndex: 10});
    }
    sequence();
  }, [controls, controls2, controls3]);

  return (
    <motion.div 
        className=' w-full h-screen bg-black absolute z-50 grid place-content-center '
        animate={controls3}
        initial={{ opacity: 1, y: 0 }}
    >
        <motion.span 
            className=' text-orange-500 text-7xl font-medium '
            animate={controls}
            initial={{ opacity: 0, y: -50 }}
        >
            Tiny tasks are
        </motion.span>
        <motion.span 
            className=' text-orange-500 text-7xl font-medium '
            animate={controls2}
            initial={{ opacity: 0, y: -50 }}
        >
            effective to do
        </motion.span>
    </motion.div>
  )
}