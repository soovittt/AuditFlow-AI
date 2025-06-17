"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  CheckCircle,
  BarChart3,
  Target,
  GitBranch,
  Users,
  Zap,
  ArrowRight,
  Menu,
  X,
  Code,
  Lock,
  FileCheck,
  AlertTriangle,
  Settings,
  Database,
  GitlabIcon as GitLab,
  Loader2,
} from "lucide-react"
import Link from "next/link"

export default function AuditFlowLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [scrollY, setScrollY] = useState(0)
  const [isConnecting, setIsConnecting] = useState(false)

  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    stats: useRef<HTMLElement>(null),
    features: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    cta: useRef<HTMLElement>(null),
  }

  const handleGitLabConnect = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch("http://localhost:8080/api/auth/gitlab/login")
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setIsConnecting(false)
        alert("Failed to get GitLab OAuth URL.")
      }
    } catch (err) {
      setIsConnecting(false)
      alert("Error connecting to GitLab.")
    }
  }

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    window.addEventListener("scroll", handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className={`flex items-center space-x-3 transition-all duration-700 ease-out ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AuditFlow</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-white/80 hover:text-white transition-colors duration-300">
              Features
            </Link>
            <Link href="#about" className="text-white/80 hover:text-white transition-colors duration-300">
              About
            </Link>
            <Button 
              onClick={handleGitLabConnect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GitLab className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-purple-900/95 backdrop-blur-sm border-t border-purple-600/30 animate-slide-down">
            <div className="px-6 py-4 space-y-4">
              <Link href="#features" className="block text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#about" className="block text-white/80 hover:text-white transition-colors">
                About
              </Link>
              <Button 
                onClick={handleGitLabConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <GitLab className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main ref={sectionRefs.hero} id="hero" className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className={`space-y-8 transition-all duration-1000 delay-300 ease-out ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
              }`}
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <div className="space-y-6">
                <Badge className="bg-purple-700/50 text-purple-100 border-purple-500/50 hover:scale-105 transition-transform duration-300 animate-bounce-in">
                  🚀 Automated GitLab Compliance
                </Badge>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white animate-slide-up">
                  Streamline Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                    GitLab
                  </span>{" "}
                  Compliance
                </h1>

                <p className="text-xl text-purple-100 leading-relaxed animate-slide-up animation-delay-200">
                  Automated compliance monitoring, intelligent reporting, and seamless GitLab integration for modern
                  development teams.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  { icon: CheckCircle, text: "Real-time compliance monitoring", color: "text-green-400" },
                  { icon: BarChart3, text: "Advanced analytics and insights", color: "text-blue-400" },
                  { icon: Target, text: "Automated security scanning", color: "text-purple-300" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 transition-all duration-700 ease-out hover:translate-x-2 animate-slide-right ${
                      isVisible ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"
                    }`}
                    style={{ animationDelay: `${600 + index * 200}ms` }}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color} flex-shrink-0`} />
                    <span className="text-lg text-white">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div
                className={`transition-all duration-1000 delay-1000 ease-out animate-slide-up ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
              >
                <Button
                  onClick={handleGitLabConnect}
                  disabled={isConnecting}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting to GitLab...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Make your repo the most compliant!
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Content - Welcome Card */}
            <div
              className={`transition-all duration-1000 delay-500 ease-out animate-slide-left ${
                isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
              style={{ transform: `translateY(${scrollY * -0.05}px)` }}
            >
              <Card className="bg-purple-800/40 backdrop-blur-sm border-purple-500/30 p-8 hover:scale-105 transition-all duration-500 shadow-2xl animate-float">
                <CardContent className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Welcome to AuditFlow</h3>
                    <p className="text-purple-100">Transform your GitLab repositories into compliance powerhouses</p>
                  </div>

                  <Button 
                    onClick={handleGitLabConnect}
                    disabled={isConnecting}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting to GitLab...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Make your repo the most compliant!
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-purple-200">
                    By connecting, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-white transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-purple-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Secure OAuth • 2FA Authentication</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section ref={sectionRefs.stats} id="stats" className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 max-w-2xl mx-auto">
            {[
              { number: "500M+", label: "Lines Scanned", icon: Code },
              { number: "25K+", label: "Repositories Scanned", icon: Database },
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center space-y-3 transition-all duration-700 ease-out hover:scale-105 animate-slide-up ${
                  visibleSections.has("stats") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{
                  transitionDelay: `${index * 200}ms`,
                  transform: `translateY(${visibleSections.has("stats") ? scrollY * 0.02 : 10}px)`,
                }}
              >
                <div className="w-16 h-16 bg-purple-600/30 rounded-xl flex items-center justify-center mx-auto hover:bg-purple-600/50 transition-colors duration-300">
                  <stat.icon className="w-8 h-8 text-purple-200" />
                </div>
                <div className="text-4xl font-bold text-white">{stat.number}</div>
                <div className="text-purple-200 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={sectionRefs.features} id="features" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center space-y-4 mb-16 transition-all duration-1000 ease-out animate-slide-up ${
              visibleSections.has("features") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-4xl font-bold text-white">Powerful Features for Modern Teams</h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Everything you need to maintain compliance and security across your GitLab repositories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Automated Compliance",
                description:
                  "Continuous monitoring of your repositories against industry standards and custom policies.",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Comprehensive dashboards and reports to track compliance metrics and trends.",
              },
              {
                icon: Zap,
                title: "Instant Alerts",
                description: "Get notified immediately when compliance issues are detected in your codebase.",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Built-in tools for teams to collaborate on compliance issues and remediation.",
              },
              {
                icon: GitBranch,
                title: "GitLab Integration",
                description: "Seamless integration with GitLab CI/CD pipelines and merge request workflows.",
              },
              {
                icon: Settings,
                title: "Custom Policies",
                description: "Define and enforce custom compliance policies tailored to your organization.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`bg-purple-800/30 backdrop-blur-sm border-purple-500/30 p-6 hover:bg-purple-700/40 transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-2 animate-slide-up ${
                  visibleSections.has("features") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  transform: visibleSections.has("features") ? `translateY(${scrollY * 0.01}px)` : "translateY(10px)",
                }}
              >
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-purple-100">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={sectionRefs.about} id="about" className="px-6 py-20 bg-purple-900/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2
            className={`text-4xl font-bold text-white transition-all duration-1000 ease-out animate-slide-up ${
              visibleSections.has("about") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            What is AuditFlow?
          </h2>

          <div
            className={`space-y-6 text-lg text-purple-100 leading-relaxed transition-all duration-1000 delay-200 ease-out animate-slide-up ${
              visibleSections.has("about") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <p>
              AuditFlow is a comprehensive GitLab compliance automation platform designed to streamline security and
              compliance monitoring for modern development teams. Our platform integrates seamlessly with your existing
              GitLab workflows to provide continuous, automated oversight of your codebase.
            </p>

            <p>
              By leveraging advanced analytics and intelligent reporting, AuditFlow helps organizations maintain
              regulatory compliance, enforce security policies, and reduce manual audit overhead. Whether you're working
              with GDPR, SOX, HIPAA, or custom organizational policies, AuditFlow ensures your development process
              remains compliant without slowing down your team.
            </p>

            <p>
              Our solution provides real-time monitoring, automated security scanning, and detailed compliance
              reporting, making it easier than ever to demonstrate adherence to industry standards and internal
              governance requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: FileCheck,
                title: "Compliance Automation",
                description: "Automatically monitor and enforce compliance policies across all repositories",
              },
              {
                icon: AlertTriangle,
                title: "Risk Detection",
                description: "Identify potential security and compliance risks before they become issues",
              },
              {
                icon: Lock,
                title: "Security First",
                description: "Built with enterprise-grade security and privacy protection in mind",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`space-y-4 transition-all duration-700 ease-out animate-slide-up ${
                  visibleSections.has("about") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{
                  transitionDelay: `${400 + index * 200}ms`,
                  transform: visibleSections.has("about") ? `translateY(${scrollY * 0.015}px)` : "translateY(10px)",
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-purple-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={sectionRefs.cta} id="cta" className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2
            className={`text-5xl font-bold text-white transition-all duration-1000 ease-out animate-slide-up ${
              visibleSections.has("cta") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            Make your GitLab SOC compliant in one click!
          </h2>
          <p
            className={`text-xl text-purple-100 transition-all duration-1000 delay-200 ease-out animate-slide-up ${
              visibleSections.has("cta") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            Transform your development workflow with automated compliance monitoring and intelligent security insights.
          </p>
          <div
            className={`transition-all duration-1000 delay-400 ease-out animate-slide-up ${
              visibleSections.has("cta") ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <Button
              onClick={handleGitLabConnect}
              disabled={isConnecting}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Connecting to GitLab...
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6 mr-3" />
                  Make your repo the most compliant!
                  <ArrowRight className="w-6 h-6 ml-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-purple-600/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AuditFlow</span>
              </div>
              <p className="text-purple-200">Streamlining GitLab compliance for modern development teams.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Product</h4>
              <div className="space-y-2 text-purple-200">
                <Link href="#features" className="block hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#" className="block hover:text-white transition-colors">
                  Documentation
                </Link>
                <Link href="#" className="block hover:text-white transition-colors">
                  API
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-purple-600/30 flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-200">© 2025 Magnet Reseref all rights reserved</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-purple-200 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-purple-200 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-purple-200 hover:text-white transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 