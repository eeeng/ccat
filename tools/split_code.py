import os

work_dir = r"c:\Users\hjroh\OneDrive\Desktop\고탈겜_통합"

# Read game sketch
with open(os.path.join(work_dir, "sketch.js"), "r", encoding="utf-8") as f:
    game_code = f.read()

# Read story sketch 
# Wait, original story sketch is not easily identifiable if we overwrote it. 
# Let's read from original folders.
with open(r"c:\Users\hjroh\OneDrive\Desktop\고탈겜_1\sketch.js", "r", encoding="utf-8") as f:
    game_code = f.read()

with open(r"c:\Users\hjroh\OneDrive\Desktop\고탈겜_2\sketch.js", "r", encoding="utf-8") as f:
    story_code = f.read()

# Extract globals and classes from game_code
# game_code has globals at the top, then preload, setup, draw, keyPressed, then GAME FLOW, WORLD GENERATION, SCENES, BACKGROUND DRAWING, CAT DRAWING, CLASSES
# Let's just output game_code minus standard p5 functions.
import re

def remove_function(code, func_name):
    pattern = r"function\s+" + func_name + r"\s*\([\s\S]*?\n}\n"
    # This naive regex might fail with nested braces. 
    # Let's do a brace matching extraction.
    start_idx = code.find(f"function {func_name}(")
    if start_idx == -1: return code
    
    # Find the opening brace
    brace_idx = code.find("{", start_idx)
    brace_count = 1
    end_idx = brace_idx + 1
    while brace_count > 0 and end_idx < len(code):
        if code[end_idx] == '{': brace_count += 1
        elif code[end_idx] == '}': brace_count -= 1
        end_idx += 1
        
    return code[:start_idx] + code[end_idx:]

game_code_clean = game_code
for fn in ["preload", "setup", "draw", "keyPressed"]:
    game_code_clean = remove_function(game_code_clean, fn)

story_code_clean = story_code
for fn in ["preload", "setup", "draw", "mousePressed", "keyPressed", "windowResized"]:
    story_code_clean = remove_function(story_code_clean, fn)

with open(os.path.join(work_dir, "game.js"), "w", encoding="utf-8") as f:
    f.write(game_code_clean)

with open(os.path.join(work_dir, "story.js"), "w", encoding="utf-8") as f:
    f.write(story_code_clean)

print("Split completed.")
