# 星火计划 - 数据库快速修复脚本
# PowerShell 版本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  星火计划 - 数据库修复工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 配置信息（根据实际情况修改）
$mysqlPath = "mysql"  # 如果 mysql 不在 PATH 中，使用完整路径如 "C:\xampp\mysql\bin\mysql.exe"
$dbHost = "localhost"
$dbUser = "xinghuojihua"
$dbPass = "aa123456"
$dbName = "xinghuojihua"
$sqlFile = "E:\www\youzi_czdy\czdy_admin\database_fix.sql"

# 检查 SQL 文件是否存在
if (-Not (Test-Path $sqlFile)) {
    Write-Host "❌ 错误：SQL 文件不存在: $sqlFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "请确保文件路径正确，然后重新运行此脚本。" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ 找到 SQL 文件: $sqlFile" -ForegroundColor Green
Write-Host ""

# 询问是否继续
Write-Host "即将执行以下操作：" -ForegroundColor Yellow
Write-Host "  1. 连接数据库: $dbName" -ForegroundColor Cyan
Write-Host "  2. 执行修复脚本: $sqlFile" -ForegroundColor Cyan
Write-Host ""
$continue = Read-Host "是否继续？(Y/N)"

if ($continue -ne "Y" -and $continue -ne "y") {
    Write-Host "已取消操作。" -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""
Write-Host "正在执行数据库修复..." -ForegroundColor Green
Write-Host ""

# 执行 SQL 命令
try {
    $command = "$mysqlPath -h $dbHost -u $dbUser -p$dbPass $dbName < $sqlFile"
    Invoke-Expression $command 2>&1 | Out-String

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 数据库修复成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "接下来的步骤：" -ForegroundColor Cyan
        Write-Host "  1. 清除后端缓存" -ForegroundColor White
        Write-Host "  2. 重启后端服务器" -ForegroundColor White
        Write-Host "  3. 刷新前端页面" -ForegroundColor White
        Write-Host ""

        # 询问是否清除缓存
        $clearCache = Read-Host "是否清除后端缓存？(Y/N)"
        if ($clearCache -eq "Y" -or $clearCache -eq "y") {
            Write-Host ""
            Write-Host "正在清除缓存..." -ForegroundColor Yellow
            $runtimePath = "E:\www\youzi_czdy\czdy_admin\runtime"

            if (Test-Path "$runtimePath\cache") {
                Remove-Item -Recurse -Force "$runtimePath\cache\*"
                Write-Host "✅ cache 目录已清空" -ForegroundColor Green
            }
            if (Test-Path "$runtimePath\temp") {
                Remove-Item -Recurse -Force "$runtimePath\temp\*"
                Write-Host "✅ temp 目录已清空" -ForegroundColor Green
            }
            if (Test-Path "$runtimePath\log") {
                Remove-Item -Recurse -Force "$runtimePath\log\*"
                Write-Host "✅ log 目录已清空" -ForegroundColor Green
            }

            Write-Host ""
            Write-Host "📝 请重启后端服务器：" -ForegroundColor Cyan
            Write-Host "   php think run -p 80" -ForegroundColor White
            Write-Host ""
        }
    } else {
        Write-Host "❌ 数据库修复失败！" -ForegroundColor Red
        Write-Host "请检查：" -ForegroundColor Yellow
        Write-Host "  1. MySQL 服务是否运行" -ForegroundColor White
        Write-Host "  2. 数据库用户名密码是否正确" -ForegroundColor White
        Write-Host "  3. 数据库是否存在" -ForegroundColor White
    }
} catch {
    Write-Host "❌ 执行出错: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
pause
