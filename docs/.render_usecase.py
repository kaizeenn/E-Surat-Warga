#!/usr/bin/env python3
"""Use Case Diagram — e-Surat Desa (versi simpel & jelas)."""

from PIL import Image, ImageDraw, ImageFont
import os, math

# ===================================================================
# Canvas
# ===================================================================
W, H = 1500, 1050
BG = (255, 255, 255)
img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

def load_font(size, bold=False):
    paths_r = ["/usr/share/fonts/TTF/DejaVuSans.ttf",
               "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    paths_b = ["/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
               "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
    for p in (paths_b if bold else paths_r):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

f_title    = load_font(28, True)
f_subtitle = load_font(16)
f_actor    = load_font(18, True)
f_actor_sub= load_font(13)
f_uc       = load_font(15, True)
f_stereo   = load_font(12)
f_system   = load_font(18, True)
f_legend   = load_font(13)

# Colors
TEXT_DARK   = (15, 23, 42)
TEXT_MUTED  = (100, 116, 139)
LINE_C      = (71, 85, 105)

WARGA_COL   = (37, 99, 235)
ADMIN_COL   = (220, 38, 38)
SYSTEM_BORDER = (30, 41, 59)
SYSTEM_BG   = (248, 250, 252)

UC_FILL_W   = (219, 234, 254)   # blue-100  (warga)
UC_BORD_W   = (29, 78, 216)
UC_FILL_A   = (254, 226, 226)   # red-100   (admin)
UC_BORD_A   = (153, 27, 27)
UC_FILL_S   = (220, 252, 231)   # green-100 (sistem otomatis)
UC_BORD_S   = (21, 128, 61)

INC_COLOR   = (21, 128, 61)     # green (include)

# ===================================================================
# Title
# ===================================================================
draw.text((W//2, 35), "Use Case Diagram — e-Surat Desa",
          font=f_title, fill=TEXT_DARK, anchor="mm")
draw.text((W//2, 65), "Aktor: Warga & Admin Desa",
          font=f_subtitle, fill=TEXT_MUTED, anchor="mm")

# ===================================================================
# System boundary
# ===================================================================
SYS_X1, SYS_Y1 = 250, 110
SYS_X2, SYS_Y2 = 1250, 970

draw.rounded_rectangle([SYS_X1, SYS_Y1, SYS_X2, SYS_Y2],
                       radius=18, outline=SYSTEM_BORDER, width=3, fill=SYSTEM_BG)
# title bar
draw.rounded_rectangle([SYS_X1, SYS_Y1, SYS_X2, SYS_Y1+42],
                       radius=18, fill=SYSTEM_BORDER)
draw.rectangle([SYS_X1, SYS_Y1+24, SYS_X2, SYS_Y1+42], fill=SYSTEM_BORDER)
draw.text(((SYS_X1+SYS_X2)//2, SYS_Y1+21),
          "SISTEM e-SURAT DESA",
          font=f_system, fill=(255, 255, 255), anchor="mm")

# ===================================================================
# Stick figure actor
# ===================================================================
def draw_actor(cx, cy, name, role_label, color):
    head_r = 22
    draw.ellipse([cx-head_r, cy-head_r, cx+head_r, cy+head_r],
                 outline=color, width=3, fill=(255, 255, 255))
    body_top = cy + head_r
    body_bot = cy + head_r + 60
    draw.line([(cx, body_top), (cx, body_bot)], fill=color, width=3)
    draw.line([(cx-32, body_top+18), (cx+32, body_top+18)], fill=color, width=3)
    draw.line([(cx, body_bot), (cx-22, body_bot+42)], fill=color, width=3)
    draw.line([(cx, body_bot), (cx+22, body_bot+42)], fill=color, width=3)
    draw.text((cx, body_bot+72), name, font=f_actor, fill=color, anchor="mm")
    draw.text((cx, body_bot+93), role_label, font=f_actor_sub, fill=TEXT_MUTED, anchor="mm")

WARGA_X, WARGA_Y = 130, 420
ADMIN_X, ADMIN_Y = 1370, 420

draw_actor(WARGA_X, WARGA_Y, "WARGA", "(Pemohon Surat)", WARGA_COL)
draw_actor(ADMIN_X, ADMIN_Y, "ADMIN", "(Pengurus Desa)", ADMIN_COL)

# ===================================================================
# Use case ellipse helper
# ===================================================================
def use_case(cx, cy, rx, ry, text_lines, fill, border):
    draw.ellipse([cx-rx+2, cy-ry+2, cx+rx+2, cy+ry+2], fill=(226, 232, 240))
    draw.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=fill, outline=border, width=2)
    if isinstance(text_lines, str):
        text_lines = [text_lines]
    line_h = 17
    total_h = line_h * len(text_lines)
    start_y = cy - total_h//2 + line_h//2
    for i, t in enumerate(text_lines):
        draw.text((cx, start_y + i*line_h), t, font=f_uc, fill=TEXT_DARK, anchor="mm")
    return (cx, cy, rx, ry)

# ===================================================================
# Use cases (simpel — fokus core flow)
# ===================================================================
# WARGA (kolom kiri, 5 use case)
UC_LOGIN_W   = (470, 200, 110, 40)
UC_AJUKAN    = (470, 320, 130, 50)
UC_LACAK     = (470, 440, 140, 50)
UC_DOWNLOAD  = (470, 560, 140, 50)
UC_PROFIL_W  = (470, 680, 120, 45)

# ADMIN (kolom kanan, 6 use case)
UC_LOGIN_A   = (1030, 200, 110, 40)
UC_KELOLA_P  = (1030, 320, 150, 50)
UC_APPROVE   = (1030, 440, 140, 50)
UC_KELOLA_T  = (1030, 560, 150, 50)
UC_UPLOAD_T  = (1030, 680, 150, 50)
UC_PROFIL_A  = (1030, 800, 120, 45)

# SISTEM otomatis (tengah-bawah, dipanggil <<include>> oleh Approve)
UC_GEN_NOMOR = (560, 880, 130, 45)
UC_GEN_PDF   = (940, 880, 130, 45)

# Render warga
use_case(*UC_LOGIN_W [:4], "Login",                          UC_FILL_W, UC_BORD_W)
use_case(*UC_AJUKAN  [:4], ["Ajukan", "Permohonan Surat"],   UC_FILL_W, UC_BORD_W)
use_case(*UC_LACAK   [:4], ["Lacak Status", "Permohonan"],   UC_FILL_W, UC_BORD_W)
use_case(*UC_DOWNLOAD[:4], ["Unduh PDF Surat"],              UC_FILL_W, UC_BORD_W)
use_case(*UC_PROFIL_W[:4], "Kelola Profil",                  UC_FILL_W, UC_BORD_W)

# Render admin
use_case(*UC_LOGIN_A [:4], "Login",                          UC_FILL_A, UC_BORD_A)
use_case(*UC_KELOLA_P[:4], ["Kelola Permohonan", "Warga"],   UC_FILL_A, UC_BORD_A)
use_case(*UC_APPROVE [:4], ["Approve / Tolak", "Permohonan"],UC_FILL_A, UC_BORD_A)
use_case(*UC_KELOLA_T[:4], ["Kelola Template", "Surat"],     UC_FILL_A, UC_BORD_A)
use_case(*UC_UPLOAD_T[:4], ["Upload TTD", "Digital"],        UC_FILL_A, UC_BORD_A)
use_case(*UC_PROFIL_A[:4], "Kelola Profil",                  UC_FILL_A, UC_BORD_A)

# Render sistem
use_case(*UC_GEN_NOMOR[:4],["Generate Nomor Surat"],         UC_FILL_S, UC_BORD_S)
use_case(*UC_GEN_PDF [:4], ["Generate PDF Surat"],           UC_FILL_S, UC_BORD_S)

# ===================================================================
# Edge helpers
# ===================================================================
def ellipse_edge_point(cx, cy, rx, ry, tx, ty):
    dx, dy = tx - cx, ty - cy
    dist = math.hypot(dx, dy)
    if dist == 0:
        return cx, cy
    t = 1.0 / math.sqrt((dx/rx)**2 + (dy/ry)**2)
    return cx + dx * t, cy + dy * t

def dashed_line(p1, p2, color=LINE_C, width=2, dash=10, gap=6):
    x1, y1 = p1
    x2, y2 = p2
    dx, dy = x2-x1, y2-y1
    dist = math.hypot(dx, dy)
    if dist == 0:
        return
    ux, uy = dx/dist, dy/dist
    n = int(dist // (dash + gap))
    for i in range(n+1):
        sx = x1 + ux * (i*(dash+gap))
        sy = y1 + uy * (i*(dash+gap))
        ex = sx + ux * dash
        ey = sy + uy * dash
        if math.hypot(ex-x1, ey-y1) > dist:
            ex, ey = x2, y2
        draw.line([(sx, sy), (ex, ey)], fill=color, width=width)

def arrow_head_at(p_from, p_to, color, size=10):
    x1, y1 = p_from
    x2, y2 = p_to
    angle = math.atan2(y2-y1, x2-x1)
    a1 = angle + math.radians(155)
    a2 = angle - math.radians(155)
    p1 = (x2 + size*math.cos(a1), y2 + size*math.sin(a1))
    p2 = (x2 + size*math.cos(a2), y2 + size*math.sin(a2))
    draw.line([p1, (x2, y2)], fill=color, width=2)
    draw.line([p2, (x2, y2)], fill=color, width=2)

def stereo_label(p1, p2, text, color):
    mx = (p1[0] + p2[0]) // 2
    my = (p1[1] + p2[1]) // 2
    label = f"«{text}»"
    bbox = draw.textbbox((mx, my), label, font=f_stereo, anchor="mm")
    pad = 4
    draw.rectangle([bbox[0]-pad, bbox[1]-pad, bbox[2]+pad, bbox[3]+pad],
                   fill=(255, 255, 255), outline=color)
    draw.text((mx, my), label, font=f_stereo, fill=color, anchor="mm")

def actor_to_uc(actor_x, actor_y, uc, color=LINE_C):
    cx, cy, rx, ry = uc[:4]
    body_y = actor_y + 50
    ex, ey = ellipse_edge_point(cx, cy, rx, ry, actor_x, body_y)
    if cx > actor_x:
        ax = actor_x + 32
    else:
        ax = actor_x - 32
    ay = body_y
    draw.line([(ax, ay), (ex, ey)], fill=color, width=2)

def uc_to_uc_dashed(src, dst, stereo, color):
    sx, sy, srx, sry = src[:4]
    dx, dy, drx, dry = dst[:4]
    p1 = ellipse_edge_point(sx, sy, srx, sry, dx, dy)
    p2 = ellipse_edge_point(dx, dy, drx, dry, sx, sy)
    dashed_line(p1, p2, color=color)
    arrow_head_at(p1, p2, color)
    stereo_label(p1, p2, stereo, color)

def uc_to_uc_dashed_orthogonal(src, dst, stereo, color, via_x):
    """Dashed line dengan jalur siku: keluar dari KIRI src,
    lurus ke kolom via_x, turun ke level dst, lalu masuk ATAS dst.
    Aman dari overlap dengan use case lain di kolom yang sama."""
    sx, sy, srx, sry = src[:4]
    dx, dy, drx, dry = dst[:4]
    # exit point: kiri ellipse src
    p1 = (sx - srx, sy)
    # entry point: atas ellipse dst
    p2 = (dx, dy - dry)
    waypoint1 = (via_x, sy)         # belok dari horizontal ke vertikal
    waypoint2 = (via_x, p2[1])      # belok dari vertikal ke horizontal
    dashed_line(p1, waypoint1, color=color)
    dashed_line(waypoint1, waypoint2, color=color)
    dashed_line(waypoint2, p2, color=color)
    arrow_head_at(waypoint2, p2, color)
    # label di segmen vertikal panjang
    midv1 = (via_x, (waypoint1[1] + waypoint2[1]) / 2)
    midv2 = (via_x + 1, midv1[1])  # dummy untuk anchor
    stereo_label(midv1, midv2, stereo, color)

# ===================================================================
# Asosiasi aktor → use case
# ===================================================================
warga_ucs = [UC_LOGIN_W, UC_AJUKAN, UC_LACAK, UC_DOWNLOAD, UC_PROFIL_W]
admin_ucs = [UC_LOGIN_A, UC_KELOLA_P, UC_APPROVE, UC_KELOLA_T, UC_UPLOAD_T, UC_PROFIL_A]

for uc in warga_ucs:
    actor_to_uc(WARGA_X, WARGA_Y, uc)
for uc in admin_ucs:
    actor_to_uc(ADMIN_X, ADMIN_Y, uc)

# ===================================================================
# <<include>> — proses sistem otomatis yang dipicu use case
# ===================================================================
# Approve <<include>> Generate Nomor + Generate PDF
# Pakai jalur orthogonal turun dulu lewat kolom kosong (x=830) sebelum menuju node sistem
# supaya garis tidak melewati Kelola Template / Upload TTD / Profil Admin yang segaris dengan Approve.
uc_to_uc_dashed_orthogonal(UC_APPROVE, UC_GEN_NOMOR, "include", INC_COLOR, via_x=720)
uc_to_uc_dashed_orthogonal(UC_APPROVE, UC_GEN_PDF,   "include", INC_COLOR, via_x=790)

# ===================================================================
# Legend
# ===================================================================
LEG_X1, LEG_Y1 = 60, 850
LEG_X2, LEG_Y2 = 220, 1010
draw.rounded_rectangle([LEG_X1, LEG_Y1, LEG_X2, LEG_Y2],
                       radius=8, fill=(255, 255, 255), outline=LINE_C, width=2)
draw.text((LEG_X1+10, LEG_Y1+10), "Legenda:", font=f_actor, fill=TEXT_DARK)

# Solid line
draw.line([(LEG_X1+15, LEG_Y1+45), (LEG_X1+55, LEG_Y1+45)], fill=LINE_C, width=2)
draw.text((LEG_X1+62, LEG_Y1+45), "asosiasi", font=f_legend, fill=TEXT_DARK, anchor="lm")

# Dashed include
dashed_line((LEG_X1+15, LEG_Y1+72), (LEG_X1+55, LEG_Y1+72), color=INC_COLOR)
arrow_head_at((LEG_X1+15, LEG_Y1+72), (LEG_X1+55, LEG_Y1+72), INC_COLOR, size=8)
draw.text((LEG_X1+62, LEG_Y1+72), "«include»", font=f_legend, fill=INC_COLOR, anchor="lm")

# Color chips
draw.rectangle([LEG_X1+15, LEG_Y1+98, LEG_X1+30, LEG_Y1+111], fill=UC_FILL_W, outline=UC_BORD_W)
draw.text((LEG_X1+38, LEG_Y1+104), "Warga",  font=f_legend, fill=TEXT_DARK, anchor="lm")
draw.rectangle([LEG_X1+15, LEG_Y1+118, LEG_X1+30, LEG_Y1+131], fill=UC_FILL_A, outline=UC_BORD_A)
draw.text((LEG_X1+38, LEG_Y1+124), "Admin",  font=f_legend, fill=TEXT_DARK, anchor="lm")
draw.rectangle([LEG_X1+15, LEG_Y1+138, LEG_X1+30, LEG_Y1+151], fill=UC_FILL_S, outline=UC_BORD_S)
draw.text((LEG_X1+38, LEG_Y1+144), "Sistem", font=f_legend, fill=TEXT_DARK, anchor="lm")

# ===================================================================
# Save
# ===================================================================
out_a = "/home/yume/Me/Task/Project/surat-warga/docs/Use-Case-Diagram.png"
img.save(out_a, "PNG", optimize=True)
print(f"Saved: {out_a}  ({os.path.getsize(out_a)} bytes)")
