import React, { useState } from 'react'

export default function HabitCard({title, description, goal, time_frame}: {title: string, description: string, goal: string, time_frame: number | null}) {
    const [showDescription, setShowDescription] = useState(false);
    return (
        <div className='mb-5 flex flex-col w-full bg-slate-800 rounded-xl pl-5 text-slate-200 py-3'>
            <div onClick={() => {
                    setShowDescription((prev) => !prev)
                }} className='flex items-center'>
                <h5 className='text-2xl flex items-center'>{title}</h5>
            </div>
            {
                showDescription && 
                <>
                    {/* <p>description: </p> */}
                    <p className='text-center mb-5'>
                        {description}
                    </p>

                    <p className='text-center'>
                        🚀
                        {
                            goal
                        }
                    </p>
                    <p className='text-center'>
                        {
                            time_frame
                        }
                        <span className='ml-1'>days</span>
                    </p>
                </>
            }
        </div>
    )
}
