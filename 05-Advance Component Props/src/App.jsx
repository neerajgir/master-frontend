import BasicProp from "./components/BasicProp.jsx" 
import ChildrenProp from "./components/ChildrenProp.jsx" 
import ComplexProp from "./components/ComplexProp.jsx" 
import RefProp from "./components/Refprop.jsx" 
import ThemeToggler from "./components/ThemeToggler.jsx" 

function Navigation({ isDark }){ 
  const section = [ 
    {id:'basic', label: 'Basic Prop', icon: '📦'}, 
    {id:'ref', label: 'Ref Prop', icon: '🔗'}, 
    {id:'children', label: 'Children Prop', icon: '👶'}, 
    {id:'complex', label: 'Complex Prop', icon: '🧩'}, 
    {id:'theme', label: 'Theme Prop', icon: '🎨'}, 
  ] 

  return( 
    <nav className={`sticky top-0 z-50 shadow-md transition-colors ${ isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}> 
      <div className="container mx-auto px-4 py-4"> 
        <div className="flex flex-wrap gap-2 justify-center"> 
          {section.map((item) => ( // Renamed parameter to 'item' to avoid shadowing the 'section' array
            <button key={item.id} className={`px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700`}> 
              <span className="mr-2">{item.icon}</span> 
              {item.label} 
            </button> 
          ))} 
        </div> 
      </div> 
    </nav> 
  ) 
} 

function AppContent({ isDark }){ 
  return ( 
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}> 
      <Navigation isDark={isDark}/> 
      <div className="container mx-auto px-4 py-8"> 
        <header className={`text-center mb-12 transition-colors ${ isDark ? 'text-white' : 'text-gray-800'}`}> 
          <h1 className="text-5xl font-bold mb-4">React Props Explain</h1> 
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>A comprehensive guide to understanding and using props in React.</p> 
          <div className={`mt-4 inline-block px-6 py-3 text-white  font-medium`}> 
            <h2 className="text-2xl font-bold text-white">Built-in with Bun + Vite + Tailwind CSS</h2> 
          </div> 
        </header> 
        <div className="space-y-8">
          <div id="basic" className="scroll-mt-200">
            <BasicProp isDark={isDark}/>
          </div>
          <div id="children" className="scroll-mt-200">
            <ChildrenProp isDark={isDark}/>
          </div>
          <div id="complex" className="scroll-mt-200">
            <ComplexProp isDark={isDark}/>
          </div>
          <div id="ref" className="scroll-mt-200">
            <RefProp isDark={isDark}/>
          </div>
          <div id="theme" className="scroll-mt-200">
            <ThemeToggler isDark={isDark}/>
          </div>
        </div>
      </div> 
      <div>
        <footer className={`mt-12 text-center pb-8 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm">Made with ❤️ by <a href="https://github.com/neerajgir" target="_blank" rel="noopener noreferrer" className="hover:underline">Neeraj Gir</a></p>
        </footer>
      </div>
    </div> 
  ) 
} 


const App = () => { 
  const isDark = true 

  return ( 
    <AppContent isDark={isDark}/> 
  ) 
} 

export default App
