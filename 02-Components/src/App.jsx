import React from 'react'
import Card from './components/Card.jsx'
import Header from './components/Header.jsx'
// import Hero from './components/Hero.jsx'
const App = () => {
  return (

    <div className="font-bold bg-amber-300 text-blue-900 border-2 p-4">
    <h1 className="text-emerald-600 dark:text-sky-600 border-2 p-4 rounded-xl">Welcome To Components</h1>
    {/* <Hero/> */}
    <Header/>
    <div className="flex gap-4">
      <Card imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1280px-Python-logo-notext.svg.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=thumbnail" title="Buy Python" description="Python is a programming language that lets you work more quickly and integrate your systems more effectively."/>
      <Card imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi7-QSbrTDw-udyB0dgf9D0-vdxKg8GC8wG3v-c3XdeA&s" title="Buy JavaScript" description="JavaScript is a programming language that conforms to the ECMAScript specification, which was created to standardize JavaScript"/>
      <Card imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRF9NMAd5WmguDXnRKVAfYRcfaao4kdcLbJ_lqZPLLxw&s=10" title="Buy C++" description="C++ is a general-purpose programming language created by Bjarne Stroustrup as an extension of the C programming language."/>
      
    </div>
    </div>
  )
}

export default App