import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, Text, View } from "react-native";
import { useState } from "react";
import { Audio } from "expo-av";

export default function App() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState();
  const [message, setMessage] = useState("");
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid:true
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      } else {
        setMessage("please grant permission to app to access microphone");
      }
    } catch (err) {
      console.log("Failed to start recording");
    }
  }
  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    let updateRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadeSoundAsync();
    updateRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI(),
    });
    setRecordings(updateRecordings);
  }

  function getDurationFormatted(millis) {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const secounds = Math.round((minutes - minutesDisplay) * 60);
    const secoundsDisplay = secounds < 10 ? `0${secounds}` : secounds;
    return `${minutesDisplay}:${secoundsDisplay}`;
  }

  function getRecoringLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>
            Recoring {index + 1} - {recording.duration}
          </Text>
          <Button
            style={styles.button}
            onPress={() => recordingLine.sound.replayAsync()}
            title="Play"
          ></Button>
          {getRecoringLines()}
          <StatusBar style="auto"/>
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  fill:{
    flex:1,
    margin:16
  },
  button:{
    margin:16
  }
});
