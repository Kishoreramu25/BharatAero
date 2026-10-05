import os
import sys
import time
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.dirname(SCRIPT_DIR)
RECORD_DIR = os.path.join(MEDIA_DIR, 'demo_raw_video')
os.makedirs(RECORD_DIR, exist_ok=True)

# Layout Injection: Separates Phone Screen (height: 830px) from Studio Caption Bar (height: 130px)
# Zero overlap on the app UI! Mobile view is 100% visible!
CAPTION_JS = """
window.setupDemoLayout = function() {
    document.documentElement.style.cssText = 'height: 100%; overflow: hidden; margin: 0; padding: 0; background: #080c09;';
    document.body.style.cssText = 'height: 100%; overflow: hidden; margin: 0; padding: 0; background: #080c09; display: flex; flex-direction: column;';

    const root = document.getElementById('root');
    if (root) {
        root.style.cssText = 'height: 830px !important; min-height: 830px !important; max-height: 830px !important; width: 100% !important; overflow: hidden !important; position: relative !important; flex-shrink: 0 !important;';
    }

    let captionBar = document.getElementById('video-caption-bar');
    if (!captionBar) {
        captionBar = document.createElement('div');
        captionBar.id = 'video-caption-bar';
        captionBar.style.cssText = `
            height: 130px !important;
            width: 100% !important;
            background: linear-gradient(180deg, #111a14 0%, #0a100c 100%) !important;
            border-top: 2px solid #ca0013 !important;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.7) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 10px 20px !important;
            box-sizing: border-box !important;
            z-index: 999999 !important;
            text-align: center !important;
            flex-shrink: 0 !important;
        `;
        captionBar.innerHTML = `
            <div id="caption-badge" style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 10.5px;
                font-weight: 800;
                letter-spacing: 1.4px;
                color: #ffffff;
                background: #ca0013;
                padding: 3px 10px;
                border-radius: 4px;
                text-transform: uppercase;
                margin-bottom: 6px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                BHARAT AERO
            </div>
            <div id="caption-text" style="
                font-size: 13.5px;
                font-weight: 600;
                color: #ffffff;
                line-height: 1.38;
                max-width: 400px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
            ">
                Loading...
            </div>
        `;
        document.body.appendChild(captionBar);
    }
};

window.updateCaption = function(badge, text) {
    window.setupDemoLayout();
    const b = document.getElementById('caption-badge');
    const t = document.getElementById('caption-text');
    if (b) b.innerText = badge;
    if (t) t.innerText = text;
};
"""

def set_caption(page, badge, text):
    try:
        page.evaluate(f"window.updateCaption({repr(badge)}, {repr(text)});")
    except Exception as e:
        print("Caption error:", e, flush=True)

def smooth_scroll(page, start_y, end_y, steps=15, delay=0.03):
    try:
        for step in range(steps + 1):
            y = start_y + (end_y - start_y) * (step / steps)
            page.evaluate(f"() => {{ const m = document.querySelector('main') || window; m.scrollTo(0, {y}); }}")
            time.sleep(delay)
    except Exception as e:
        pass

