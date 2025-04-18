from collections import defaultdict
import easyocr
image_path = "check6.jpg"

reader = easyocr.Reader(['ru','en'], gpu=True)
raw = reader.readtext(image_path, detail=1, paragraph=False, mag_ratio=3 )
bands = defaultdict(list)
for bbox, text, conf in raw:
    y_center = sum(position[1] for position in bbox) / 4
    key = round(y_center / 27)
    bands[key].append((bbox, text))

lines = []
for band in sorted(bands):
    words = sorted(bands[band], key=lambda x: x[0][0][0])
    line = " ".join(w for _, w in words)
    lines.append(line)

for line in lines:
    if len(line.split()) > 1:
        print(line)