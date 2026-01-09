@echo off
chcp 65001 >nul
echo ========================================
echo   星火计划 - 数据库快速修复工具
echo ========================================
echo.

set MYSQL=mysql
set DB_HOST=localhost
set DB_USER=xinghuojihua
set DB_PASS=aa123456
set DB_NAME=xinghuojihua
set SQL_FILE=E:\www\youzi_czdy\czdy_admin\database_fix.sql

echo 即将执行数据库修复...
echo.
echo 数据库: %DB_NAME%
echo SQL文件: %SQL_FILE%
echo.

set /p CONTINUE=是否继续？(Y/N):
if /i not "%CONTINUE%"=="Y" goto :end

echo.
echo 正在执行数据库修复...
echo.

%MYSQL% -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% < %SQL_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 数据库修复成功！
    echo.
    echo 接下来的步骤：
    echo   1. 清除后端缓存
    echo   2. 重启后端服务器
    echo   3. 刷新前端页面
    echo.

    set /p CLEAR_CACHE=是否清除后端缓存？(Y/N):
    if /i "%CLEAR_CACHE%"=="Y" (
        echo.
        echo 正在清除缓存...
        rd /s /q E:\www\youzi_czdy\czdy_admin\runtime\cache 2>nul
        rd /s /q E:\www\youzi_czdy\czdy_admin\runtime\temp 2>nul
        rd /s /q E:\www\youzi_czdy\czdy_admin\runtime\log 2>nul
        echo ✅ 缓存已清除
        echo.
        echo 请重启后端服务器：
        echo   cd E:\www\youzi_czdy\czdy_admin
        echo   php think run -p 80
        echo.
    )
) else (
    echo.
    echo ❌ 数据库修复失败！
    echo 请检查：
    echo   1. MySQL 服务是否运行
    echo   2. 数据库用户名密码是否正确
    echo   3. 数据库是否存在
    echo.
)

:end
pause
