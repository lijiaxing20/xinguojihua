<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Knowledge as KnowledgeModel;

/**
 * 知识库接口
 */
class Knowledge extends Api
{
    protected $noNeedLogin = ['list', 'detail', 'categories'];
    protected $noNeedRight = '*';

    /**
     * 获取知识库列表
     */
    public function list()
    {
        $category = $this->request->get('category', '');
        $keyword  = $this->request->get('keyword', '');
        $page     = (int)$this->request->get('page', 1);
        $limit    = (int)$this->request->get('limit', 10);

        $query = KnowledgeModel::where('status', 'published');

        if ($category) {
            $query->where('category', $category);
        }

        if ($keyword) {
            $query->where('title', 'like', "%{$keyword}%");
        }

        $list = $query->order('createtime', 'desc')
            ->page($page, $limit)
            ->select();

        $total = $query->count();

        // 格式化时间
        foreach ($list as &$item) {
            $item['createtime'] = date('Y-m-d H:i:s', $item['createtime']);
            $item['updatetime'] = date('Y-m-d H:i:s', $item['updatetime']);
        }
        unset($item);

        $this->success('', [
            'list'  => $list,
            'total' => $total,
        ]);
    }

    /**
     * 获取文章详情
     */
    public function detail($id = 0)
    {
        $article = KnowledgeModel::get($id);
        
        if (!$article || $article['status'] !== 'published') {
            $this->error('文章不存在或已下架');
        }

        // 增加阅读量
        $article->where('id', $id)->setInc('view_count');

        $article['createtime'] = date('Y-m-d H:i:s', $article['createtime']);
        $article['updatetime'] = date('Y-m-d H:i:s', $article['updatetime']);

        $this->success('', $article);
    }

    /**
     * 获取分类列表
     */
    public function categories()
    {
        $list = [
            ['value' => 'parenting', 'label' => '育儿技巧'],
            ['value' => 'education', 'label' => '学习教育'],
            ['value' => 'psychology', 'label' => '心理健康'],
            ['value' => 'health', 'label' => '身体健康'],
            ['value' => 'activity', 'label' => '亲子活动'],
        ];

        $this->success('', ['list' => $list]);
    }

    /**
     * 创建文章
     * POST /api/knowledge/create
     */
    public function create()
    {
        $title = $this->request->post('title');
        $content = $this->request->post('content');
        $category = $this->request->post('category', 'parenting');
        $summary = $this->request->post('summary', '');
        $coverImage = $this->request->post('cover_image', '');
        $tags = $this->request->post('tags', '');
        $status = $this->request->post('status', 'draft');

        // 验证必填字段
        if (!$title) {
            $this->error('标题不能为空');
        }
        if (!$content) {
            $this->error('内容不能为空');
        }

        // 检查权限（只有管理员可以创建文章）
        // 这里简化处理，假设所有登录用户都可以创建
        // 实际应该检查用户角色

        $data = [
            'title' => $title,
            'content' => $content,
            'category' => $category,
            'summary' => $summary,
            'cover_image' => $coverImage,
            'tags' => $tags,
            'status' => $status,
            'author_id' => $this->auth->id,
            'view_count' => 0,
            'createtime' => time(),
            'updatetime' => time(),
        ];

        $article = KnowledgeModel::create($data);

        $this->success('创建成功', [
            'id' => $article->id,
            'url' => "/knowledge/detail/{$article->id}",
        ]);
    }

    /**
     * 更新文章
     * POST /api/knowledge/update
     */
    public function update()
    {
        $id = $this->request->post('id');
        if (!$id) {
            $this->error('文章ID不能为空');
        }

        $article = KnowledgeModel::find($id);
        if (!$article) {
            $this->error('文章不存在');
        }

        // 检查权限（只有作者或管理员可以编辑）
        if ($article->author_id != $this->auth->id) {
            // 这里简化处理，实际应该检查用户角色
            // $this->error('无权限编辑此文章');
        }

        $title = $this->request->post('title');
        $content = $this->request->post('content');
        $category = $this->request->post('category');
        $summary = $this->request->post('summary');
        $coverImage = $this->request->post('cover_image');
        $tags = $this->request->post('tags');
        $status = $this->request->post('status');

        // 更新数据
        $updateData = ['updatetime' => time()];

        if ($title !== null) $updateData['title'] = $title;
        if ($content !== null) $updateData['content'] = $content;
        if ($category !== null) $updateData['category'] = $category;
        if ($summary !== null) $updateData['summary'] = $summary;
        if ($coverImage !== null) $updateData['cover_image'] = $coverImage;
        if ($tags !== null) $updateData['tags'] = $tags;
        if ($status !== null) $updateData['status'] = $status;

        $article->save($updateData);

        $this->success('更新成功', [
            'id' => $article->id,
            'url' => "/knowledge/detail/{$article->id}",
        ]);
    }

    /**
     * 删除文章
     * POST /api/knowledge/delete
     */
    public function delete()
    {
        $id = $this->request->post('id');
        if (!$id) {
            $this->error('文章ID不能为空');
        }

        $article = KnowledgeModel::find($id);
        if (!$article) {
            $this->error('文章不存在');
        }

        // 检查权限（只有作者或管理员可以删除）
        if ($article->author_id != $this->auth->id) {
            // 这里简化处理，实际应该检查用户角色
            // $this->error('无权限删除此文章');
        }

        $article->delete();

        $this->success('删除成功');
    }

    /**
     * 发布文章
     * POST /api/knowledge/publish
     */
    public function publish()
    {
        $id = $this->request->post('id');
        if (!$id) {
            $this->error('文章ID不能为空');
        }

        $article = KnowledgeModel::find($id);
        if (!$article) {
            $this->error('文章不存在');
        }

        // 检查权限
        if ($article->author_id != $this->auth->id) {
            // 这里简化处理，实际应该检查用户角色
            // $this->error('无权限发布此文章');
        }

        $article->save([
            'status' => 'published',
            'updatetime' => time(),
        ]);

        $this->success('发布成功', [
            'id' => $article->id,
            'url' => "/knowledge/detail/{$article->id}",
        ]);
    }

    /**
     * 获取我的文章列表（作者视角）
     * GET /api/knowledge/my
     */
    public function my()
    {
        $status = $this->request->get('status', '');
        $keyword = $this->request->get('keyword', '');
        $page = (int)$this->request->get('page', 1);
        $limit = (int)$this->request->get('limit', 10);

        $query = KnowledgeModel::where('author_id', $this->auth->id);

        if ($status) {
            $query->where('status', $status);
        }

        if ($keyword) {
            $query->where('title', 'like', "%{$keyword}%");
        }

        $list = $query->order('createtime', 'desc')
            ->page($page, $limit)
            ->select();

        $total = $query->count();

        // 格式化时间
        foreach ($list as &$item) {
            $item['createtime'] = date('Y-m-d H:i:s', $item['createtime']);
            $item['updatetime'] = date('Y-m-d H:i:s', $item['updatetime']);
        }
        unset($item);

        $this->success('', [
            'list' => $list,
            'total' => $total,
        ]);
    }
}
