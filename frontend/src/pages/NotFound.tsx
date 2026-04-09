import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <h1 className="text-9xl font-bold text-slate-200">404</h1>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Page Not Found</h2>
          <p className="text-slate-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button icon={<Home className="w-5 h-5" />}>
                Go Home
              </Button>
            </Link>
            <Link to="-1">
              <Button variant="secondary" icon={<ArrowLeft className="w-5 h-5" />}>
                Go Back
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}