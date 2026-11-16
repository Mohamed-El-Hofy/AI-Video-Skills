"""Local-only faster-whisper bridge. Requires an already downloaded model directory."""
import json
import os
import sys

if '--probe' in sys.argv:
    import faster_whisper
    print('faster-whisper import available; model not loaded')
    raise SystemExit(0)

request = json.load(open(sys.argv[1], encoding='utf-8'))
model_path = request['modelPath']
if not os.path.isdir(model_path):
    raise SystemExit('Existing local model directory required; downloads are disabled')
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
from faster_whisper import WhisperModel
model = WhisperModel(model_path, device=request.get('device', 'cpu'), compute_type=request.get('computeType', 'int8'), local_files_only=True)
segments, info = model.transcribe(request['audio'], language=request.get('language'), word_timestamps=True)
cues = [{'start': s.start, 'end': s.end, 'text': s.text.strip()} for s in segments if s.text.strip()]
with open(request['output'], 'x', encoding='utf-8') as stream:
    json.dump({'schemaVersion': 1, 'source': 'faster-whisper', 'language': info.language, 'cues': cues}, stream, ensure_ascii=False, indent=2)
