"use client"
import React, { useState } from 'react'
import Calendar from '../components/DatePicker/DatePicker'
import { ErrorMessage, Field, Form, Formik } from 'formik';
import plus from "../../images/plus.svg"
import axios from 'axios';
import HabitCard from '../components/HabitCard/HabitCard';

export default function GetStarted() {
    interface Habit{
        title: string, 
        description: string,
        goal: string,
        time_frame: number | null
    }

    const [showForm, setShowForm] = useState(false);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [advancedOptions, setAdvancedOptions] = useState(false);

    interface Values {
        habitName: string,
        habitDescription: string,
        habitGoal: string,
        habitTimeFrame: number | null
      }

    function showAddHabitForm()
    {
        setShowForm((prev) => !prev);
        setAdvancedOptions(false);
    }

    async function saveHabits()
    {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const {user_id} = userData;
        const {accessToken} = userData;

        const date = new Date();
        const today = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
        const response = await axios.post("http://localhost:8080/create_habits", {habits, user_id}, {headers});

        const sortedHabits = habits.filter((habit) => habit.goal != "");
        const planData = await axios.post("http://127.0.0.1:8000/get_plan", {habits: sortedHabits, user_id, today});
        console.log(planData.data.response.text);
    }

  return (
    <div className='flex justify-between flex-col items-center min-h-screen'>
        <Calendar/>

        {
            habits.map((habit, index) => (
            <HabitCard key={index} title={habit.title} description={habit.description} goal={habit.goal} time_frame={habit.time_frame} />
            ))
        }

        <div className='flex flex-col w-full justify-center items-center'>
            <div className='bg-blue-700 rounded-full p-4 mb-5' onClick={showAddHabitForm}>
                <img src={`${plus.src}`} alt="" />
            </div>
            {
                showForm && 
                <Formik 
                    initialValues={{
                    habitName: "",
                    habitDescription: "",
                    habitGoal: "",
                    habitTimeFrame: 0
                    }}
                    onSubmit={
                    (values: Values) => {
                        setHabits((prev) => [...prev, {title: values.habitName, description: values.habitDescription, goal: values.habitGoal, time_frame: values.habitTimeFrame}])
                    }
                    }
                    validate={(values) => {
                    let errors = {habitName: "", habitTimeFrame: ""};
                    if (!values.habitName)
                    {
                        errors.habitName = "Required";
                    }

                    if (advancedOptions && values.habitTimeFrame && isNaN(values.habitTimeFrame))
                    {
                        errors.habitTimeFrame = "The field should only contain numbers";
                        return errors;
                    }

                    if (!errors.habitName)
                    {
                        return {};
                    }

                    return errors;
                    }}
                >
                    <Form>
                    <div className='top-28 bg-slate-800 flex flex-col items-center p-5 rounded-md'>
                        <Field id="habitName" name="habitName" className="pl-2" placeholder="Habit hame" />
                        <ErrorMessage name="habitName" component="div" className='text-red-600' />
                        <Field id="habitDescription" name="habitDescription" className="mt-5 pl-2" placeholder="Habit description" />
                        <ErrorMessage name="habitDescription" component="div" className='text-red-600' />
                        <button className='text-slate-400' onClick={() => setAdvancedOptions((prev) => !prev)} type='button'>Advanced options</button>
                        {
                        advancedOptions 
                        && 
                        <>
                            <p className='text-white'>I want to achieve the goal of: </p>
                            <Field id="habitGoal" name="habitGoal" className="mt-5 pl-2" placeholder="Habit Goal" />
                            <ErrorMessage name="habitGoal" component="div" className='text-red-600' />
                            <p className='text-white mt-2'>Within: </p>
                            <Field id="habitTimeFrame" name="habitTimeFrame" type="number" className="mt-2 pl-2" placeholder="The time frame for your goal" />
                            <ErrorMessage name="habitTimeFrame" component="div"  className='text-red-600' />
                            <p className='text-white text-center'>Days. <br /> P.S.: Be realistic and set the achievable goal (Don't act on the basis of your ego...)</p>
                        </>
                        }
                        <button type="submit" className='text-white mt-5'>Create habit</button>
                    </div>
                    </Form>
                </Formik>
                }
            <button onClick={saveHabits} className='p-5 bg-slate-800 rounded-full text-white w-full mt-5 mb-0' >Save habits & Finish</button>
        </div>
    </div>
  )
}
