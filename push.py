import subprocess
import os

path = r'c:\Users\Lydia mwanza\OneDrive\Desktop\personal projects\w-The-Greggory-Systems-And-Strategy-firm'
os.chdir(path)

print("Staging file...")
subprocess.run(['git', 'add', 'The-Greggory-Systems-And-Strategy-firm website/src/pages/About.jsx'], check=True)

print("Committing...")
subprocess.run(['git', 'commit', '-m', 'Simplify About Us section language for better client readability'], check=True)

print("Pushing...")
subprocess.run(['git', 'push', 'origin', 'main'], check=True)

print("Done!")
