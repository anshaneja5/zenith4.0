"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const Home = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: "shield-check",
      title: "Secure, Anonymous Reporting",
      description:
        "Report incidents securely with complete anonymity. Attach evidence like photos, screenshots, and audio recordings to strengthen your case.",
    },
    {
      icon: "scale",
      title: "AI-Powered Legal Guidance",
      description:
        "Get personalized legal advice in simple language. Our system adapts guidance based on your location and applicable laws.",
    },
    {
      icon: "file-text",
      title: "Smart Document Generation",
      description:
        "Create professional complaints, legal letters, and affidavits automatically. Our AI ensures documents are complete and clear.",
    },
    {
      icon: "languages",
      title: "Multilingual Support",
      description:
        "Access all features in multiple languages including regional Indian languages, with convenient voice input/output options.",
    },
    {
      icon: "users",
      title: "Resource Matching",
      description:
        "Connect with local NGOs, legal aid, counseling, and support services tailored to your specific situation and location.",
    },
    {
      icon: "graduation-cap",
      title: "Educational Resources",
      description:
        "Browse curated articles, videos, and FAQs about rights and self-protection, with personalized recommendations.",
    },
    {
      icon: "message-square",
      title: "Community Support",
      description:
        "Join moderated forums to share experiences, seek advice, and support others in a safe, respectful environment.",
    },
  ]

  const testimonials = [
    {
      quote:
        "Nyaay.AI helped me understand my rights and guided me through the process of filing a workplace harassment complaint. The AI assistant was available whenever I needed advice.",
      name: "Priya S.",
      location: "Mumbai",
    },
    {
      quote:
        "I was able to access legal resources in my native language, which made all the difference. The document generation tool helped me prepare a formal complaint that was taken seriously.",
      name: "Lakshmi R.",
      location: "Chennai",
    },
    {
      quote:
        "The community forum connected me with others who had similar experiences. The emotional support combined with practical legal guidance gave me the courage to take action.",
      name: "Aisha K.",
      location: "Delhi",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Women Supported" },
    { number: "24/7", label: "AI Assistance" },
    { number: "15+", label: "Languages" },
    { number: "500+", label: "Legal Resources" },
  ]

  const scrollToFeatures = () => {
    document.getElementById("features-section").scrollIntoView({
      behavior: "smooth",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading Nyaay.AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-50 to-pink-50 py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                AI-Powered Legal Support
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Nyaay.AI
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-xl">
                Empowering women across India with accessible legal support, resources, and community through the power
                of artificial intelligence.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/get-started"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
                >
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                <Link
                  to="/legal-guidance"
                  className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-purple-500 text-purple-600 font-medium text-lg hover:bg-purple-50 transition duration-300"
                >
                  Learn More
                </Link>
              </div>

              <button
                onClick={scrollToFeatures}
                className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors duration-300 mt-16 mx-auto md:mx-0"
              >
                <span className="text-sm mb-2">Explore our features</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-purple-100 transform hover:-translate-y-2 transition duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-3">My Ambar Success Story</h3>
                <p className="text-gray-600 mb-6">
                  In less than a year of its launch, My Ambar has gained tremendous popularity in India, helping
                  thousands of women across multiple cities and towns.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">17K+</p>
                    <p className="text-sm text-gray-500">Active Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">450+</p>
                    <p className="text-sm text-gray-500">NGOs & Legal Advisors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">24/7</p>
                    <p className="text-sm text-gray-500">Support Available</p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-100 rounded-full opacity-70 z-0"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-100 rounded-full opacity-70 z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-purple-50 rounded-2xl p-8 h-full">
              <div className="mb-10">
                <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Our Mission
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To empower women across India with accessible, AI-powered legal support and resources, breaking down
                  barriers to justice and creating a safer, more equitable society.
                </p>
              </div>

              <div>
                <h3 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Our Vision
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  A world where every woman has equal access to legal support and resources, where technology bridges
                  the gap between justice and those who need it most, empowering individuals to stand up for their
                  rights with confidence.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-semibold tracking-wider text-purple-600 uppercase">OUR PURPOSE</p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Mission & Vision</h2>

              <div className="w-20 h-1 bg-pink-500"></div>

              <p className="text-lg text-gray-600 leading-relaxed">
                At Nyaay.AI, we believe that every woman deserves access to justice and legal support. Our platform
                combines cutting-edge AI technology with legal expertise to provide comprehensive, accessible, and
                personalized assistance to women facing legal challenges.
              </p>

              <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-purple-600 mr-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-gray-600 italic">
                  "We're committed to breaking down barriers to justice through technology, making legal support
                  accessible to all women regardless of their background or resources."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features-section" className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold tracking-wider text-purple-600 uppercase mb-2">WHAT WE OFFER</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">
              Our platform combines cutting-edge AI technology with legal expertise to provide comprehensive support for
              women facing harassment and abuse.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-purple-100 transition duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3 mr-4">
                    {feature.icon === "shield-check" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    )}
                    {feature.icon === "scale" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                        />
                      </svg>
                    )}
                    {feature.icon === "file-text" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    {feature.icon === "languages" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                    )}
                    {feature.icon === "users" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    )}
                    {feature.icon === "graduation-cap" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                        />
                      </svg>
                    )}
                    {feature.icon === "message-square" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12">Making a Difference</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </p>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold tracking-wider text-purple-600 uppercase mb-2">SUCCESS STORIES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Testimonials</h2>
            <p className="text-lg text-gray-600">
              Hear from women who have found support, guidance, and empowerment through our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl p-8 border border-purple-100 transition duration-300 transform hover:-translate-y-2 flex flex-col"
              >
                <div className="text-4xl text-purple-400 mb-4">"</div>
                <p className="text-gray-600 italic flex-grow mb-6">{testimonial.quote}</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-purple-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-xl border border-purple-100 p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
              Ready to Take Control of Your Legal Journey?
            </h2>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands of women who have found support, guidance, and empowerment through Nyaay.AI. Our platform
              is designed to make legal resources accessible to everyone.
            </p>

            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
            >
              Get Started Today
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
