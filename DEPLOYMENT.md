# 星火计划 - 部署文档

## 目录

1. [环境要求](#环境要求)
2. [后端部署](#后端部署)
3. [前端部署](#前端部署)
4. [数据库初始化](#数据库初始化)
5. [Nginx 配置](#nginx-配置)
6. [常见问题](#常见问题)

---

## 环境要求

### 后端环境
- PHP >= 7.4
- MySQL >= 5.7
- Nginx 或 Apache
- Redis (可选，用于缓存和会话)

### 前端环境
- Node.js >= 16.x
- npm 或 yarn

---

## 后端部署

### 1. 上传代码

```bash
# 将后端代码上传到服务器
scp -r czdy_admin/ user@your-server:/var/www/
```

### 2. 配置环境变量

```bash
cd /var/www/czdy_admin

# 复制环境变量配置文件
cp .env.production.example .env

# 编辑配置文件
vim .env
```

修改以下配置：

```ini
[app]
app_debug = false
app_trace = false

[database]
hostname = 127.0.0.1
database = xinghuojihua
username = your_db_username
password = your_db_password
hostport = 3306
prefix = fa_

[cors]
cors_request_domain = your-domain.com,www.your-domain.com
```

### 3. 设置目录权限

```bash
# 设置运行时目录权限
chmod -R 755 runtime/
chown -R www-data:www-data runtime/

# 设置上传目录权限
chmod -R 755 public/uploads/
chown -R www-data:www-data public/uploads/
```

### 4. 配置虚拟主机

创建 Nginx 配置文件 `/etc/nginx/sites-available/xinghuojihua-api`：

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    root /var/www/czdy_admin/public;
    index index.php index.html;

    location / {
        if (!-e $request_filename) {
            rewrite ^(.*)$ /index.php?s=$1 last;
        }
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # 上传文件大小限制
    client_max_body_size 50M;
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/xinghuojihua-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. 配置 SSL（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d api.your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 前端部署

### 1. 构建生产版本

```bash
cd app_xhjh

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 配置环境变量

编辑 `.env.production`：

```bash
# API 基础地址
VITE_API_BASE_URL=https://api.your-domain.com

# 应用标题
VITE_APP_TITLE=星火计划
```

### 3. 上传构建文件

```bash
# 将构建后的文件上传到服务器
scp -r dist/* user@your-server:/var/www/html/
```

### 4. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/xinghuojihua-frontend`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/html;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/xinghuojihua-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. 配置 SSL

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 数据库初始化

### 1. 创建数据库

```sql
CREATE DATABASE xinghuojihua CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'xinghuojihua'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON xinghuojihua.* TO 'xinghuojihua'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 导入初始数据

```bash
# 导入数据库初始化脚本
mysql -u xinghuojihua -p xinghuojihua < database_init.sql
```

### 3. 验证数据

```sql
-- 检查勋章数据
SELECT COUNT(*) FROM fa_badge;

-- 检查知识库数据
SELECT COUNT(*) FROM fa_knowledge;
```

---

## Nginx 配置

### 完整的配置示例

```nginx
# API 服务器
upstream api_backend {
    server 127.0.0.1:9000;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS API 服务器
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/czdy_admin/public;
    index index.php;

    location / {
        if (!-e $request_filename) {
            rewrite ^(.*)$ /index.php?s=$1 last;
        }
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    client_max_body_size 50M;
}

# HTTPS 前端服务器
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

---

## 常见问题

### 1. 跨域问题

**问题**: 前端请求后端 API 时出现跨域错误

**解决方案**:
- 检查后端 `config.php` 中的 `cors_request_domain` 配置
- 确保前端域名已添加到允许列表中

### 2. 文件上传失败

**问题**: 上传图片或视频时失败

**解决方案**:
- 检查 Nginx 的 `client_max_body_size` 配置
- 检查 PHP 的 `upload_max_filesize` 和 `post_max_size` 配置
- 确保上传目录有写入权限

### 3. 路由 404

**问题**: 刷新页面时出现 404 错误

**解决方案**:
- 确保 Nginx 配置了 `try_files $uri $uri/ /index.html;`
- 检查前端路由是否正确配置

### 4. API 请求失败

**问题**: API 请求返回 500 错误

**解决方案**:
- 检查 PHP 错误日志: `tail -f /var/www/czdy_admin/runtime/log/error.log`
- 检查 Nginx 错误日志: `tail -f /var/log/nginx/error.log`
- 确认数据库连接配置正确

### 5. 静态资源加载失败

**问题**: JS、CSS 等静态资源无法加载

**解决方案**:
- 检查构建后的文件路径是否正确
- 确保 Nginx 配置的 root 路径正确
- 清除浏览器缓存重新加载

---

## 性能优化建议

### 1. 启用 OPcache

编辑 `php.ini`：

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

### 2. 配置 Redis 缓存

在 `.env` 中配置 Redis：

```ini
[cache]
cache_type = Redis
redis_host = 127.0.0.1
redis_port = 6379
```

### 3. 启用 CDN

将静态资源上传到 CDN，减轻服务器压力。

### 4. 数据库优化

- 添加适当的索引
- 定期清理过期数据
- 配置数据库连接池

---

## 监控和日志

### 1. 应用日志

```bash
# 查看应用日志
tail -f /var/www/czdy_admin/runtime/log/error.log
tail -f /var/www/czdy_admin/runtime/log/sql.log
```

### 2. Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 3. 系统监控

使用工具如：
- htop：系统资源监控
- netdata：实时性能监控
- Prometheus + Grafana：企业级监控方案

---

## 备份策略

### 1. 数据库备份

```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u xinghuojihua -p xinghuojihua > /backup/db_$DATE.sql
find /backup -name "db_*.sql" -mtime +7 -delete
```

### 2. 文件备份

```bash
# 备份上传文件
rsync -avz /var/www/czdy_admin/public/uploads/ /backup/uploads/
```

### 3. 代码备份

使用 Git 进行版本控制，定期推送到远程仓库。

---

## 更新部署

### 1. 后端更新

```bash
cd /var/www/czdy_admin

# 拉取最新代码
git pull origin main

# 更新依赖（如有必要）
composer update

# 清除缓存
php think clear

# 重启 PHP-FPM
systemctl restart php7.4-fpm
```

### 2. 前端更新

```bash
cd /var/www/html

# 备份当前版本
cp -r dist dist_backup

# 上传新版本
# ...上传新的 dist 文件...

# 清除浏览器缓存
# 可以在构建时使用版本号或 hash 来自动处理
```

---

## 安全建议

1. **定期更新**: 及时更新系统和依赖包
2. **强密码**: 使用强密码并定期更换
3. **防火墙**: 配置防火墙规则
4. **HTTPS**: 强制使用 HTTPS
5. **备份**: 定期备份数据
6. **监控**: 监控异常访问和错误日志
7. **权限**: 最小权限原则

---

**最后更新**: 2025-01-08
