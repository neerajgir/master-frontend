

function Card({children, title, color = 'blue'}) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900',
    green: 'border-green-500 bg-green-50/50 dark:bg-green-950/20 text-green-900',
    purple: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900',
    red: 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900',
    amber: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900'
  }
  return(
    <div className={`border-l-4 ${colorClasses[color]} p-6 rounded-r-lg shadow-md border-y border-r border-gray-100`}>
      {title && <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">I will be here, ALWAYS</h4>
      <div className="text-gray-700">{children}</div>
    </div>
  )
}

function Container({children, layout= 'vertical'}) {
  const layoutClasses = {
    vertical: 'flex flex-col space-y-4',
    horizontal: 'flex flex-row flex-wrap gap-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6'
  }
  return(
    <div className={layoutClasses[layout]}>{children}</div>
  )
}

const ChildrenProp = () => {
  return (
    <section className="p-8 bg-white rounded-xl shadow-2xl max-w-5xl mx-auto my-8 border border-gray-100">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">Children Prop</h2>
      <p className="text-gray-600 mb-6">
        The <code>children</code> prop allows you to pass components, elements, or raw layout content as data inside open and closed JSX templates.
      </p>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Card Layouts (Rendered in Grid Container)</h3>
          <Container layout="grid"> 
            
            {/* Card 1: User Profile */}
            <Card title="User Profile" color="blue">
              <p className="mb-2 text-gray-600">
                <strong className="text-gray-800">Name:</strong> Neeraj Gir
              </p>
              <p className="mb-2 text-gray-600">
                <strong className="text-gray-800">Email:</strong> neeraj@chai.com
              </p>
              <p className="mb-2 text-gray-600">
                <strong className="text-gray-800">Role:</strong> Developer
              </p>
            </Card>

            {/* Card 2: Statistics */}
            <Card title="Statistics" color="green">
              <p className="mb-2 text-gray-600">
                <strong className="text-gray-800">Name:</strong> Champ
              </p>
              <p className="mb-2 text-gray-600">
                <strong className="text-gray-800">Email:</strong> champ@chai.com
              </p>
              <p className="mb-4 text-gray-600">
                <strong className="text-gray-800">Role:</strong> Founder & CEO of Z.ai
              </p>
              <button className="px-4 py-2 bg-green-600 text-white font-medium rounded shadow hover:bg-green-700 transition duration-200 text-sm">
                View Reports
              </button>
            </Card>

            {/* Card 3: Quick Actions */}
            <Card title="Quick Actions" color="purple">
              <p className="mb-4 text-gray-600">
                Manage system resources and access configuration panels instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition">
                  Add User
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-800 text-xs font-semibold rounded hover:bg-gray-300 transition">
                  Settings
                </button>
              </div>
            </Card>

            {/* Card 4: Warning Alerts */}
            <Card title="System Warning" color="amber">
              <p className="mb-3 text-gray-600">
                Your account is currently running low on data storage space limit.
              </p>
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded text-xs font-mono border border-amber-200">
                Storage Use: 94% of 10GB
              </div>
            </Card>

          </Container>
        </div>
      </div>
    </section>
  )
}

export default ChildrenProp;
