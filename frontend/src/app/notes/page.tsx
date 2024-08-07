"use client";
import React, { useEffect, useRef, useState } from "react";
import DateHeader from "../components/DateHeader/DateHeader";
import { Editor } from "@tinymce/tinymce-react";
import Calendar from "../components/DatePicker/DatePicker";
import axios from "axios";
import tinymce from "tinymce";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCalendar } from "@/hooks/use-calendar";
import Header from "../components/Header/header";

export default function NewNote() {
  const editorRef = useRef<Editor | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [responseAI, setResponseAI] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [similarRecords, setSimilarRecords] = useState([]);

  // const dateObject = new Date();
  // const today = dateObject.getFullYear() + "-" + (dateObject.getMonth() + 1) + "-" + dateObject.getDate();
  // const [date, setDate] = useState(dayjs(today).format("YYYY-MM-DD"));
  const [date, setDate] = useCalendar();
  console.log({ date });

  const [proceedNoteTaking, setProceedNoteTaking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log(date);
    const checkIfNotesAlreadyExist = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));

      const user_id = userData.user_id;
      const { accessToken } = userData;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const check_response = await axios.get(
        `http://localhost:8080/rating_exists`,
        {
          params: {
            date: date,
            user_id: user_id,
          },
        }
      );

      console.log(check_response);

      if (check_response.data.length !== 0) {
        // Set the user&AI response to render
        const record_response = await axios.get(
          `http://localhost:8080/get_record`,
          {
            params: {
              date,
              user_id,
            },
          }
        );
        if (record_response.data.length === 0) {
          setProceedNoteTaking(true);
          setUserNotes("");
          setResponseAI("");
          return;
        }
        setProceedNoteTaking(false);
        setUserNotes(record_response.data[0].user_input);
        setResponseAI(record_response.data[0].ai_output);
        console.log(record_response);

        const similarity_response = await axios.post(
          "http://127.0.0.1:8000/similarity_search",
          { user_input: record_response.data[0].user_input }
        );

        console.log(similarity_response);
        setSimilarRecords(similarity_response.data);

        setIsFinished(true);
      } else {
        router.push("/habit");
      }
    };
    checkIfNotesAlreadyExist();
  }, [date]);

  async function sendPrompt() {
    setIsFinished(true);
    if (editorRef.current) {
      const editor = editorRef.current as any;

      console.log(editor.getContent());
      console.log(editor.getContent({ format: "text" }));

      // tinymce.activeEditor.setMode("readonly");                    <------------------ make the editor readonly

      if (editor.getContent({ format: "text" }) === "") {
        return;
      }

      const prompt = editor.getContent({ format: "text" });
      const userData = JSON.parse(localStorage.getItem("userData"));
      const user_id = userData.user_id;

      const response = await axios.post("http://127.0.0.1:8000/send_prompt", {
        prompt,
        user_id,
      });
      console.log(response.data.text);
      setResponseAI(response.data.text);

      /* 
        Example prompt:
        I am unable to be consistent on my meditation journey, I can't even meditate for 5 minutes everyday, I am feeling hopeless, please help me
      */

      const user_input = editor.getContent();
      // const date = new Date();
      // const today = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      // const formatted_today = dayjs(today).format("YYYY-MM-DD");

      const save_records_response = await axios.post(
        "http://localhost:8080/save_record",
        { record_date: date, user_input, ai_output: response.data.text }
      );

      const summarise_response = await axios.post(
        "http://127.0.0.1:8000/summarise_records",
        { user_id }
      );

      const share_response = await axios.post(
        "http://127.0.0.1:8000/share_experience",
        { user_id }
      );

      const similarity_response = await axios.post(
        "http://127.0.0.1:8000/similarity_search",
        { user_input }
      );

      console.log(similarity_response);
      setSimilarRecords(similarity_response.data);

      console.log(share_response);
    }
  }
  return (
    <div>
      <Header />
      <div className="mb-10">
        <Calendar />
      </div>
      {proceedNoteTaking && (
        <p>You left the application while taking a note...</p>
      )}
      <Editor
        apiKey="625e2ix3cvdd1ebqsu0tyfj6ss37azfic0avynagh481yuo5"
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={`${userNotes}`}
        init={{
          placeholder:
            "Firstly, we ask you to type what you have tried to develop a habit. Thereafter, describe the problem you are facing...",
        }}
      />
      {!isFinished && (
        <button
          onClick={sendPrompt}
          className="p-5 bg-slate-800 rounded-full text-white w-full mt-5"
        >
          Finish & Get advice
        </button>
      )}
      <div
        className="p-5"
        dangerouslySetInnerHTML={{ __html: responseAI }}
      ></div>

      {similarRecords.length !== 0 && (
        <div className="mt-10 p-3">
          <h2 className="text-xl mb-3">Similar stories from other users: </h2>
          {similarRecords.map((record) => (
            <p className="mb-5">{record}</p>
          ))}
        </div>
      )}
    </div>
  );
}
