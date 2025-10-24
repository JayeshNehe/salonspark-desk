import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full opacity-20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-secondary rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo/Icon */}
        <div className="mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-primary border border-white/20">
            <Scissors className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Hero text */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Salon
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              {' '}Pro
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Transform your salon business with our comprehensive management system
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="glass rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300">
            <Calendar className="w-8 h-8 mb-3 text-yellow-300" />
            <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-white/80">Effortless appointment management</p>
          </div>
          <div className="glass rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
            <Users className="w-8 h-8 mb-3 text-yellow-300" />
            <h3 className="text-lg font-semibold mb-2">Client Management</h3>
            <p className="text-white/80">Build lasting relationships</p>
          </div>
          <div className="glass rounded-2xl p-6 text-white hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
            <Sparkles className="w-8 h-8 mb-3 text-yellow-300" />
            <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-white/80">Data-driven insights</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-primary"
            >
              Sign In to Your Salon
            </Button>
          </Link>
          <Link to="/salon-registration">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-primary border-0"
            >
              Register New Salon
            </Button>
          </Link>
        </div>

        {/* Bottom text */}
        <p className="text-white/70 mt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          Join thousands of salons worldwide who trust SalonPro
        </p>
      </div>
    </div>
  );
};

export default Home;