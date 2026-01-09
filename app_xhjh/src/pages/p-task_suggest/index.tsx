

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { taskService } from '../../services/task';
import { Header } from '../../components/Header';
import { useToast } from '../../components/Toast';

interface FormData {
  childSelect: string;
  taskName: string;
  taskCategory: string;
  taskDescription: string;
  taskGoal: string;
  targetDate: string;
  energyPoints: string;
}

interface FormErrors {
  childSelect: boolean;
  taskName: boolean;
  taskCategory: boolean;
  taskDescription: boolean;
  taskGoal: boolean;
  targetDate: boolean;
  energyPoints: boolean;
}

const TaskSuggestPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { currentChild, familyMembers, refreshFamilyMembers } = useFamilyStore();
  const { error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('nav-tasks');

  // Load family members if not available
  useEffect(() => {
    if (familyMembers.length === 0) {
        refreshFamilyMembers();
    }
  }, [familyMembers.length, refreshFamilyMembers]);

  // Set default child if currentChild is selected
  useEffect(() => {
      if (currentChild && !formData.childSelect) {
          setFormData(prev => ({ ...prev, childSelect: String(currentChild.user_id) }));
      }
  }, [currentChild]);

  const [formData, setFormData] = useState<FormData>({
    childSelect: '',
    taskName: '',
    taskCategory: '',
    taskDescription: '',
    taskGoal: '',
    targetDate: '',
    energyPoints: '10'
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    childSelect: false,
    taskName: false,
    taskCategory: false,
    taskDescription: false,
    taskGoal: false,
    targetDate: false,
    energyPoints: false
  });

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '建议任务 - 星火计划';
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    // 设置默认日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const targetDateInput = document.querySelector('#target-date') as HTMLInputElement;
    if (targetDateInput) {
      targetDateInput.min = tomorrowStr;
    }
  }, []);

  const handleSidebarItemClick = (itemId: string, href: string) => {
    setActiveSidebarItem(itemId);
    if (href !== '#') {
      navigate(href);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 实时验证
    if (field === 'taskDescription' && value.length <= 500) {
      setFormErrors(prev => ({ ...prev, taskDescription: false }));
    }
    if (field === 'taskGoal' && value.length <= 200) {
      setFormErrors(prev => ({ ...prev, taskGoal: false }));
    }
    if (field === 'energyPoints') {
      const energyValue = parseInt(value);
      if (energyValue >= 1 && energyValue <= 1000) {
        setFormErrors(prev => ({ ...prev, energyPoints: false }));
      }
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      childSelect: false,
      taskName: false,
      taskCategory: false,
      taskDescription: false,
      taskGoal: false,
      targetDate: false,
      energyPoints: false
    };

    // 验证孩子选择
    if (!formData.childSelect.trim()) {
      newErrors.childSelect = true;
      isValid = false;
    }

    // 验证任务名称
    if (!formData.taskName.trim()) {
      newErrors.taskName = true;
      isValid = false;
    }

    // 验证任务分类
    if (!formData.taskCategory.trim()) {
      newErrors.taskCategory = true;
      isValid = false;
    }

    // 验证任务描述长度
    if (formData.taskDescription.length > 500) {
      newErrors.taskDescription = true;
      isValid = false;
    }

    // 验证任务目标长度
    if (formData.taskGoal.length > 200) {
      newErrors.taskGoal = true;
      isValid = false;
    }

    // 验证计划完成时间
    if (formData.targetDate) {
      const selectedDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.targetDate = true;
        isValid = false;
      }
    }

    // 验证能量值
    const energyValue = parseInt(formData.energyPoints);
    if (energyValue < 1 || energyValue > 1000) {
      newErrors.energyPoints = true;
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        await taskService.suggestTask({
          task_name: formData.taskName,
          description: formData.taskDescription + (formData.taskGoal ? `\n\n目标: ${formData.taskGoal}` : ''),
          category: formData.taskCategory as any, // TaskCategory type needs to be imported or cast
          target_date: formData.targetDate,
          energy_value: parseInt(formData.energyPoints),
          assignee_user_id: Number(formData.childSelect)
        });

        setShowSuccessMessage(true);
        
        // 3秒后跳转到任务列表页
        setTimeout(() => {
          navigate('/task-list');
        }, 3000);
      } catch (error: any) {
        console.error('Suggest task failed:', error);
        showError(error.message || '建议任务失败，请稍后重试');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (confirm('确定要取消吗？未保存的内容将丢失。')) {
      navigate('/task-list');
    }
  };

  const handleTaskDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleInputChange('taskDescription', value);
    if (value.length > 500) {
      setFormErrors(prev => ({ ...prev, taskDescription: true }));
    }
  };

  const handleTaskGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleInputChange('taskGoal', value);
    if (value.length > 200) {
      setFormErrors(prev => ({ ...prev, taskGoal: true }));
    }
  };

  const handleEnergyPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange('energyPoints', value);
    const energyValue = parseInt(value);
    if (energyValue < 1 || energyValue > 1000) {
      setFormErrors(prev => ({ ...prev, energyPoints: true }));
    }
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
                <button 
                  onClick={() => handleSidebarItemClick('nav-dashboard', '/parent-dashboard')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-dashboard' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>仪表盘</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-tasks', '/task-list')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-tasks' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all w-full text-left`}
                >
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-wishes', '/wish-list')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-wishes' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-heart w-5"></i>
                  <span>心愿</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-honor-wall', '/family-honor-wall')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-honor-wall' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>家庭荣誉墙</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-growth-report', '/growth-report')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-growth-report' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>成长报告</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-knowledge', '/knowledge-base')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-knowledge' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-book w-5"></i>
                  <span>知识库</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-family-manage', '/family-manage')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-family-manage' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-users w-5"></i>
                  <span>家庭管理</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-profile', '/user-profile')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-profile' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-user w-5"></i>
                  <span>个人资料</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSidebarItemClick('nav-settings', '/settings')}
                  className={`${styles.sidebarItem} ${activeSidebarItem === 'nav-settings' ? styles.sidebarItemActive : ''} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all w-full text-left`}
                >
                  <i className="fas fa-cog w-5"></i>
                  <span>设置</span>
                </button>
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">建议任务</h2>
                <nav className="text-sm text-text-secondary">
                  <Link to="/parent-dashboard" className="hover:text-primary">仪表盘</Link>
                  <span className="mx-2">/</span>
                  <Link to="/task-list" className="hover:text-primary">任务</Link>
                  <span className="mx-2">/</span>
                  <span>建议任务</span>
                </nav>
              </div>
            </div>
          </div>

          {/* 任务建议表单 */}
          <section className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">为孩子推荐任务</h3>
                <p className="text-sm text-text-secondary">创建任务建议，帮助孩子更好地成长和学习</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* 选择孩子 */}
                <div className="space-y-2">
                  <label htmlFor="child-select" className={styles.formLabel}>选择孩子 *</label>
                  <select 
                    id="child-select" 
                    name="child-select"
                    value={formData.childSelect}
                    onChange={(e) => handleInputChange('childSelect', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                    required
                  >
                    <option value="">请选择孩子</option>
                    {familyMembers.map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.nickname || '未命名'}
                      </option>
                    ))}
                  </select>
                  {formErrors.childSelect && (
                    <div className={styles.formError}>请选择要建议任务的孩子</div>
                  )}
                </div>

                {/* 任务名称 */}
                <div className="space-y-2">
                  <label htmlFor="task-name" className={styles.formLabel}>任务名称 *</label>
                  <input 
                    type="text" 
                    id="task-name" 
                    name="task-name"
                    value={formData.taskName}
                    onChange={(e) => handleInputChange('taskName', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入任务名称" 
                    required
                  />
                  {formErrors.taskName && (
                    <div className={styles.formError}>任务名称不能为空</div>
                  )}
                </div>

                {/* 任务分类 */}
                <div className="space-y-2">
                  <label htmlFor="task-category" className={styles.formLabel}>任务分类 *</label>
                  <select 
                    id="task-category" 
                    name="task-category"
                    value={formData.taskCategory}
                    onChange={(e) => handleInputChange('taskCategory', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                    required
                  >
                    <option value="">请选择任务分类</option>
                    <option value="habit">习惯养成</option>
                    <option value="learning">学习探索</option>
                    <option value="skill">兴趣技能</option>
                    <option value="family">家庭贡献</option>
                  </select>
                  {formErrors.taskCategory && (
                    <div className={styles.formError}>请选择任务分类</div>
                  )}
                </div>

                {/* 任务描述 */}
                <div className="space-y-2">
                  <label htmlFor="task-description" className={styles.formLabel}>任务描述</label>
                  <textarea 
                    id="task-description" 
                    name="task-description" 
                    rows={3}
                    value={formData.taskDescription}
                    onChange={handleTaskDescriptionChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} resize-none`}
                    placeholder="请描述任务的具体内容和要求"
                  />
                  {formErrors.taskDescription && (
                    <div className={styles.formError}>任务描述不能超过500字</div>
                  )}
                </div>

                {/* 任务目标 */}
                <div className="space-y-2">
                  <label htmlFor="task-goal" className={styles.formLabel}>任务目标</label>
                  <textarea 
                    id="task-goal" 
                    name="task-goal" 
                    rows={2}
                    value={formData.taskGoal}
                    onChange={handleTaskGoalChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus} resize-none`}
                    placeholder="完成这个任务希望达到的目标"
                  />
                  {formErrors.taskGoal && (
                    <div className={styles.formError}>任务目标不能超过200字</div>
                  )}
                </div>

                {/* 计划完成时间 */}
                <div className="space-y-2">
                  <label htmlFor="target-date" className={styles.formLabel}>计划完成时间</label>
                  <input 
                    type="date" 
                    id="target-date" 
                    name="target-date"
                    value={formData.targetDate}
                    onChange={(e) => handleInputChange('targetDate', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                  />
                  {formErrors.targetDate && (
                    <div className={styles.formError}>计划完成时间不能早于今天</div>
                  )}
                </div>

                {/* 建议能量值 */}
                <div className="space-y-2">
                  <label htmlFor="energy-points" className={styles.formLabel}>建议能量值</label>
                  <input 
                    type="number" 
                    id="energy-points" 
                    name="energy-points" 
                    min="1" 
                    max="1000" 
                    value={formData.energyPoints}
                    onChange={handleEnergyPointsChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${styles.formInputFocus}`}
                    placeholder="完成任务可获得的能量值"
                  />
                  {formErrors.energyPoints && (
                    <div className={styles.formError}>能量值必须在1-1000之间</div>
                  )}
                </div>

                {/* 操作按钮区 */}
                <div className="flex space-x-4 pt-6">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`${styles.btnGradient} text-white px-8 py-3 rounded-lg text-sm font-medium flex items-center`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        提交中...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        提交建议
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                  >
                    取消
                  </button>
                </div>

                {/* 成功提示 */}
                {showSuccessMessage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-6">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span className="text-green-800 font-medium">任务建议已提交！</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">孩子将收到您的任务建议，等待孩子的回复。</p>
                  </div>
                )}
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TaskSuggestPage;

