# 星火计划 API 完善说明

## ✅ 已完成的功能

### 1. 家庭管理接口（Family）

#### 1.1 获取家庭信息
- **接口**: `GET /api/family/info`
- **说明**: 获取当前用户的家庭信息
- **返回**: 家庭信息和成员列表

#### 1.2 创建家庭
- **接口**: `POST /api/family/create`
- **参数**: `family_name` (可选)
- **说明**: 创建新家庭，创建者自动成为家长

#### 1.3 邀请家庭成员
- **接口**: `POST /api/family/invite`
- **参数**: `user_id`, `role` (parent/child)
- **说明**: 通过用户ID邀请成员

#### 1.4 通过联系方式邀请
- **接口**: `POST /api/family/invite-by-contact`
- **参数**: `contact` (手机号或邮箱), `role`
- **说明**: 通过手机号或邮箱邀请成员

#### 1.5 获取家庭成员列表
- **接口**: `GET /api/family/members`
- **说明**: 获取当前家庭的所有成员

#### 1.6 移除家庭成员
- **接口**: `POST /api/family/remove-member`
- **参数**: `user_id`
- **说明**: 只有家庭创建者可以移除成员

#### 1.7 退出家庭
- **接口**: `POST /api/family/leave`
- **说明**: 退出当前家庭（创建者不能退出）

#### 1.8 解散家庭
- **接口**: `POST /api/family/dissolve`
- **说明**: 解散家庭（只有创建者可以）

#### 1.9 搜索用户
- **接口**: `GET /api/family/search-user`
- **参数**: `keyword`
- **说明**: 搜索用户用于邀请

### 2. 成长报告接口（Report）

#### 2.1 获取周报
- **接口**: `GET /api/report/weekly`
- **参数**: `user_id` (可选), `week_start` (可选, YYYY-MM-DD)
- **返回**: 任务统计、能量值统计、徽章统计、心愿统计

#### 2.2 获取月报
- **接口**: `GET /api/report/monthly`
- **参数**: `user_id` (可选), `month` (可选, YYYY-MM)
- **返回**: 任务统计、能量值统计、徽章统计、心愿统计、每日趋势

### 3. 知识库接口（Knowledge）

#### 3.1 获取知识库列表
- **接口**: `GET /api/knowledge/list`
- **参数**: `category`, `keyword`, `page`, `limit`
- **说明**: 获取知识库文章列表

#### 3.2 获取知识库详情
- **接口**: `GET /api/knowledge/detail/{id}`
- **说明**: 获取文章详情，自动增加浏览次数

#### 3.3 获取分类列表
- **接口**: `GET /api/knowledge/categories`
- **返回**: 所有分类列表

#### 3.4 创建知识库文章
- **接口**: `POST /api/knowledge/create`
- **参数**: `title`, `content`, `category`
- **说明**: 创建新文章（管理员功能）

### 4. 数据统计接口（Statistics）

#### 4.1 获取仪表盘统计
- **接口**: `GET /api/statistics/dashboard`
- **参数**: `user_id` (可选)
- **返回**: 今日统计、本周统计、总体统计、分类分布、打卡趋势

#### 4.2 获取家庭统计
- **接口**: `GET /api/statistics/family`
- **说明**: 获取家庭中所有孩子的统计数据（仅家长可访问）

### 5. 完善的功能

#### 5.1 任务接口完善
- ✅ 任务创建时自动关联家庭ID
- ✅ 任务创建后自动通知家长
- ✅ 任务建议时验证家庭关系
- ✅ 任务打卡后通知家长

#### 5.2 心愿接口完善
- ✅ 心愿创建时自动关联家庭ID
- ✅ 心愿创建后自动通知家长
- ✅ 心愿申请实现时通知家长

## 📋 数据库更新

### 新增表

#### 知识库表（fa_knowledge）
```sql
CREATE TABLE IF NOT EXISTS `fa_knowledge` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '标题',
  `content` text COMMENT '内容',
  `category` varchar(50) NOT NULL DEFAULT '' COMMENT '分类',
  `author_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '作者ID',
  `view_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '浏览次数',
  `status` varchar(20) NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL,
  `updatetime` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库表';
```

## 🔧 权限控制

### 角色检查类（RoleCheck）

提供了以下方法：
- `isParent($userId, $familyId)` - 检查是否为家长
- `isChild($userId, $familyId)` - 检查是否为孩子
- `isInSameFamily($userId1, $userId2)` - 检查是否在同一家庭
- `canAccessUserData($currentUserId, $targetUserId)` - 检查是否有权限访问用户数据

### 权限规则

1. **任务相关**:
   - 孩子可以创建任务，需要家长确认
   - 家长可以建议任务给同一家庭的孩子
   - 只有任务执行人可以打卡

2. **心愿相关**:
   - 孩子可以创建心愿，需要家长审核
   - 家长可以审核和确认心愿实现

3. **报告和统计**:
   - 用户可以查看自己的报告和统计
   - 家长可以查看同一家庭孩子的报告和统计

4. **家庭管理**:
   - 只有家长可以邀请成员
   - 只有创建者可以移除成员和解散家庭

## 📱 前端服务文件

已创建以下前端服务文件：

1. **family.ts** - 家庭管理服务
2. **report.ts** - 成长报告服务
3. **knowledge.ts** - 知识库服务
4. **statistics.ts** - 数据统计服务

所有服务文件都包含完整的 TypeScript 类型定义。

## 🚀 使用示例

### 前端调用示例

```typescript
import { familyService } from '@/services/family';
import { reportService } from '@/services/report';
import { statisticsService } from '@/services/statistics';

// 获取家庭信息
const familyInfo = await familyService.getFamilyInfo();

// 获取周报
const weeklyReport = await reportService.getWeeklyReport({
  week_start: '2024-01-01'
});

// 获取统计数据
const stats = await statisticsService.getDashboardStats();
```

## ⚠️ 注意事项

1. **知识库表**: 需要手动执行 SQL 创建 `fa_knowledge` 表
2. **权限验证**: 部分接口需要根据实际业务需求进一步完善权限验证
3. **缓存优化**: 建议对频繁查询的统计数据添加缓存
4. **错误处理**: 建议完善错误处理和日志记录

## 📝 后续优化建议

1. 添加操作日志记录
2. 实现数据缓存机制
3. 完善异常处理和错误提示
4. 添加接口限流和防刷机制
5. 实现数据导出功能（Excel/PDF）
6. 添加更多统计维度和图表数据

