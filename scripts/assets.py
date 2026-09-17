"""Render original geometric icons and the Store promotional tile (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
R=Path(__file__).resolve().parents[1]
im=Image.new('RGBA',(512,512),(0,0,0,0)); d=ImageDraw.Draw(im)
d.rounded_rectangle((24,24,488,488),radius=108,fill='#173e55')
for y,color,width in [(142,'#ffbd66',218),(238,'#65d8ba',170),(334,'#82baff',200)]:
    d.polygon([(107,y-25),(156,y-25),(181,y),(156,y+25),(107,y+25)],fill=color)
    d.rounded_rectangle((207,y-13,207+width,y+13),radius=13,fill='#f2f8fc')
for n in [16,32,48,128]: im.resize((n,n),Image.Resampling.LANCZOS).save(R/f'extension/icons/icon{n}.png')
promo=Image.new('RGB',(880,560),'#eef5f7'); d=ImageDraw.Draw(promo)
font='/System/Library/Fonts/Supplemental/Arial.ttf'
bold='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
def f(n,b=False): return ImageFont.truetype(bold if b else font,n)
promo.paste(im.resize((120,120),Image.Resampling.LANCZOS),(52,46),im.resize((120,120),Image.Resampling.LANCZOS))
d.text((192,67),'Inbox by label',font=f(52,True),fill='#173e55')
d.text((56,200),'Your labels. Only inbox mail.',font=f(35,True),fill='#173e55')
d.text((56,255),'Unread / total, at a glance.',font=f(30),fill='#446174')
d.rounded_rectangle((56,330,822,450),radius=24,fill='white')
d.polygon([(84,365),(116,365),(136,390),(116,415),(84,415)],fill='#ffbd66')
d.text((164,368),'Action',font=f(35,True),fill='#173e55'); d.text((645,368),'3 / 12',font=f(35,True),fill='#173e55')
d.text((58,487),'For Gmail in Chrome',font=f(25),fill='#446174')
promo.resize((440,280),Image.Resampling.LANCZOS).save(R/'store/promo-440x280.png')
