const { execSync } = require('child_process');
const path = 'c:\\Users\\Lydia mwanza\\OneDrive\\Desktop\\personal projects\\w-The-Greggory-Systems-And-Strategy-firm';

try {
  console.log('Staging file...');
  execSync('git add "The-Greggory-Systems-And-Strategy-firm website/src/pages/About.jsx"', { cwd: path, stdio: 'inherit' });
  console.log('Committing...');
  execSync('git commit -m "Simplify About Us section language for better client readability"', { cwd: path, stdio: 'inherit' });
  console.log('Pushing...');
  execSync('git push origin main', { cwd: path, stdio: 'inherit' });
  console.log('Done!');
} catch (e) {
  console.error('Error:', e.message);
}
