import requests
import base64
import subprocess
import sys
import speech_recognition as sr

args = sys.argv[1:]
print(args[0])

url = "http://localhost:5050/audio"
response = requests.get(url)

if response.status_code == 200:
    print("Data received successfully!")

    # Decode the base64 audio data
    audio_data = base64.b64decode(response.content)

    # Save the raw audio to an MP3 file for inspection
    with open("raw_audio.mp3", "wb") as audio_file:
        audio_file.write(audio_data)

    file = open("output.wav", "wb")
    file.close()
    # Convert MP3 to WAV using ffmpeg via subprocess
    input_file = 'raw_audio.mp3'
    output_file = 'output.wav'

    # # Use ffmpeg to convert the MP3 file to WAV format
    subprocess.run(['ffmpeg','-loglevel', 'quiet', '-y', '-i', input_file, output_file])

    # Now use speech recognition with the output WAV file
    r = sr.Recognizer()

    audio_file = sr.AudioFile(output_file)
    with audio_file as source:
        print("Processing audio...")
        audio = r.record(source)  # Record the audio from the source
    try:
        # Use Google Speech Recognition to transcribe the audio
        text = r.recognize_google(audio, language=args[0])        
    except:
        text = "Google Speech Recognition could not understand the audio. Try again!"
        
    url = 'http://localhost:5050/audio-text'
    msg = {'text': text}
    print(text)
    x = requests.post(url, json=msg, headers={'Content-Type': 'application/json'})
    if x.status_code == 200:
        print("Data received successfully!")
    else:
        print("Failed to send data")

    

else:
    print(f"Failed to fetch audio. Status code: {response.status_code}")
