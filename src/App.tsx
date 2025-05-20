import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { AdminDashboard } from "./AdminDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function App() {
  const isAdmin = useQuery(api.school.isAdmin);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-red-800 to-red-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            {/* Optional: Add a school logo here */}
            {/* <img src="/school-logo.png" alt="School Logo" className="h-10 w-10" /> */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">St Lawrence Unaided English Medium High School</h1>
              <p className="text-sm text-red-200">Bondel, Mangalore - 575008</p>
            </div>
          </motion.div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1">
        <Unauthenticated>
          <div className="max-w-lg mx-auto mt-16 sm:mt-24 p-6 sm:p-8 bg-white rounded-xl shadow-xl border border-gray-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              <h2 className="text-3xl font-bold text-red-800 mb-3">Welcome to St Lawrence</h2>
              <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200 mb-4">
                <p className="font-medium text-lg">👋 Visitors Welcome!</p>
                <p className="text-sm mt-1">
                  Click "Sign in anonymously" below to explore our website.
                  No registration required!
                </p>
              </div>
              <p className="text-gray-700">
                For administrators: Please sign in with your credentials.
              </p>
            </motion.div>
            <SignInForm />
          </div>
        </Unauthenticated>
        
        <Authenticated>
          {isAdmin ? <AdminDashboard /> : <VisitorContent />}
        </Authenticated>
      </main>
      <Toaster position="top-right" />

      <footer className="bg-red-800 text-red-100 p-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <p>St Lawrence English Medium School</p>
            <p>Bondel, Mangalore - 575008</p>
            <p>Karnataka, India</p>
            <p className="mt-2">Email: <a href="mailto:info@stlawrence.edu" className="hover:text-white">info@stlawrence.edu</a></p>
            <p>Phone: <a href="tel:+917975214527" className="hover:text-white">+91 7975214527</a></p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Admissions</a></li>
              <li><a href="#" className="hover:text-white">Academics</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">Facebook</a>
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-red-700 text-xs">
          <p>Managed by Chef.AI and Convex. Made by FUNMAKERZ.</p>
          <p>© {new Date().getFullYear()} St Lawrence English Medium School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function VisitorContent() {
  const [activePage, setActivePage] = useState<'home' | 'about' | 'contact'>('home');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const announcements = useQuery(api.school.listAnnouncements);
  const events = useQuery(api.school.listEvents);
  const facilities = useQuery(api.school.listFacilities);
  const achievements = useQuery(api.school.listAchievements);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: 20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <motion.div
      className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 ${className}`}
      whileHover={{ y: -5 }}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl font-bold mb-8 text-red-800 tracking-tight">{children}</h2>
  );

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-md py-3 mb-8 sticky top-[72px] z-40"> {/* Adjusted sticky position */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex space-x-6 sm:space-x-8 justify-center">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About & Facilities' },
              { id: 'contact', label: 'Contact Us' },
            ].map(page => (
              <li key={page.id}>
                <button
                  onClick={() => setActivePage(page.id as 'home' | 'about' | 'contact')}
                  className={`text-base sm:text-lg font-medium pb-2 transition-colors border-b-2 ${
                    activePage === page.id 
                      ? 'text-red-700 border-red-700' 
                      : 'text-gray-600 hover:text-red-700 border-transparent hover:border-red-300'
                  }`}
                >
                  {page.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {activePage === 'home' && (
          <motion.div
            key="home"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.div 
              className="relative bg-gradient-to-br from-red-700 to-red-500 rounded-2xl p-10 sm:p-16 text-center text-white overflow-hidden mb-12 sm:mb-16 shadow-2xl"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6">Welcome to St Lawrence</h2>
              <h3 className="text-2xl sm:text-3xl mb-3 sm:mb-4">Unaided English Medium High School</h3>
              <p className="text-xl sm:text-2xl text-red-100">Nurturing Excellence, Building Character</p>
              <p className="text-lg sm:text-xl text-red-100 mt-3 sm:mt-4">Bondel, Mangalore - 575008</p>
            </motion.div>

            <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
              <SectionTitle>Latest Updates</SectionTitle>
              <div className="grid gap-6 sm:gap-8">
                {announcements?.length === 0 && <p className="text-gray-600">No announcements at this time.</p>}
                {announcements?.map((announcement) => (
                  <Card key={announcement._id} className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {announcement.imageUrl && (
                      <img 
                        src={announcement.imageUrl} 
                        alt={announcement.title}
                        className="w-full sm:w-48 h-48 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 sm:mb-3">
                        <h3 className="text-xl sm:text-2xl font-semibold text-red-700">{announcement.title}</h3>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0 text-left sm:text-right">
                          <p>{new Date(announcement.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p>{new Date(announcement.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="font-medium text-red-600 mt-1">Posted by Admin</p>
                        </div>
                      </div>
                      <div className={`text-gray-700 ${expandedItem === announcement._id ? "" : "line-clamp-3"}`}>
                        <p>{announcement.content}</p>
                      </div>
                      <button
                        onClick={() => setExpandedItem(expandedItem === announcement._id ? null : announcement._id)}
                        className="text-red-600 hover:text-red-700 mt-2 font-medium text-sm"
                      >
                        {expandedItem === announcement._id ? "Show Less" : "Read More"}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
              <SectionTitle>Upcoming Events</SectionTitle>
              {events?.length === 0 && <p className="text-gray-600">No upcoming events scheduled.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {events?.map((event) => (
                  <Card key={event._id}>
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-semibold text-red-700 mb-2">{event.title}</h3>
                    <div className={`text-gray-700 text-sm mb-2 ${expandedItem === event._id ? "" : "line-clamp-3"}`}>
                      <p>{event.description}</p>
                    </div>
                     <button
                        onClick={() => setExpandedItem(expandedItem === event._id ? null : event._id)}
                        className="text-red-600 hover:text-red-700 mb-2 font-medium text-sm"
                      >
                        {expandedItem === event._id ? "Show Less" : "Read More"}
                      </button>
                    <div className="space-y-1 mt-auto pt-2 border-t border-gray-200">
                      <p className="text-red-600 font-medium text-sm">{event.venue}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}

        {activePage === 'about' && (
          <motion.div
            key="about"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
              <SectionTitle>About Us</SectionTitle>
              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 sm:mb-8 text-center">
                  {[
                    { label: 'Students', value: '1000+' },
                    { label: 'Teachers', value: '50+' },
                    { label: 'Years of Excellence', value: '25+' }
                  ].map(stat => (
                    <div key={stat.label} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h3 className="text-3xl sm:text-4xl font-bold text-red-700 mb-1">{stat.value}</h3>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  St Lawrence English Medium School has been a beacon of educational excellence since its establishment.
                  Our mission is to provide quality education that nurtures both academic excellence and character development.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We believe in holistic development, combining traditional values with modern educational methods to prepare
                  our students for the challenges of tomorrow. Our dedicated faculty and comprehensive curriculum ensure a
                  supportive and stimulating learning environment.
                </p>
              </Card>
            </motion.section>

            <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
              <SectionTitle>Our Facilities</SectionTitle>
              {facilities?.length === 0 && <p className="text-gray-600">Facility details coming soon.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {facilities?.map((facility) => (
                  <Card key={facility._id}>
                    {facility.imageUrl && (
                      <img 
                        src={facility.imageUrl} 
                        alt={facility.name}
                        className="w-full h-56 sm:h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-semibold text-red-700 mb-2">{facility.name}</h3>
                    <div className={`text-gray-700 text-sm ${expandedItem === facility._id ? "" : "line-clamp-3"}`}>
                      <p>{facility.description}</p>
                    </div>
                    <button
                      onClick={() => setExpandedItem(expandedItem === facility._id ? null : facility._id)}
                      className="text-red-600 hover:text-red-700 mt-2 font-medium text-sm"
                    >
                      {expandedItem === facility._id ? "Show Less" : "Read More"}
                    </button>
                  </Card>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <SectionTitle>Our Achievements</SectionTitle>
              {achievements?.length === 0 && <p className="text-gray-600">Information about achievements will be updated soon.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {achievements?.map((achievement) => (
                  <Card key={achievement._id}>
                    {achievement.imageUrl && (
                      <img 
                        src={achievement.imageUrl} 
                        alt={achievement.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-semibold text-red-700 mb-2">{achievement.title}</h3>
                     <div className={`text-gray-700 text-sm mb-2 ${expandedItem === achievement._id ? "" : "line-clamp-3"}`}>
                      <p>{achievement.description}</p>
                    </div>
                    <button
                      onClick={() => setExpandedItem(expandedItem === achievement._id ? null : achievement._id)}
                      className="text-red-600 hover:text-red-700 mb-2 font-medium text-sm"
                    >
                      {expandedItem === achievement._id ? "Show Less" : "Read More"}
                    </button>
                    <p className="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-200">
                      {new Date(achievement.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </Card>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}

        {activePage === 'contact' && (
          <motion.div
            key="contact"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
              <SectionTitle>Contact Us</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                <Card>
                  <h3 className="text-2xl font-semibold text-red-700 mb-4 sm:mb-6">Get in Touch</h3>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">Address</h4>
                      <p>St Lawrence English Medium School</p>
                      <p>Bondel, Opposite Daijiworld Private Limited</p>
                      <p>Mangalore, Karnataka - 575008, India</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">Phone</h4>
                      <p><a href="tel:+917975214527" className="hover:text-red-700">+91 7975214527</a></p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">Email</h4>
                      <p><a href="mailto:info@stlawrence.edu" className="hover:text-red-700">info@stlawrence.edu</a></p>
                      <p><a href="mailto:admissions@stlawrence.edu" className="hover:text-red-700">admissions@stlawrence.edu</a></p>
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <h3 className="text-2xl font-semibold text-red-700 mb-4 sm:mb-6">Office Hours</h3>
                  <div className="space-y-3 text-gray-700">
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">Monday - Friday</h4>
                      <p>8:00 AM - 4:00 PM</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">Saturday</h4>
                      <p>8:00 AM - 12:00 PM</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">Sunday</h4>
                      <p>Closed</p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.section>
            
            {/* Optional: Add a map here */}
            {/* <motion.section variants={itemVariants}>
              <SectionTitle>Our Location</SectionTitle>
              <Card>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.3900000000003!2d74.87000000000001!3d12.946000000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA4JzQ1LjYiTiA3NMKwMDInMTIuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="450" 
                    style={{ border:0 }} 
                    allowFullScreen={true} 
                    loading="lazy"
                    title="School Location Map"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </Card>
            </motion.section> */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
