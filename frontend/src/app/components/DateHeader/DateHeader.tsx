import React from 'react'

export default function DateHeader() {
  const date = new Date();
  
  const months = [
    "January", 
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]

  return (
    <div className='flex justify-around'>
        <p>Day #{date.getDate()}</p>
        <p>{months[date.getMonth()]}</p>
        <p>{date.getFullYear()}</p>
    </div>
  )
}
