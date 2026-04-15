from flask import Flask, request, send_file
from PIL import Image
import io

app = Flask(__name__)

@app.route('/api/convert', methods=['POST'])
def convert_image():
    try:
        if 'file' not in request.files:
            return "No file uploaded", 400
        file = request.files['file']
        target_format = request.form.get('format', 'PNG').upper()
        if target_format == 'JPG': target_format = 'JPEG'
        
        img = Image.open(file.stream)
        
        if target_format == 'JPEG' and img.mode in ('RGBA', 'P', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB' and target_format == 'JPEG':
            img = img.convert('RGB')
            
        img_io = io.BytesIO()
        img.save(img_io, format=target_format)
        img_io.seek(0)
        return send_file(img_io, mimetype=f'image/{target_format.lower()}')
    except Exception as e:
        return str(e), 500

# השורה ש-Vercel צריך כדי להפעיל את השרת
if __name__ == "__main__":
    app.run()