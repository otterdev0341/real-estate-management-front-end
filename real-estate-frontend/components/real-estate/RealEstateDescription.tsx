import { Building2, Users, BarChart3, Shield, Home, TrendingUp } from "lucide-react"

export function RealEstateDescription() {
  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description: "Efficiently manage your entire property portfolio from a single dashboard",
    },
    {
      icon: Users,
      title: "Tenant Relations",
      description: "Streamline tenant communications, lease agreements, and maintenance requests",
    },
    {
      icon: BarChart3,
      title: "Financial Analytics",
      description: "Track rental income, expenses, and generate comprehensive financial reports",
    },
  ]

  const stats = [
    { label: "Properties Managed", value: "10,000+" },
    { label: "Active Users", value: "5,000+" },
    { label: "Revenue Tracked", value: "$50M+" },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
          <Home className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">RealEstate Pro</h1>
        </div>
        <p className="text-xl text-base-content/70 mb-6">The complete solution for modern real estate management</p>
        <p className="text-base-content/70 leading-relaxed">
          Transform your real estate business with our comprehensive management platform. From property listings to
          tenant management, financial tracking to maintenance scheduling - we've got everything you need to succeed in
          today's competitive market.
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature, index) => (
          <div key={index} className="card bg-base-100 shadow-sm border-l-4 border-l-primary">
            <div className="card-body py-4">
              <div className="flex items-start gap-3">
                <feature.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-base-content/70">{feature.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-primary text-primary-content shadow-lg">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" />
            <h3 className="font-semibold">Trusted by Industry Leaders</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-base-content/70">
        <Shield className="h-4 w-4" />
        <span>Enterprise-grade security and 99.9% uptime guarantee</span>
      </div>
    </div>
  )
}
