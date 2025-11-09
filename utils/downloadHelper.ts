import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function downloadAndShare(url: string, fileName: string) {
  try {
    const fileUri = FileSystem.documentDirectory + fileName;
    const { uri } = await FileSystem.downloadAsync(url, fileUri);
    await Sharing.shareAsync(uri);
  } catch (e) {
    console.log("Download error:", e);
  }
}
