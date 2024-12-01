import React, { useState, useRef, useEffect } from "react";

function App() {
  const [audioURL, setAudioURL] = useState(null);
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en-US");
  const chunks = useRef([]);
  const mediaRecorder = useRef(null);

  function handleChange(event) {
    setLang(event.target.value)
  }

  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      // Collect audio data in chunks
      mediaRecorder.current.ondataavailable = (event) => {
        chunks.current.push(event.data);
      };

      // When recording stops, process the audio data
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/ogg; codecs=opus" });
        const audioURL = window.URL.createObjectURL(blob);
        setAudioURL(audioURL); // Set audio URL for playback
        chunks.current = []; // Clear chunks after processing

        // Upload the recording
        const formData = new FormData();
        formData.append('files', blob);
        formData.append('key', lang);

        try {
          const uploadResponse = await fetch('http://localhost:5050/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            console.log("File uploaded successfully");

            // Fetch the transcribed text after the upload is complete
            await fetchTranscribedText();
          } else {
            console.error("Error uploading file");
          }
        } catch (err) {
          console.error('Error uploading file:', err);
        }
      };

      mediaRecorder.current.start();
      console.log("Recording started...");
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      console.log("Recording stopped.");
    }
  };

  // Fetch transcribed text from the server
  const fetchTranscribedText = async () => {
    try {
      const response = await fetch('http://localhost:5050/text');
      const data = await response.json();
      console.log(data);
      setText(data.text); // Assuming the backend sends { text: "some transcribed text" }
    } catch (error) {
      console.error('Error fetching text:', error);
    }
  };

  return (
    <div>
      <h1>Audio Recorder</h1>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <label for="lng">Choose language:</label>
      <select onChange={handleChange} name="language" id="lng">
        <option value="en-US">english</option>
        <option value="pl-PL">polish</option>
        {/* <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option> */}
      </select>
      {audioURL && (
        <div>
          <h3>Playback</h3>
          <audio controls src={audioURL}></audio>
        </div>
      )}
      <div>
        <h3>Transcribed Text</h3>
        <span>{text}</span>
      </div>
    </div>
  );
}

export default App;
