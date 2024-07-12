"use client"
import React, { useRef } from 'react'
import DateHeader from '../components/DateHeader/DateHeader'
import { Editor } from '@tinymce/tinymce-react';
import Calendar from '../components/DatePicker/DatePicker';

export default function NewNote() {
  const editorRef = useRef<Editor|null>(null);

  function getTextContent()
  {
    console.log(editorRef.current.getContent());
    console.log(editorRef.current.getContent({format: "text"}));
  }

  return (
    <div>
        <Calendar/>
        <Editor
          apiKey='625e2ix3cvdd1ebqsu0tyfj6ss37azfic0avynagh481yuo5'
          onInit={(evt, editor) => editorRef.current = editor}
        />
        <button onClick={getTextContent}>Get the content of the textarea</button>
        <button>I have completed note-taking</button>
    </div>
  )
}
