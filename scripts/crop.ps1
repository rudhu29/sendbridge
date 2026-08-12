param(
    [string]$src,
    [string]$dest,
    [int]$x,
    [int]$y,
    [int]$w,
    [int]$h
)
[void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
$srcPath = (Resolve-Path $src).Path
$bmp = New-Object System.Drawing.Bitmap $srcPath
$rect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)
$bmp.Dispose()
$cropped.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
Write-Host "Successfully cropped $src to $dest ($w x $h at $x,$y)"
