import Link from 'next/link';


const OnePage
 = () => {
  return (
    <div className="flex flex-col">
        link to one page
      <Link href="/one/two">One</Link>
      <Link href="/three">three</Link>
    </div>
  )
}

export default OnePage
