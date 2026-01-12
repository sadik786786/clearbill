export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white font-bold">i</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Our <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Platform</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A modern, intuitive invoicing & client management solution designed to streamline your business operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* What it does */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What This Platform Does</h2>
            </div>
            <ul className="space-y-4">
              {[
                { icon: '👥', text: 'Centralized client management system' },
                { icon: '🧾', text: 'Professional invoice creation and tracking' },
                { icon: '📊', text: 'Comprehensive business dashboard with insights' },
                { icon: '💰', text: 'Real-time monitoring of payment statuses' },
                { icon: '📈', text: 'Monthly revenue analytics and growth tracking' }
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xl mr-3 mt-0.5">{item.icon}</span>
                  <span className="text-gray-700">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why it matters */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why This System Matters</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed text-lg">
                In today's fast-paced business environment, efficiency is key. Our platform eliminates manual processes and complex spreadsheets, allowing you to focus on what matters most – growing your business.
              </p>
              <div className="bg-white/70 rounded-xl p-4 mt-6">
                <p className="text-gray-700 italic">
                  "Save up to 15 hours per month on administrative tasks and gain valuable insights into your business performance."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built With Modern Technology</h2>
            <p className="text-gray-600 text-lg">Reliable, scalable, and secure infrastructure</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Next.js', desc: 'App Router', color: 'bg-black text-white' },
              { name: 'React', desc: 'Components', color: 'bg-blue-600 text-white' },
              { name: 'Tailwind', desc: 'Styling', color: 'bg-teal-500 text-white' },
              { name: 'REST API', desc: 'Backend', color: 'bg-green-600 text-white' }
            ].map((tech, index) => (
              <div key={index} className="group">
                <div className={`${tech.color} rounded-xl p-6 text-center transition-transform duration-300 group-hover:-translate-y-2`}>
                  <div className="text-2xl font-bold mb-2">{tech.name}</div>
                  <div className="text-sm opacity-90">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Secure data encryption</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Real-time analytics</span>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Mobile responsive</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Streamline Your Business?</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of businesses already using our platform to save time and grow revenue.
          </p>
          <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
            Get Started Free
          </button>
        </div>

      </div>
    </div>
  );
}