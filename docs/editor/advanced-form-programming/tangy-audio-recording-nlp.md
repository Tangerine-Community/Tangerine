# Tangerine Audio Recording NLP Input

The Tangerine Audio Recording NLP input is an online-only input that sends recorded audio files to the [Tangerine Swahili Transcription Service](https://github.com/Tangerine-Community/tangerine-swahili-transcription-service). The Swahili Transcription Service is only available in deployments of Tangerine where resources to run the service are available. See the linked repository for more information.

## Tangerine Audio Recording NLP Input Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `label` | The label to display for the input. | Yes | N/A |
| `name` | The name of the input. This is used to reference the input in form logic. | Yes | N/A |
| `helpText` | Help text to display below the input. | No | None |
| `required` | Whether the input is required. | | No | false |
| `stimuli` | The text that was read in the audio recording. | No | None |
| `nlpModelUrl` | The URL of the NLP transcription service. | No | N/A |
| `audioRecordingInputName` | The name of the associated audio recording input. | Yes | N/A |
| `language` | The language of the reading response. | No | "en" (English) |
