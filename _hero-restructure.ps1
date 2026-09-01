$ErrorActionPreference = 'Stop'
$p = 'The-Greggory-Systems-And-Strategy-firm website\src\pages\About.jsx'
$t = [IO.File]::ReadAllText($p)

# ---- 1. Locate hero left column and the h1 end ----
$leftStart = $t.IndexOf('<div className="lg:w-2/3">')
if ($leftStart -lt 0) { throw 'left col not found' }
$h1End = $t.IndexOf('</h1>', $leftStart)
if ($h1End -lt 0) { throw 'h1 close not found' }
$h1End = $h1End + '</h1>'.Length

# ---- 2. Locate the deep-content block inside the right column (paragraph + divider + mini-heading + caption) ----
$rightColStart = $t.IndexOf('<div className="lg:w-2/5 space-y-6">')
if ($rightColStart -lt 0) { throw 'right col not found' }
$blockStart = $t.IndexOf('<div className="space-y-4">', $rightColStart)
if ($blockStart -lt 0) { throw 'content block not found' }
$blockEnd = $t.IndexOf('</div>', $blockStart) + '</div>'.Length

$contentBlock = $t.Substring($blockStart, $blockEnd - $blockStart)

# ---- 3. Remove the content block from the right column ----
$t = $t.Remove($blockStart, $contentBlock.Length)

# ---- 4. Reinsert it under the h1 in the left column (with top margin` ----
$contentBlock = $contentBlock.Replace(
  '<p className="text-base text-black leading-[1.8] font-normal">',
  '<p className="text-base text-black leading-[1.8] font-normal mt-8">'
)
$contentBlock = $contentBlock.Replace(
  '<div className="space-y-4">',
  '<div className="space-y-4 max-w-2xl">'
)

$t = $t.Insert($h1End, "`n`n" + $contentBlock + "`n")

[IO.File]::WriteAllText($p, $t, (New-Object System.Text.UTF8Encoding($false)))
Write-Output ('Hero restructure OK, new length: ' + $t.Length)