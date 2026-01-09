<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Notification as NotificationModel;
use think\Db;

/**
 * 通知接口
 */
class Notification extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    /**
     * 获取通知列表
     */
    public function list()
    {
        $type   = $this->request->get('type', '');
        $status = $this->request->get('status', '');
        $page   = (int)$this->request->get('page', 1);
        $limit  = (int)$this->request->get('limit', 10);

        try {
            $query = NotificationModel::where('user_id', $this->auth->id);

            if ($type !== '') {
                $query->where('type', $type);
            }

            if ($status !== '') {
                $query->where('status', $status);
            }

            $list = $query->order('id', 'desc')
                ->page($page, $limit)
                ->select();

            $total = $query->count();
            
            // 格式化返回数据以匹配前端接口
            $formattedList = [];
            foreach ($list as $item) {
                $formattedList[] = [
                    'id'        => $item['id'],
                    'type'      => $item['type'],
                    'title'     => $item['title'],
                    'content'   => $item['content'],
                    'status'    => $item['status'],
                    'relatedId' => $item['related_id'],
                    'createdAt' => date('Y-m-d H:i:s', $item['createtime']),
                    'readAt'    => $item['readtime'] ? date('Y-m-d H:i:s', $item['readtime']) : null,
                ];
            }

            $this->success('', [
                'list'  => $formattedList,
                'total' => $total,
            ]);
        } catch (\think\exception\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            // 如果表不存在，返回空列表
            $this->success('', [
                'list'  => [],
                'total' => 0,
            ]);
        }
    }

    /**
     * 标记为已读
     */
    public function read()
    {
        $ids = $this->request->post('ids/a');
        if (empty($ids)) {
            $this->error('参数错误');
        }

        try {
            NotificationModel::where('id', 'in', $ids)
                ->where('user_id', $this->auth->id)
                ->update([
                    'status' => 'read',
                    'readtime' => time()
                ]);
            $this->success();
        } catch (\think\exception\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            $this->error('操作失败');
        }
    }

    /**
     * 删除通知
     */
    public function delete()
    {
        $ids = $this->request->post('ids/a');
        if (empty($ids)) {
            $this->error('参数错误');
        }

        try {
            NotificationModel::where('id', 'in', $ids)
                ->where('user_id', $this->auth->id)
                ->delete();
            $this->success();
        } catch (\Exception $e) {
            $this->error('操作失败');
        }
    }

    /**
     * 获取未读数量
     */
    public function unreadCount()
    {
        try {
            $count = NotificationModel::where('user_id', $this->auth->id)
                ->where('status', 'unread')
                ->count();
            $this->success('', ['count' => $count]);
        } catch (\think\exception\HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            $this->success('', ['count' => 0]);
        }
    }
}
