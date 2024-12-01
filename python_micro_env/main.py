import requests
import base64
import subprocess
# from speechbrain.inference.diarization import Speech_Emotion_Diarization
# import opensmile
# from pyAudioAnalysis import audioEmotion
import sys

# Get the arguments from the command line
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
    import speech_recognition as sr
    r = sr.Recognizer()

    audio_file = sr.AudioFile(output_file)
    with audio_file as source:
        print("Processing audio...")
        audio = r.record(source)  # Record the audio from the source

    try:
        # Use Google Speech Recognition to transcribe the audio
        text = r.recognize_google(audio, language=args[0])
        # en-US pl-PL
        # Load the pre-trained emotion recognition model
        
    except:
        text = "Google Speech Recognition could not understand the audio. Try again!"

    # try:
    # tmpdir = getfixture("tmpdir")
    # sed_model = Speech_Emotion_Diarization.from_hparams(source="speechbrain/emotion-diarization-wavlm-large") 
    # emotions = sed_model.diarize_file(output_file)
    # print(emotions)
    # except:
    #     print("Emotions not detected")


    # smile = opensmile.Smile(
    # feature_set=opensmile.FeatureSet.ComParE_2016,
    # feature_level=opensmile.FeatureLevel.Functionals,
    # )
    # y = smile.process_file(output_file)
    # print(y)

    # from pyAudioAnalysis import audioEmotion

    # # Analyze emotions from an audio file
    # emotion, probability = audioEmotion.fileEmotion("audio_file.wav")
    # print("Detected Emotion:", emotion)
    # print("Probability:", probability)


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
