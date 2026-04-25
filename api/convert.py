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

        # --- PDF → תמונה ---
        if file.filename.lower().endswith('.pdf') or file.mimetype == 'application/pdf':
            import fitz  # pymupdf
            pdf_bytes = file.read()
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            page = doc[0]  # ממיר את העמוד הראשון
            mat = fitz.Matrix(2, 2)  # רזולוציה x2
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            out_format = target_format if target_format in ('PNG', 'WEBP', 'GIF') else 'JPEG'
            if out_format == 'JPG':
                out_format = 'JPEG'
            img = Image.open(io.BytesIO(img_bytes))
            if out_format == 'JPEG' and img.mode in ('RGBA', 'P', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
                img = background
            img_io = io.BytesIO()
            img.save(img_io, format=out_format)
            img_io.seek(0)
            mime = 'image/jpeg' if out_format == 'JPEG' else f'image/{out_format.lower()}'
            return send_file(img_io, mimetype=mime)

        # --- תמונה → PDF ---
        if target_format == 'PDF':
            img = Image.open(file.stream)
            if img.mode in ('RGBA', 'P', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            img_io = io.BytesIO()
            img.save(img_io, format='PDF')
            img_io.seek(0)
            return send_file(img_io, mimetype='application/pdf')

        # --- המרת תמונה רגילה ---
        if target_format == 'JPG':
            target_format = 'JPEG'

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

if __name__ == "__main__":
    app.run()
