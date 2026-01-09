

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { taskService, TaskCategory } from '../../services/task';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { Header } from '../../components/Header';
import { useToast } from '../../components/Toast';
import styles from './styles.module.css';

interface TaskFormData {
  name: string;
  description: string;
  goal: string;
  category: string;
  targetDate: string;
  energy: string;
  child: string;
}

interface FormErrors {
  name: boolean;
  category: boolean;
  child: boolean;
}

const TaskCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userInfo } = useAuthStore();
  const { currentChild, familyMembers } = useFamilyStore();
  const { success, error: showError } = useToast();
  
  const taskId = searchParams.get('taskId');
  const mode = searchParams.get('mode');
  
  const isEditMode = Boolean(taskId);
  const isSuggestMode = mode === 'suggest';

  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    goal: '',
    category: '',
    targetDate: '',
    energy: '20',
    child: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: false,
    category: false,
    child: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '创建任务 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    if (isSuggestMode && currentChild && !formData.child) {
      setFormData(prev => ({ ...prev, child: String(currentChild.user_id) }));
    }
  }, [isSuggestMode, currentChild]);

  useEffect(() => {
    if (isEditMode && taskId) {
      loadTaskData(taskId);
    }
  }, [isEditMode, taskId]);

  const loadTaskData = async (taskId: string) => {
    try {
      const task = await taskService.getTaskDetail(Number(taskId));
      setFormData({
        name: task.task_name,
        description: task.description || '',
        goal: '', // Backend doesn't have goal field yet, use description
        category: task.category,
        targetDate: task.target_date ? task.target_date.split(' ')[0] : '',
        energy: String(task.energy_value || 0),
        child: String(task.assignee_user_id || '')
      });
    } catch (error) {
      console.error('Failed to load task:', error);
      showError('加载任务失败');
      navigate('/task-list');
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误状态
    if (field in formErrors) {
      setFormErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleInputBlur = (field: keyof FormErrors) => {
    if (!formData[field as keyof TaskFormData]?.trim()) {
      setFormErrors(prev => ({ ...prev, [field]: true }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      name: !formData.name.trim(),
      category: !formData.category.trim(),
      child: isSuggestMode && !formData.child.trim()
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && taskId) {
        await taskService.updateTask({
          id: Number(taskId),
          task_name: formData.name,
          description: formData.description,
          category: formData.category as TaskCategory,
          target_date: formData.targetDate,
          energy_value: Number(formData.energy)
        });
        success('任务修改成功！');
      } else if (isSuggestMode) {
        await taskService.suggestTask({
          task_name: formData.name,
          description: formData.description,
          category: formData.category as TaskCategory,
          target_date: formData.targetDate,
          assignee_user_id: Number(formData.child) // Assume child ID is selected
        });
        success('任务建议发布成功！');
      } else {
        await taskService.createTask({
          task_name: formData.name,
          description: formData.description,
          category: formData.category as TaskCategory,
          target_date: formData.targetDate,
          assignee_user_id: formData.child ? Number(formData.child) : undefined
        });
        success('任务创建成功！');
      }
      navigate('/task-list');
    } catch (error: any) {
      console.error('Submit failed:', error);
      showError(error.message || '提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('确定要取消吗？未保存的更改将丢失。')) {
      navigate('/task-list');
    }
  };

  const getPageTitle = () => {
    if (isEditMode) return '编辑任务';
    if (isSuggestMode) return '建议任务';
    return '创建任务';
  };

  const getSubmitText = () => {
    if (isEditMode) return '保存修改';
    if (isSuggestMode) return '发布建议';
    return '创建任务';
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <Header />

      <div className="flex pt-16">
        {/* 左侧菜单 */}
        <aside className="fixed left-0 top-16 bottom-0 w-60 bg-sidebar-gradient shadow-lg overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/parent-dashboard" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>仪表盘</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/task-list" 
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
                >
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/wish-list" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-heart w-5"></i>
                  <span>心愿</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/family-honor-wall" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>家庭荣誉墙</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/growth-report" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>成长报告</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/knowledge-base" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-book w-5"></i>
                  <span>知识库</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/family-manage" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-users w-5"></i>
                  <span>家庭管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/user-profile" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-user w-5"></i>
                  <span>个人资料</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                >
                  <i className="fas fa-cog w-5"></i>
                  <span>设置</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 ml-60 p-6">
          {/* 页面头部 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">{getPageTitle()}</h2>
                <nav className="text-sm text-text-secondary">
                  <Link to="/task-list" className="hover:text-primary">任务</Link>
                  <span className="mx-2">/</span>
                  <span>{getPageTitle()}</span>
                </nav>
              </div>
            </div>
          </div>

          {/* 表单区域 */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 任务名称 */}
                <div className="space-y-2">
                  <label htmlFor="task-name" className="block text-sm font-medium text-text-primary">
                    任务名称 <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="task-name" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleInputBlur('name')}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} ${formErrors.name ? styles.formError : ''}`}
                    placeholder="请输入任务名称" 
                    required 
                  />
                  {formErrors.name && (
                    <div className={styles.errorMessage}>任务名称不能为空</div>
                  )}
                </div>

                {/* 任务描述 */}
                <div className="space-y-2">
                  <label htmlFor="task-description" className="block text-sm font-medium text-text-primary">
                    任务描述
                  </label>
                  <textarea 
                    id="task-description" 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} resize-none`}
                    placeholder="请描述任务的具体内容和要求"
                  />
                </div>

                {/* 任务目标 */}
                <div className="space-y-2">
                  <label htmlFor="task-goal" className="block text-sm font-medium text-text-primary">
                    任务目标
                  </label>
                  <textarea 
                    id="task-goal" 
                    rows={2}
                    value={formData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} resize-none`}
                    placeholder="完成这个任务希望达到什么目标"
                  />
                </div>

                {/* 任务分类 */}
                <div className="space-y-2">
                  <label htmlFor="task-category" className="block text-sm font-medium text-text-primary">
                    任务分类 <span className="text-danger">*</span>
                  </label>
                  <select 
                    id="task-category" 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    onBlur={() => handleInputBlur('category')}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} ${formErrors.category ? styles.formError : ''}`}
                    required
                  >
                    <option value="">请选择任务分类</option>
                    <option value="habit">习惯养成</option>
                    <option value="learning">学习探索</option>
                    <option value="skill">兴趣技能</option>
                    <option value="family">家庭贡献</option>
                  </select>
                  {formErrors.category && (
                    <div className={styles.errorMessage}>请选择任务分类</div>
                  )}
                </div>

                {/* 计划完成时间 */}
                <div className="space-y-2">
                  <label htmlFor="task-target-date" className="block text-sm font-medium text-text-primary">
                    计划完成时间
                  </label>
                  <input 
                    type="date" 
                    id="task-target-date" 
                    value={formData.targetDate}
                    onChange={(e) => handleInputChange('targetDate', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                  />
                </div>

                {/* 能量值设置（仅家长可见） */}
                {isSuggestMode && (
                  <div className="space-y-2">
                    <label htmlFor="task-energy" className="block text-sm font-medium text-text-primary">
                      能量值奖励
                    </label>
                    <select 
                      id="task-energy" 
                      value={formData.energy}
                      onChange={(e) => handleInputChange('energy', e.target.value)}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                    >
                      <option value="10">10 能量值</option>
                      <option value="20">20 能量值</option>
                      <option value="30">30 能量值</option>
                      <option value="50">50 能量值</option>
                      <option value="100">100 能量值</option>
                    </select>
                  </div>
                )}

                {/* 选择孩子（仅家长建议任务时可见） */}
                {isSuggestMode && (
                  <div className="space-y-2">
                    <label htmlFor="task-child" className="block text-sm font-medium text-text-primary">
                      分配给 <span className="text-danger">*</span>
                    </label>
                    <select 
                      id="task-child" 
                      value={formData.child}
                      onChange={(e) => handleInputChange('child', e.target.value)}
                      onBlur={() => handleInputBlur('child')}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} ${formErrors.child ? styles.formError : ''}`}
                    >
                      <option value="">请选择孩子</option>
                      {familyMembers.map(member => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.nickname || '未命名'}
                        </option>
                      ))}
                    </select>
                    {formErrors.child && (
                      <div className={styles.errorMessage}>请选择要分配的孩子</div>
                    )}
                  </div>
                )}

                {/* 操作按钮区 */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`${styles.btnGradient} text-white px-6 py-3 rounded-lg font-medium`}
                  >
                    <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                    <span>{isSubmitting ? '处理中...' : getSubmitText()}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskCreatePage;

