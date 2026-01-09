

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { familyService, FamilyMember, FamilyRole } from '../../services/family';
import { useToast } from '../../components/Toast';
import styles from './styles.module.css';

interface InviteFormData {
  name: string; // 用于显示，实际API可能不需要
  role: FamilyRole;
  contact: string; // 手机号或邮箱
}

interface EditFormData {
  name: string;
  role: 'parent' | 'child';
}

const FamilyManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  
  // 模态框状态
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 表单数据
  const [inviteFormData, setInviteFormData] = useState<InviteFormData>({
    name: '',
    role: 'parent',
    contact: ''
  });

  const [addChildFormData, setAddChildFormData] = useState({
    nickname: '',
    gender: 1, // 1: Male, 2: Female
    birthday: '',
    avatar: ''
  });
  
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    role: 'parent'
  });
  
  const [currentEditMemberId, setCurrentEditMemberId] = useState<number | null>(null);
  const [currentRemoveMember, setCurrentRemoveMember] = useState<FamilyMember | null>(null);
  
  // 家庭成员数据
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  
  // 权限设置状态
  const [parentPermissions, setParentPermissions] = useState({
    taskSuggest: true,
    taskConfirm: true,
    wishReview: true,
    viewReport: true
  });
  
  const [childPermissions, setChildPermissions] = useState({
    createTask: true,
    createWish: true,
    viewHonor: true,
    viewEnergy: true
  });
  
  // 全局搜索
  const [globalSearchValue, setGlobalSearchValue] = useState('');


  // 获取家庭信息
  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const res = await familyService.getFamilyInfo();
      if (res.has_family && res.family) {
        setFamilyMembers(res.family.members);
        // Load settings if available
        if (res.family.settings) {
          if (res.family.settings.parentPermissions) {
            setParentPermissions(res.family.settings.parentPermissions);
          }
          if (res.family.settings.childPermissions) {
            setChildPermissions(res.family.settings.childPermissions);
          }
        }
      }
    } catch (err: any) {
      console.error('获取家庭信息失败', err);
      setError(err.message || '获取家庭信息失败');
      showError('获取家庭信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 设置页面标题并加载数据
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '家庭管理 - 星火计划';
    
    fetchFamilyData();

    return () => {
      document.title = originalTitle;
    };
  }, []);

  const handleSidebarItemClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', globalSearchValue);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await familyService.inviteByContact({
        contact: inviteFormData.contact,
        role: inviteFormData.role
      });
      
      setInviteFormData({
        name: '',
        role: 'parent',
        contact: ''
      });
      setShowInviteModal(false);
      fetchFamilyData();
      success('邀请已发送');
    } catch (err: any) {
      showError(err.message || '邀请失败');
    }
  };

  const handleAddChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!addChildFormData.nickname) {
        warning('请输入孩子昵称');
        return;
      }

      await familyService.createChild({
        nickname: addChildFormData.nickname,
        gender: addChildFormData.gender,
        birthday: addChildFormData.birthday || undefined,
        avatar: addChildFormData.avatar
      });
      
      setAddChildFormData({
        nickname: '',
        gender: 1,
        birthday: '',
        avatar: ''
      });
      setShowAddChildModal(false);
      fetchFamilyData();
      success('孩子账号创建成功！');
    } catch (err: any) {
      showError(err.message || '创建失败');
    }
  };

  // 处理编辑成员
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditMemberId) return;

    try {
      await familyService.updateMember({
        user_id: currentEditMemberId,
        nickname: editFormData.name,
        role: editFormData.role
      });
      
      setShowEditModal(false);
      setCurrentEditMemberId(null);
      fetchFamilyData();
      success('成员信息已更新');
    } catch (err: any) {
      showError(err.message || '更新失败');
    }
  };

  const handleRemoveConfirm = async () => {
    if (!currentRemoveMember) return;
    
    try {
      await familyService.removeMember({ user_id: currentRemoveMember.user_id });
      setShowRemoveModal(false);
      setCurrentRemoveMember(null);
      fetchFamilyData();
    } catch (err: any) {
      showError(err.message || '移除失败');
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // 处理保存权限设置
  const handleSavePermissions = async () => {
    try {
      await familyService.updateSettings({
        parentPermissions,
        childPermissions
      });
      success('权限设置已保存！');
    } catch (err: any) {
      showError(err.message || '保存失败');
    }
  };

  // 模态框背景点击处理
  const handleModalBackdropClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
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
                <Link 
                  to="/parent-dashboard" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/parent-dashboard')}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>仪表盘</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/task-list" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/task-list')}
                >
                  <i className="fas fa-tasks w-5"></i>
                  <span>任务</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/wish-list" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/wish-list')}
                >
                  <i className="fas fa-heart w-5"></i>
                  <span>心愿</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/family-honor-wall" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/family-honor-wall')}
                >
                  <i className="fas fa-trophy w-5"></i>
                  <span>家庭荣誉墙</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/growth-report" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/growth-report')}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>成长报告</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/knowledge-base" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/knowledge-base')}
                >
                  <i className="fas fa-book w-5"></i>
                  <span>知识库</span>
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '#')}
                >
                  <i className="fas fa-users w-5"></i>
                  <span>家庭管理</span>
                </a>
              </li>
              <li>
                <Link 
                  to="/user-profile" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/user-profile')}
                >
                  <i className="fas fa-user w-5"></i>
                  <span>个人资料</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className={`${styles.sidebarItem} flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 transition-all`}
                  onClick={(e) => handleSidebarItemClick(e, '/settings')}
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
          {error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl shadow-card p-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-exclamation-triangle text-2xl text-danger"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">加载失败</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => fetchFamilyData()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                重试
              </button>
            </div>
          ) : (
            <>
          {/* 页面头部 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">家庭管理</h2>
                <nav className="text-sm text-text-secondary">
                  <span>家庭管理</span>
                </nav>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowAddChildModal(true)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  <i className="fas fa-child mr-2"></i>添加孩子
                </button>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-user-plus mr-2"></i>邀请成员
                </button>
              </div>
            </div>
          </div>

          {/* 家庭成员列表 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">家庭成员</h3>
                <span className="text-sm text-text-secondary">共{familyMembers.length}位成员</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">头像</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">昵称</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">角色</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">加入时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-4">加载中...</td></tr>
                    ) : familyMembers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4">暂无家庭成员</td></tr>
                    ) : familyMembers.map((member) => (
                      <tr key={member.id} className={`${styles.tableRow} ${familyMembers.indexOf(member) < familyMembers.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <td className="py-3 px-4">
                          <img 
                            src={member.avatar || 'https://s.coze.cn/image/R7Mxp378zzc/'} 
                            alt={member.nickname} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-medium text-text-primary">{member.nickname}</span>
                            {member.is_creator && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full border border-yellow-200">户主</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            member.role === 'parent' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {member.role === 'parent' ? '家长' : '孩子'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">{formatDate(member.joined_at)}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setCurrentEditMemberId(member.user_id);
                                setEditFormData({
                                  name: member.nickname,
                                  role: member.role
                                });
                                setShowEditModal(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                              title="编辑"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {!member.is_creator && (
                              <button 
                                onClick={() => {
                                  setCurrentRemoveMember(member);
                                  setShowRemoveModal(true);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="移除"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 权限设置区 */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">权限设置</h3>
                <button 
                  onClick={handleSavePermissions}
                  className={`${styles.btnGradient} text-white px-4 py-2 rounded-lg text-sm font-medium`}
                >
                  <i className="fas fa-save mr-2"></i>保存设置
                </button>
              </div>
              
              {/* 家长权限 */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-text-primary mb-4 flex items-center">
                  <i className="fas fa-user-tie text-blue-500 mr-2"></i>家长权限
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">任务建议权限</p>
                      <p className="text-sm text-text-secondary">向孩子发布任务建议</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={parentPermissions.taskSuggest}
                        onChange={(e) => setParentPermissions(prev => ({ ...prev, taskSuggest: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">任务确认权限</p>
                      <p className="text-sm text-text-secondary">确认孩子创建的任务</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={parentPermissions.taskConfirm}
                        onChange={(e) => setParentPermissions(prev => ({ ...prev, taskConfirm: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">心愿审核权限</p>
                      <p className="text-sm text-text-secondary">审核孩子的心愿申请</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={parentPermissions.wishReview}
                        onChange={(e) => setParentPermissions(prev => ({ ...prev, wishReview: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">查看成长报告</p>
                      <p className="text-sm text-text-secondary">查看孩子的详细成长报告</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={parentPermissions.viewReport}
                        onChange={(e) => setParentPermissions(prev => ({ ...prev, viewReport: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* 孩子权限 */}
              <div>
                <h4 className="text-md font-medium text-text-primary mb-4 flex items-center">
                  <i className="fas fa-child text-green-500 mr-2"></i>孩子权限
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">创建任务权限</p>
                      <p className="text-sm text-text-secondary">自主创建和管理个人任务</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={childPermissions.createTask}
                        onChange={(e) => setChildPermissions(prev => ({ ...prev, createTask: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">创建心愿权限</p>
                      <p className="text-sm text-text-secondary">创建和管理个人心愿清单</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={childPermissions.createWish}
                        onChange={(e) => setChildPermissions(prev => ({ ...prev, createWish: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">查看荣誉墙</p>
                      <p className="text-sm text-text-secondary">查看家庭荣誉墙和个人成就</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={childPermissions.viewHonor}
                        onChange={(e) => setChildPermissions(prev => ({ ...prev, viewHonor: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">查看能量值</p>
                      <p className="text-sm text-text-secondary">查看个人能量值和徽章</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={childPermissions.viewEnergy}
                        onChange={(e) => setChildPermissions(prev => ({ ...prev, viewEnergy: e.target.checked }))}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
            </>
          )}
        </main>
      </div>

      {/* 邀请成员弹窗 */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={(e) => handleModalBackdropClick(e, () => setShowInviteModal(false))}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-2xl shadow-gradient p-6 w-full max-w-md ${styles.modalEnter}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">邀请家庭成员</h3>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label htmlFor="invite-contact" className="block text-sm font-medium text-text-primary mb-2">手机号或邮箱</label>
                  <input 
                    type="text" 
                    id="invite-contact" 
                    name="contact" 
                    value={inviteFormData.contact}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder="请输入手机号或邮箱"
                  />
                </div>
                <div>
                  <label htmlFor="invite-role" className="block text-sm font-medium text-text-primary mb-2">角色</label>
                  <select 
                    id="invite-role" 
                    name="role" 
                    value={inviteFormData.role}
                    onChange={(e) => setInviteFormData(prev => ({ ...prev, role: e.target.value as 'parent' | 'child' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="parent">家长</option>
                    <option value="child">孩子</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-primary transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className={`flex-1 ${styles.btnGradient} text-white px-4 py-2 rounded-lg font-medium`}
                  >
                    发送邀请
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 添加孩子弹窗 */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={(e) => handleModalBackdropClick(e, () => setShowAddChildModal(false))}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-2xl shadow-gradient p-6 w-full max-w-md ${styles.modalEnter}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">添加孩子账号</h3>
                <button 
                  onClick={() => setShowAddChildModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handleAddChildSubmit} className="space-y-4">
                <div>
                  <label htmlFor="child-nickname" className="block text-sm font-medium text-text-primary mb-2">孩子昵称</label>
                  <input 
                    type="text" 
                    id="child-nickname" 
                    name="nickname" 
                    value={addChildFormData.nickname}
                    onChange={(e) => setAddChildFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder="请输入孩子昵称"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="child-gender" className="block text-sm font-medium text-text-primary mb-2">性别</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={1} 
                        checked={addChildFormData.gender === 1}
                        onChange={() => setAddChildFormData(prev => ({ ...prev, gender: 1 }))}
                        className="text-primary focus:ring-primary"
                      />
                      <span>男</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={2} 
                        checked={addChildFormData.gender === 2}
                        onChange={() => setAddChildFormData(prev => ({ ...prev, gender: 2 }))}
                        className="text-primary focus:ring-primary"
                      />
                      <span>女</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="child-birthday" className="block text-sm font-medium text-text-primary mb-2">生日</label>
                  <input 
                    type="date" 
                    id="child-birthday" 
                    name="birthday" 
                    value={addChildFormData.birthday}
                    onChange={(e) => setAddChildFormData(prev => ({ ...prev, birthday: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddChildModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-primary transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className={`flex-1 ${styles.btnGradient} text-white px-4 py-2 rounded-lg font-medium`}
                  >
                    创建账号
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 编辑成员弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 z-50">
          <div className={styles.modalBackdrop} onClick={(e) => handleModalBackdropClick(e, () => setShowEditModal(false))}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`bg-white rounded-2xl shadow-gradient p-6 w-full max-w-md ${styles.modalEnter}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">编辑成员信息</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-text-primary mb-2">成员昵称</label>
                  <input 
                    type="text" 
                    id="edit-name" 
                    name="name" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    placeholder="请输入成员昵称"
                  />
                </div>
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-text-primary mb-2">角色</label>
                  <select 
                    id="edit-role" 
                    name="role" 
                    value={editFormData.role}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value as 'parent' | 'child' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="parent">家长</option>
                    <option value="child">孩子</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-primary transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className={`flex-1 ${styles.btnGradient} text-white px-4 py-2 rounded-lg font-medium`}
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-danger text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认移除成员？</h3>
              <p className="text-gray-500 text-sm">
                确定要移除 "{currentRemoveMember?.nickname}" 吗？此操作无法撤销。
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRemoveConfirm}
                className="flex-1 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagePage;

