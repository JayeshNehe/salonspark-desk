import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full opacity-20 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-secondary rounded-full opacity-20 blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.25, 0.2],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Main content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Icon */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-primary border border-white/20"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          >
            <Scissors className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>

        {/* Hero text */}
        <motion.div className="mb-12" variants={itemVariants}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Salon
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              {' '}Pro
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Transform your salon business with our comprehensive management system
          </p>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          variants={itemVariants}
        >
          {[
            { icon: Calendar, title: "Smart Scheduling", desc: "Effortless appointment management" },
            { icon: Users, title: "Client Management", desc: "Build lasting relationships" },
            { icon: Sparkles, title: "Analytics & Reports", desc: "Data-driven insights" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="glass rounded-2xl p-6 text-white"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <feature.icon className="w-8 h-8 mb-3 text-yellow-300" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          variants={itemVariants}
        >
          <Link to="/auth">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                size="lg" 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-8 py-4 text-lg font-semibold shadow-primary"
              >
                Sign In to Your Salon
              </Button>
            </motion.div>
          </Link>
          <Link to="/salon-registration">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-semibold shadow-primary border-0"
              >
                Register New Salon
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Bottom text */}
        <motion.p 
          className="text-white/70 mt-8"
          variants={itemVariants}
        >
          Join thousands of salons worldwide who trust SalonPro
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Home;