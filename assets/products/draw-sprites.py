"""Original pixel drawings from the two cited Manner front references.
No image sampling, external packages, or runtime dependency. Run: python3 assets/products/draw-sprites.py
"""
from pathlib import Path
import math
import struct
import zlib

HERE = Path(__file__).resolve().parent

class Canvas:
    def __init__(self,w=64,h=64):
        self.w,self.h=w,h
        self.pixels=[(0,0,0,0)]*(w*h)
    def dot(self,x,y,color):
        x,y=int(x),int(y)
        if not(0<=x<self.w and 0<=y<self.h): return
        if isinstance(color,str): color=tuple(bytes.fromhex(color.lstrip('#')))+(255,)
        self.pixels[y*self.w+x]=color
    def rect(self,x,y,w,h,c):
        for iy in range(y,y+h):
            for ix in range(x,x+w): self.dot(ix,iy,c)
    def line(self,x0,y0,x1,y1,c,width=1):
        steps=max(abs(x1-x0),abs(y1-y0),1)
        for i in range(steps+1):
            x=round(x0+(x1-x0)*i/steps);y=round(y0+(y1-y0)*i/steps)
            self.rect(x-width//2,y-width//2,width,width,c)
    def polygon(self,points,c):
        minx,maxx=min(p[0] for p in points),max(p[0] for p in points)
        miny,maxy=min(p[1] for p in points),max(p[1] for p in points)
        for y in range(miny,maxy+1):
            for x in range(minx,maxx+1):
                inside=False
                j=len(points)-1
                for i in range(len(points)):
                    xi,yi=points[i];xj,yj=points[j]
                    if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: inside=not inside
                    j=i
                if inside:self.dot(x,y,c)
    def ellipse(self,cx,cy,rx,ry,c):
        for y in range(cy-ry,cy+ry+1):
            for x in range(cx-rx,cx+rx+1):
                if ((x-cx)/rx)**2+((y-cy)/ry)**2<=1:self.dot(x,y,c)
    def text(self,s,x,y,c,scale=1):
        font={'M':['101','111','111','101','101'],'A':['010','101','111','101','101'],'N':['101','111','111','111','101'],'E':['111','100','110','100','111'],'R':['110','101','110','101','101'],'8':['111','101','111','101','111'],'1':['010','110','010','010','111'],'e':['000','111','101','110','111'],'r':['000','110','100','100','100']}
        for char in s:
            for iy,row in enumerate(font[char]):
                for ix,on in enumerate(row):
                    if on=='1':self.rect(x+ix*scale,y+iy*scale,scale,scale,c)
            x+=4*scale
    def save(self,path):
        raw=b''.join(b'\x00'+bytes(sum((list(p) for p in self.pixels[y*self.w:(y+1)*self.w]),[])) for y in range(self.h))
        def chunk(tag,data):return struct.pack('!I',len(data))+tag+data+struct.pack('!I',zlib.crc32(tag+data)&0xffffffff)
        Path(path).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',self.w,self.h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))


def box(base):
    c=Canvas()
    c.rect(3,7,57,55,'f0e6d6');c.rect(2,8,2,53,'8997a0');c.rect(4,8,2,53,'cad5d2')
    c.rect(6,8,52,53,base)
    c.rect(58,8,3,53,'a0aea9');c.rect(59,10,1,48,'d9e1d9')
    c.rect(5,61,54,2,'65454b');c.rect(6,60,52,1,'a77371')
    return c

def brand(c):
    c.polygon([(32,8),(58,8),(58,22),(34,25)],'f9b19f')
    c.line(34,24,57,21,'fff2d9')
    c.text('MANNER',34,13,'17366f')

c=box('fff7df')
# Striped gift paper; front silhouette remains square.
for y in range(8,60):
    for x in range(6,58):
        if (x+y)%17<6:c.dot(x,y,'e8323e')
        elif (x+y)%17 in (10,12):c.dot(x,y,'285a3c')
# Woven red ribbon and two folded loops.
c.rect(25,8,6,52,'d93143');c.rect(25,8,1,52,'f55b59');c.rect(6,30,52,7,'d32b3e');c.rect(6,30,52,1,'f35d5a')
c.polygon([(25,34),(15,20),(13,24),(12,32),(16,37)],'a91c35')
c.polygon([(25,33),(15,21),(16,29),(23,37)],'ed414e')
c.polygon([(26,33),(28,19),(33,22),(35,29),(29,36)],'eb3b48')
c.polygon([(25,36),(13,38),(13,48),(17,46),(23,40)],'e83d47')
c.polygon([(26,35),(35,42),(32,51),(26,54),(27,45)],'bf263c')
c.line(29,40,31,48,'ed4e54')
# Fir spray points right, with dark branches and light needle edges.
for end in [(45,28),(48,35),(50,41),(43,49)]:
    c.line(28,36,*end,'284d32',2)
    for n in range(4,16,3):
        t=n/19;x=round(28+(end[0]-28)*t);y=round(36+(end[1]-36)*t)
        c.line(x,y,x+1,y-5,'43834a');c.line(x,y,x+5,y+1,'366a3b')
        c.dot(x+1,y-5,'88ab60')
# Pine cone in center of bow.
c.ellipse(28,37,5,7,'774331')
for x,y in [(27,31),(30,33),(25,34),(28,36),(31,38),(25,39),(28,42)]:
    c.rect(x,y,3,2,'bc8859');c.rect(x,y,2,1,'fff0cd')
brand(c)
c.rect(45,51,12,9,'fff3df');c.text('8er',46,53,'17366f')
c.save(HERE/'eight-sprite.png')

c2=box('408b9c')
# Gold flecks and evergreen branches of the vintage blue wrapping.
for x,y in [(8,11),(22,11),(24,15),(48,29),(52,38),(40,55),(15,36),(12,55),(38,30),(19,24),(53,48),(43,45)]:
    c2.dot(x,y,'dfc58a');c2.dot(x+1,y+2,'a6b3a0')
for origin,end in [((8,17),(21,31)),((7,49),(23,58)),((56,23),(48,32))]:
    c2.line(*origin,*end,'394f43')
    dx,dy=end[0]-origin[0],end[1]-origin[1]
    for i in range(2,11,2):
        x=round(origin[0]+dx*i/12);y=round(origin[1]+dy*i/12)
        c2.line(x,y,x-3,y-3,'d6c68c');c2.line(x,y,x+3,y-1,'ceb37a')
# Four hanging baubles: gold, pink, pale blue, pink.
for x,y,rx,ry,col in [(20,13,4,5,'dfbc74'),(24,26,5,6,'f2a2a3'),(12,43,5,6,'efa19c'),(50,46,5,7,'b6d4d3'),(32,55,4,5,'efa69f')]:
    c2.ellipse(x,y,rx,ry,col)
    c2.rect(x-1,y-ry-2,2,2,'e9ca83');c2.dot(x,y-ry-3,'f9e2a5')
    c2.line(x-rx+1,y,x+rx-1,y,'fff0c9')
    c2.line(x,y-ry+1,x+rx-1,y+2,'f9ddc8')
    c2.dot(x-rx+2,y-2,'fff3e3')
# Holly and berries.
c2.polygon([(32,27),(36,25),(35,29),(40,28),(38,32),(33,31)],'e6cc91')
c2.rect(35,28,2,2,'ef9392');c2.rect(38,30,2,2,'ef9392')
# Note card and golden bow.
c2.polygon([(20,35),(44,30),(48,48),(24,53)],'edf4ee')
c2.line(24,51,47,47,'bdcecb')
c2.polygon([(23,35),(26,34),(30,51),(27,52)],'c99045')
c2.line(25,35,28,50,'ffe6a0')
c2.line(21,42,45,37,'d7a34d',2)
c2.polygon([(26,40),(17,34),(15,37),(19,40),(26,42)],'d9ae62')
c2.polygon([(26,40),(27,29),(31,29),(30,35),(27,42)],'d7ac60')
c2.line(27,40,35,53,'e7bb6c',2);c2.line(27,40,20,46,'ce984a',2)
c2.rect(25,39,3,3,'f7d58a')
brand(c2)
c2.rect(42,51,15,9,'356d87');c2.text('18er',42,53,'fff2d5')
c2.save(HERE/'eighteen-sprite.png')

# Temporary contact sheet for visual QA, nearest-neighbor enlargement.
preview=Canvas(576,288)
for src,xo in [(c,16),(c2,304)]:
    for y in range(64):
        for x in range(64):
            p=src.pixels[y*64+x]
            if p[3]:preview.rect(xo+x*4,12+y*4,4,4,p)
preview.save('/tmp/manner-sprite-preview.png')
