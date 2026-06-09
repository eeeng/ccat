$gamePath = ".\game.js"
$game = (Get-Content $gamePath -Encoding UTF8) -join "`n"

$game = $game -replace '\bfunction preload\(\)', 'function preloadGame()'
$game = $game -replace '\bfunction setup\(\)', 'function setupGame()'
$game = $game -replace '\bfunction draw\(\)', 'function drawGame()'
$game = $game -replace '\bfunction keyPressed\(\)', 'function keyPressedGame()'

$game = $game -replace '(?<!\.)\bwidth\b', '600'
$game = $game -replace '(?<!\.)\bheight\b', '800'

Set-Content -Path $gamePath -Value $game -Encoding UTF8

$storyPath = ".\story.js"
$story = (Get-Content $storyPath -Encoding UTF8) -join "`n"

$story = $story -replace '\bfunction preload\(\)', 'function preloadStory()'
$story = $story -replace '\bfunction setup\(\)', 'function setupStory()'
$story = $story -replace '\bfunction draw\(\)', 'function drawStory()'
$story = $story -replace '\bfunction mousePressed\(\)', 'function mousePressedStory()'
$story = $story -replace '\bfunction keyPressed\(\)', 'function keyPressedStory()'
$story = $story -replace '\bfunction windowResized\(\)', 'function windowResizedStory()'

Set-Content -Path $storyPath -Value $story -Encoding UTF8

Write-Output "Renamed functions successfully."
