from PIL import Image
import os

source_path = r'c:\Users\deepa\Desktop\Portfolio-\public\campaign-worlds\groton logo.png'
target_public = r'c:\Users\deepa\Desktop\Portfolio-\public'

img = Image.open(source_path)

# Generate icon.png (512x512)
icon_png = img.resize((512, 512), Image.Resampling.LANCZOS)
icon_png.save(os.path.join(target_public, 'icon.png'))

# Generate apple-icon.png (180x180)
apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save(os.path.join(target_public, 'apple-icon.png'))

# Generate favicon.ico (multiple sizes)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
img.save(os.path.join(target_public, 'favicon.ico'), format='ICO', sizes=ico_sizes)

# Generate public/logo.png (same as source)
img.save(os.path.join(target_public, 'logo.png'))

print("Icons successfully deployed to public directory!")
