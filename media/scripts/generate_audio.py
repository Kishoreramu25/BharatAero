import asyncio
import edge_tts
import subprocess
import imageio_ffmpeg

F = imageio_ffmpeg.get_ffmpeg_exe()

scenes = [
    ('scene2.mp3', 'Meet Kumar. Kumar is a landowner, and he needs a drone to spray and protect his crops. Kumar taps I Need Drone Services, enters his email, and signs in to Bharat Aero.'),
    ('scene3.mp3', "Kumar opens the pilot list to find help. Right near his farm, he finds Kishore, a top-rated certified drone pilot. Kumar checks Kishore's profile and agriculture equipment."),
    ('scene4.mp3', 'Kumar books Kishore for a live farm survey. He selects fifty-acre paddy crop spraying, drops the pin on his field, and confirms the mission broadcast!'),
    ('scene5.mp3', "Now let's switch to Kishore. Kishore is a certified drone pilot ready to fly. He opens Bharat Aero, chooses Certified Pilot, and logs into his pilot account."),
    ('scene6.mp3', "Kumar's farm booking appears instantly on Kishore's live mission board! Kishore reviews Kumar's crop spraying request, taps View and Accept, and confirms the flight!"),
    ('scene7.mp3', "Just like booking a cab on your phone, Bharat Aero connects landowners with certified drone pilots in seconds. Kumar's crops are safe, Kishore gets paid, and Bharat Aero powers India's skies!")
]

async def gen():
    for filename, text in scenes:
        c = edge_tts.Communicate(text, 'en-IN-NeerjaExpressiveNeural', rate='+0%')
        await c.save(filename)
        print(f"Generated {filename}")

if __name__ == '__main__':
    asyncio.run(gen())

    # Write concat list for full narration
    with open('concat_list.txt', 'w', encoding='utf-8') as f:
        for i in range(1, 8):
            f.write(f"file scene{i}.mp3\n")

    # Combine with ffmpeg
    subprocess.run([
        F, '-y', '-f', 'concat', '-safe', '0',
        '-i', 'concat_list.txt',
        '-c', 'copy',
        'full_narration.mp3'
    ], check=True)
    print("Full narration stitched into full_narration.mp3")

    for i in range(1, 8):
        fn = f'scene{i}.mp3'
        res = subprocess.run([F, '-i', fn], capture_output=True, text=True)
        for line in res.stderr.split('\n'):
            if 'Duration:' in line:
                print(fn, line.strip())
