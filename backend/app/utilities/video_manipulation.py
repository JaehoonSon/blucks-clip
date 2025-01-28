import tempfile
import ffmpeg
import io

def segment_video(byte_stream, start_time, end_time, mimeType):
    # Extract the format from the mimeType (e.g., 'video/mp4' -> 'mp4')
    format = mimeType.split("/")[1]  # e.g., 'mp4'

    # Write the byte_stream to a temporary input file
    with tempfile.NamedTemporaryFile(suffix='.' + format) as temp_input:
        temp_input.write(byte_stream.getvalue())
        temp_input.flush()

        # Probe the temporary input file to check for an audio stream
        probe = ffmpeg.probe(temp_input.name)
        audio_streams = [
            stream for stream in probe['streams'] if stream['codec_type'] == 'audio'
        ]
        has_audio = len(audio_streams) > 0

        # Prepare the output as a temporary output file
        with tempfile.NamedTemporaryFile(suffix='.mkv') as temp_output:

            # Build FFmpeg command
            input_stream = ffmpeg.input(temp_input.name)

            # Trim video stream
            video = (
                input_stream.video
                .trim(start=start_time, end=end_time)
                .setpts('PTS-STARTPTS')
            )

            if has_audio:
                # Trim audio stream
                audio = (
                    input_stream.audio
                    .filter('atrim', start=start_time, end=end_time)
                    .filter('asetpts', 'PTS-STARTPTS')
                )
                # Combine video and audio
                output = ffmpeg.output(
                    video,
                    audio,
                    temp_output.name,
                    format='matroska',  # Output format as 'matroska'
                    vcodec='libx264',
                    acodec='aac',
                )
            else:
                # No audio stream, output video only
                output = ffmpeg.output(
                    video,
                    temp_output.name,
                    format='matroska',  # Output format as 'matroska'
                    vcodec='libx264',
                    # Specify '-an' to disable audio in the output
                    an=None,
                )

            # Run ffmpeg process synchronously
            output.run(overwrite_output=True)

            # Read the output from the temporary output file
            temp_output.seek(0)
            result = temp_output.read()

            # Return the output as a BytesIO object
            return io.BytesIO(result)