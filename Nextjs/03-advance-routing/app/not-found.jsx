import Link from 'next/link'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-800">
        <img src="/404.svg" alt="not-found" height={400} width={400} className="p-4"/>
        <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
        <p className="text-lg text-white mt-4">The page you are looking for does not exist.</p>    
        <Link href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Go To Homepage
        </Link>
    </div>
  )
}

export default NotFoundPage