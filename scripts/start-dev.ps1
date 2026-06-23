$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Stop-ProjectProcess {
    $processes = Get-CimInstance Win32_Process | Where-Object {
        $_.CommandLine -and (
            $_.CommandLine -like "*invisible-mechanics-application*" -or
            $_.CommandLine -like "*uvicorn.exe app.main:app*" -or
            $_.CommandLine -like "*next dev*"
        ) -and $_.ProcessId -ne $PID
    }

    foreach ($process in $processes) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

function Stop-ListeningPort {
    param([int] $Port)

    for ($attempt = 0; $attempt -lt 10; $attempt++) {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if (-not $connections) {
            return
        }

        foreach ($connection in $connections) {
            $processId = $connection.OwningProcess
            if ($processId -and $processId -ne $PID) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }

        Start-Sleep -Milliseconds 500
    }

    throw "Port $Port is still in use after cleanup."
}

Stop-ProjectProcess
Stop-ListeningPort -Port 3000
Stop-ListeningPort -Port 8001
Start-Sleep -Seconds 1

$concurrently = Join-Path $root "node_modules\.bin\concurrently.cmd"
& $concurrently --kill-others-on-fail --names "backend,web" --prefix-colors "blue,green" "npm:dev:backend" "npm:dev:web"
