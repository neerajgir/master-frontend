import React from 'react'

const SearchPage = async({searchParams}) => {
    const resolvedSearchParams = await searchParams;
    const id = resolvedSearchParams.query;
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const data = await res.json();

  return (
    <div>
        <h2>{data.title}</h2>
        <p>{data.body}</p>
    </div>
  )
}

export default SearchPage