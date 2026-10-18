import React from 'react'

export const metadata = {
    title: {
      default: "Welcome To Dashboard Page",
      template: "%s | Dashboard Layout"
    },
    description: "Generate By Neeraj"
};

const DashboardLayout = ({children}) => {
  return (
    <div>
        <h1>DashboardLayout</h1>
        {children}
    </div>
  )
}

export default DashboardLayout