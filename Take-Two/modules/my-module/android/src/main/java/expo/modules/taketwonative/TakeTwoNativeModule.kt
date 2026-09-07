package expo.modules.taketwonative

import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.io.File
import java.nio.ByteBuffer
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TakeTwoNativeModule : Module() {
  private fun privateRecording(uri: String): File {
    val context = appContext.reactContext ?: error("App context unavailable")
    val parsed = Uri.parse(uri)
    require(parsed.scheme == "file") { "A private local recording is required" }
    val file = File(parsed.path ?: error("Invalid recording")).canonicalFile
    val roots = listOf(context.filesDir, context.cacheDir).map { it.canonicalPath + File.separator }
    require(roots.any { file.path.startsWith(it) } && file.isFile && file.length() > 0) {
      "Recording is outside private app storage"
    }
    return file
  }

  override fun definition() = ModuleDefinition {
    Name("TakeTwoNative")

    AsyncFunction("duration") { uri: String ->
      val retriever = MediaMetadataRetriever()
      try {
        retriever.setDataSource(privateRecording(uri).path)
        val ms = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()
          ?: error("Recording duration unavailable")
        require(ms > 0 && ms <= 605000) { "Invalid recording duration" }
        ms / 1000.0
      } finally { retriever.release() }
    }

    // No networking: only audio frames cross the JS bridge, never video samples or images.
    AsyncFunction("extractAudio") { uri: String ->
      val extractor = MediaExtractor()
      try {
        extractor.setDataSource(privateRecording(uri).path)
        val tracks = (0 until extractor.trackCount).filter {
          extractor.getTrackFormat(it).getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true
        }
        require(tracks.size == 1) { "One audio track is required" }
        val track = tracks.single()
        val format = extractor.getTrackFormat(track)
        require(format.getString(MediaFormat.KEY_MIME) == "audio/mp4a-latm") { "Unsupported audio codec" }
        val rates = intArrayOf(96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350)
        val sampleRate = format.getInteger(MediaFormat.KEY_SAMPLE_RATE)
        val frequency = rates.indexOf(sampleRate)
        val channels = format.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
        val config = format.getByteBuffer("csd-0") ?: error("AAC configuration unavailable")
        val objectType = (config.get(0).toInt() and 0xff) shr 3
        require(frequency >= 0 && channels in 1..2 && objectType == 2) { "AAC-LC mono or stereo required" }
        extractor.selectTrack(track)
        val buffer = ByteBuffer.allocate(8192)
        val output = ByteArrayOutputStream()
        var frames = 0
        while (true) {
          buffer.clear()
          val count = extractor.readSampleData(buffer, 0)
          if (count < 0) break
          require(count in 1..8184) { "Invalid AAC frame size" }
          require((extractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_ENCRYPTED) == 0) { "Encrypted media is unsupported" }
          val size = count + 7
          output.write(byteArrayOf(0xff.toByte(), 0xf1.toByte(),
            ((1 shl 6) or (frequency shl 2) or (channels shr 2)).toByte(),
            (((channels and 3) shl 6) or (size shr 11)).toByte(),
            ((size shr 3) and 0xff).toByte(),
            (((size and 7) shl 5) or 0x1f).toByte(), 0xfc.toByte()))
          val frame = ByteArray(count)
          buffer.position(0)
          buffer.get(frame)
          output.write(frame)
          frames++
          require(output.size() <= 10 * 1024 * 1024 && frames * 1024.0 / sampleRate <= 605) {
            "Audio exceeds the upload limit"
          }
          if (!extractor.advance()) break
        }
        require(frames > 0) { "Recording has no audio" }
        mapOf("base64" to Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP))
      } finally { extractor.release() }
    }
  }
}
