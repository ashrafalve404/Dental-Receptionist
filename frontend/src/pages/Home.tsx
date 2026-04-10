import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Phone, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import SectionTitle from '../components/ui/SectionTitle';
import { SERVICES } from '../utils/constants';
import { getClinicInfo } from '../api/clinicApi';
import { ClinicInfo } from '../api/clinicApi';

export default function Home() {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  
  useEffect(() => {
    getClinicInfo().then(setClinicInfo).catch(() => setClinicInfo(null));
  }, []);

  const features = [
    { icon: Calendar, title: 'Smart Booking', description: 'Book appointments 24/7 with our AI assistant' },
    { icon: Clock, title: 'Instant Confirmation', description: 'Get immediate appointment confirmation' },
    { icon: Shield, title: 'Easy Management', description: 'Reschedule or cancel anytime' },
    { icon: Phone, title: 'Always Available', description: 'Round-the-clock clinic information' },
  ];

  const benefits = [
    'Expert dental professionals',
    'Modern equipment & technology',
    'Comfortable environment',
    'Affordable pricing',
    'Flexible appointment slots',
    'Follow-up care support',
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800">
          <img 
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80" 
            alt="Dental clinic" 
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Your Smile,<br />
              <span className="text-teal-400">Our Priority</span>
            </h1>
            
            <p className="text-lg text-slate-200 mb-8 leading-relaxed">
              Experience modern dental care with our AI-powered appointment system. 
              Book, manage, and track your dental visits with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/chat">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 border-none">
                  Start Chatting
                </Button>
              </Link>
              <Link to="/book">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Book Appointment
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-10 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Verified Clinic</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Expert Dentists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section with Image */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80" 
                alt="Dental treatment" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-teal-500 text-white p-6 rounded-lg shadow-lg">
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm">Years Experience</p>
              </div>
            </div>
            <div>
              <p className="text-teal-600 font-medium text-sm uppercase tracking-wide mb-2">About Us</p>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Quality Dental Care for Your Family</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                AS Clinic is dedicated to providing exceptional dental care in a comfortable and relaxing environment. 
                Our team of experienced professionals uses the latest technology to ensure you receive the best treatment possible.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle
            subtitle="Features"
            title="Why Choose AS Clinic"
            description="Modern dental care with AI-powered convenience"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-md bg-teal-50 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-teal-400 font-medium text-sm uppercase tracking-wide mb-2">Services</p>
            <h2 className="text-3xl font-bold">Our Dental Services</h2>
            <p className="text-slate-400 mt-2">Comprehensive care for the whole family</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-lg bg-slate-800 border border-slate-700 hover:border-teal-500 transition-all"
              >
                <div className="mb-3"><service.icon className="w-6 h-6 text-teal-500" /></div>
                <h3 className="text-base font-semibold mb-2">{service.name}</h3>
                <p className="text-sm text-slate-400">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-500">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Book Your Appointment?
            </h2>
            <p className="text-teal-100 text-lg mb-8">
              Start a conversation with our AI assistant now and get instant booking confirmation
            </p>
            <Link to="/chat">
              <Button 
                size="lg" 
                className="bg-white !text-black hover:bg-slate-100 border-none"
                icon={<ArrowRight className="w-5 h-5 text-black" />}
              >
                Start Chatting Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Clinic Info */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-teal-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-slate-800 mb-2">Location</h4>
              <p className="text-sm text-slate-500">{clinicInfo?.address || 'Loading...'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-teal-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-slate-800 mb-2">Contact</h4>
              <p className="text-sm text-slate-500">{clinicInfo?.phone || 'Loading...'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-teal-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-slate-800 mb-2">Hours</h4>
              <p className="text-sm text-slate-500">Sat - Thu: {clinicInfo?.opening_time || '...'} - {clinicInfo?.closing_time || '...'}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}