def main():
    print("🚁 Launching Playwright with Edge for BharatAero Video Recording...", flush=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(
            viewport={'width': 440, 'height': 960},
            record_video_dir=RECORD_DIR,
            record_video_size={'width': 440, 'height': 960},
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()
        page.add_init_script(CAPTION_JS)

        # 1. Fresh launch
        page.goto('http://localhost:3000', wait_until='domcontentloaded')
        page.evaluate("localStorage.clear(); sessionStorage.clear();")
        page.reload(wait_until='domcontentloaded')
        page.wait_for_timeout(1000)

        # ==========================================
        # SCENE 1: Splash & Onboarding (13.5s)
        # ==========================================
        print("▶️ Recording Scene 1: Opening Hook & Carousel (13.5s)...", flush=True)
        set_caption(page, "🎙️ Bharat Aero Intro", "Like Rapido for bikes, Uber for cabs, Ola for auto, Bharat Aero is for drones!")
        page.wait_for_timeout(4500)
        
        # Carousel slide 2
        set_caption(page, "🚁 Autonomous UAV Ops", "Welcome to Bharat Aero: India's premier drone pilot & fleet operations platform.")
        page.evaluate("() => { const dots = document.querySelectorAll('.h-2.cursor-pointer'); if(dots[1]) dots[1].click(); }")
        page.wait_for_timeout(4500)

        # Carousel slide 3
        page.evaluate("() => { const dots = document.querySelectorAll('.h-2.cursor-pointer'); if(dots[2]) dots[2].click(); }")
        page.wait_for_timeout(3300)
        
        # Click Get Started / Skip
        page.evaluate("() => { const b = document.querySelector('button'); if(b) b.click(); }")
        page.wait_for_timeout(1200)

        # ==========================================
        # SCENE 2: Meet Kumar the Landowner (Login 1) (14.1s)
        # ==========================================
        print("▶️ Recording Scene 2: Landowner Kumar Login (14.1s)...", flush=True)
        set_caption(page, "🌾 Landowner Login", "Meet Kumar. He is a landowner who needs a drone for his farm crops. He chooses Client Services and logs in.")
        page.wait_for_timeout(2000)

        # Select Client role card (Kumar)
        page.evaluate("() => { const cards = document.querySelectorAll('.cursor-pointer'); if(cards[0]) cards[0].click(); }")
        page.wait_for_timeout(1500)

        # Click Continue to Login
        page.locator('button:has-text("Continue")').first.click(force=True)
        page.wait_for_timeout(1200)

        # Type Kumar credentials
        page.fill('input[placeholder="Email"]', 'kumar@gmail.com')
        page.wait_for_timeout(1000)
        page.fill('input[placeholder="Password"]', 'Password123!')
        page.wait_for_timeout(1000)

        # Submit Sign In
        page.locator('button[type="submit"]').first.click(force=True)
        page.wait_for_timeout(2500)

        # Dashboard loaded: Kumar (Landowner)
        smooth_scroll(page, 0, 220, steps=15, delay=0.03)
        page.wait_for_timeout(2500)
        smooth_scroll(page, 220, 0, steps=15, delay=0.03)
        page.wait_for_timeout(2400)

        # ==========================================
        # SCENE 3: Kumar Finds Kishore the Pilot (14.1s)
        # ==========================================
        print("▶️ Recording Scene 3: Browse Pilots & Kishore Profile (14.1s)...", flush=True)
        set_caption(page, "🔍 Browse Certified Pilots", "Kumar browses certified drone operators and finds Kishore Ramu, an agricultural specialist.")
        page.wait_for_timeout(1500)

        # Click Browse Pilots quick link
        page.locator('#quick-link-browse-pilots').click(force=True)
        page.wait_for_timeout(2500)

        # Smooth scroll slightly
        smooth_scroll(page, 0, 100, steps=10, delay=0.03)
        page.wait_for_timeout(1200)

        # Click Kishore Ramu's profile card
        page.evaluate("() => { const card = Array.from(document.querySelectorAll('.cursor-pointer, .bg-white.rounded-2xl.border')).find(c => c.innerText.includes('Kishore') || c.innerText.includes('Kisho')) || document.querySelector('.bg-white.rounded-2xl.border'); if(card) card.click(); }")
        page.wait_for_timeout(2500)

        # View Kishore's pilot profile & equipment
        smooth_scroll(page, 0, 180, steps=12, delay=0.03)
        page.wait_for_timeout(3500)
        smooth_scroll(page, 180, 0, steps=12, delay=0.03)
        page.wait_for_timeout(2900)

        # ==========================================
        # SCENE 4: Kumar Books Kishore Live (11.4s)
        # ==========================================
        print("▶️ Recording Scene 4: Live Mission Booking & Satellite GPS (11.4s)...", flush=True)
        set_caption(page, "🗺️ Live Farm Booking", "Kumar books Kishore for a 50-acre crop spraying job. He sets field coordinates on the GPS satellite map and confirms!")
        page.wait_for_timeout(1200)

        # Click Book Flight Mission button
        page.locator('button:has-text("Book Flight Mission")').first.click(force=True)
        page.wait_for_timeout(1500)

        # Magic Fill form
        page.locator('button:has-text("Magic Fill")').first.click(force=True)
        page.wait_for_timeout(1500)

        # Smooth scroll down to view satellite map & dropped field pin
        smooth_scroll(page, 0, 500, steps=15, delay=0.03)
        page.wait_for_timeout(2500)

        # Scroll further down to submit button
        smooth_scroll(page, 500, 950, steps=12, delay=0.03)
        page.wait_for_timeout(1200)

        # Click Confirm & Broadcast Mission
        page.locator('button:has-text("Confirm & Broadcast Mission")').first.click(force=True)
        page.wait_for_timeout(3500)

        # ==========================================
        # SCENE 5: Meet Kishore the Pilot (Login 2) (13.0s)
        # ==========================================
        print("▶️ Recording Scene 5: Kishore (Drone Pilot) Login (13.0s)...", flush=True)
        set_caption(page, "🚁 Pilot Login", "Now let us switch to Kishore. He is a certified drone pilot. He chooses Pilot Mode and logs into his operator portal.")
        
        # Reset storage & return to fresh start
        page.evaluate("() => { localStorage.clear(); sessionStorage.clear(); }")
        page.goto('http://localhost:3000', wait_until='domcontentloaded')
        page.wait_for_timeout(1500)

        # Skip onboarding
        page.evaluate("() => { const b = document.querySelector('button'); if(b) b.click(); }")
        page.wait_for_timeout(1500)

        # Select Pilot role card
        page.evaluate("() => { const cards = document.querySelectorAll('.cursor-pointer'); if(cards[1]) cards[1].click(); }")
        page.wait_for_timeout(1500)

        # Continue to Login
        page.locator('button:has-text("Continue")').first.click(force=True)
        page.wait_for_timeout(1200)

        # Type Kishore credentials
        page.fill('input[placeholder="Email"]', 'kishore@gmail.com')
        page.wait_for_timeout(1000)
        page.fill('input[placeholder="Password"]', 'Password123!')
        page.wait_for_timeout(1000)

        # Submit Sign In
        page.locator('button[type="submit"]').first.click(force=True)
        page.wait_for_timeout(4300)

        # ==========================================
        # SCENE 6: Kishore Receives Booking & Accepts Live (12.2s)
        # ==========================================
        print("▶️ Recording Scene 6: Live Board & Acceptance (12.2s)...", flush=True)
        set_caption(page, "⚡ Mission Accepted Live", "Kumar's farm booking appears on Kishore's live board. Kishore reviews the job, accepts it, and confirms deployment!")
        page.wait_for_timeout(1500)

        # Smooth scroll down to Mission Board
        smooth_scroll(page, 0, 180, steps=10, delay=0.03)
        page.wait_for_timeout(2000)

        # Click View & Accept on Kumar's booking
        page.locator('button:has-text("View & Accept")').first.click(force=True)
        page.wait_for_timeout(3000)

        # Click Accept Mission in modal
        page.locator('button:has-text("Accept Mission")').first.click(force=True)
        page.wait_for_timeout(3000)

        # Active mission appears with countdown timer
        smooth_scroll(page, 0, 160, steps=10, delay=0.03)
        page.wait_for_timeout(2700)

        # ==========================================
        # SCENE 7: Indian Drone Mobility & Closing (14.2s)
        # ==========================================
        print("▶️ Recording Scene 7: Indian Drone Mobility Closing (14.2s)...", flush=True)
        set_caption(page, "🇮🇳 Bharat Aero", "Fast, reliable drone booking. Connecting Indian landowners and pilots on demand.")
        page.wait_for_timeout(3500)

        # Smooth scroll to show full flight parameters & dispatch
        smooth_scroll(page, 160, 0, steps=10, delay=0.03)
        page.wait_for_timeout(3500)

        # Switch to Home / Overview
        page.evaluate("() => { const btns = document.querySelectorAll('nav button'); if(btns[0]) btns[0].click(); }")
        page.wait_for_timeout(7200)

        # Close page and context to finalize recording
        page.close()
        context.close()
        browser.close()
        print("✅ Raw Playwright video recording completed!", flush=True)

    # Find the recorded video file
    video_files = [os.path.join(RECORD_DIR, f) for f in os.listdir(RECORD_DIR) if f.endswith('.webm')]
    if not video_files:
        print("❌ No recorded video found!", flush=True)
        return

    latest_video = max(video_files, key=os.path.getmtime)
    print(f"🎬 Latest raw video: {latest_video}", flush=True)

    output_mp4 = os.path.join(MEDIA_DIR, 'BharatAero_Official_Demo.mp4')
    output_webm = os.path.join(MEDIA_DIR, 'BharatAero_Official_Demo.webm')
    audio_path = os.path.join(MEDIA_DIR, 'full_narration.mp3')

    # Merge video and full_narration.mp3 using ffmpeg
    print("🎵 Merging video and audio with ffmpeg into MP4...", flush=True)
    ffmpeg_cmd = [
        FFMPEG, '-y',
        '-i', latest_video,
        '-i', audio_path,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        output_mp4
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"🎉 FINAL VIDEO CREATED: {output_mp4}", flush=True)

    # Also export WebM version for browser embedding
    print("🌐 Creating browser-ready WebM version...", flush=True)
    ffmpeg_webm_cmd = [
        FFMPEG, '-y',
        '-i', output_mp4,
        '-c:v', 'libvpx-vp9',
        '-crf', '32',
        '-b:v', '0',
        '-cpu-used', '4',
        '-deadline', 'realtime',
        '-threads', '4',
        '-row-mt', '1',
        '-c:a', 'libopus',
        '-b:a', '128k',
        output_webm
    ]
    subprocess.run(ffmpeg_webm_cmd, check=True)
    print(f"🎉 BROWSER-READY WEBM CREATED: {output_webm}", flush=True)

if __name__ == '__main__':
    main()
